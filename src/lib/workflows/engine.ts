import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

export interface WorkflowNode {
  id: string;
  type: 'api_call' | 'transform' | 'condition' | 'loop' | 'delay' | 'webhook_trigger' | 'schedule_trigger' | 'error_handler';
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  triggerData: any;
  nodeResults: Map<string, NodeResult>;
  variables: Record<string, any>;
}

export interface NodeResult {
  nodeId: string;
  status: 'completed' | 'failed' | 'skipped';
  output: any;
  error?: any;
  duration: number;
}

export interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed' | 'cancelled';
  duration: number;
  nodeResults: NodeResult[];
  error?: string;
}

/**
 * Workflow execution engine
 */
export class WorkflowEngine {
  private supabase = createAdminClient();

  /**
   * Execute a workflow
   */
  async execute(workflowId: string, triggerData?: any): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Create execution record
    const { data: execution, error: execError } = await this.supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        trigger_type: triggerData ? 'manual' : 'schedule',
        trigger_data: triggerData,
        status: 'running',
      })
      .select()
      .single();

    if (execError || !execution) {
      throw new Error('Failed to create execution record');
    }

    try {
      // Fetch workflow definition
      const { data: workflow } = await this.supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const nodes: WorkflowNode[] = (workflow.nodes as WorkflowNode[] | null) ?? [];
      const edges: WorkflowEdge[] = (workflow.edges as WorkflowEdge[] | null) ?? [];

      // Topologically sort nodes
      const sortedNodes = this.topologicalSort(nodes, edges);

      // Create execution context
      const context: ExecutionContext = {
        workflowId,
        executionId: execution.id,
        triggerData: triggerData || {},
        nodeResults: new Map(),
        variables: {},
      };

      const results: NodeResult[] = [];

      // Execute nodes in order
      for (const node of sortedNodes) {
        const result = await this.executeNode(node, context);
        results.push(result);
        context.nodeResults.set(node.id, result);

        // Stop if node failed and no error handler
        if (result.status === 'failed') {
          const hasErrorHandler = edges.some(
            (e) => e.source === node.id && nodes.find((n) => n.id === e.target)?.type === 'error_handler'
          );
          if (!hasErrorHandler) {
            break;
          }
        }
      }

      const duration = Date.now() - startTime;
      const failed = results.some((r) => r.status === 'failed');

      // Update execution record
      await this.supabase
        .from('workflow_executions')
        .update({
          status: failed ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        })
        .eq('id', execution.id);

      // Update workflow last_executed_at
      await this.supabase
        .from('workflow_definitions')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: (workflow.execution_count ?? 0) + 1,
        })
        .eq('id', workflowId);

      return {
        executionId: execution.id,
        status: failed ? 'failed' : 'completed',
        duration,
        nodeResults: results,
      };
    } catch (error: any) {
      logger.error('Workflow execution error', { error, workflowId, executionId: execution.id });

      await this.supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          error_message: error.message,
        })
        .eq('id', execution.id);

      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowNode, context: ExecutionContext): Promise<NodeResult> {
    const startTime = Date.now();

    // Store step record
    const { data: step } = await this.supabase
      .from('workflow_step_results')
      .insert({
        execution_id: context.executionId,
        node_id: node.id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      let output: any;

      switch (node.type) {
        case 'api_call':
          output = await this.executeApiCall(node, context);
          break;
        case 'transform':
          output = await this.executeTransform(node, context);
          break;
        case 'condition':
          output = await this.executeCondition(node, context);
          break;
        case 'delay':
          output = await this.executeDelay(node);
          break;
        default:
          output = { skipped: true };
      }

      const duration = Date.now() - startTime;

      // Update step record
      if (step) {
        await this.supabase
          .from('workflow_step_results')
          .update({
            status: 'completed',
            output_data: output,
            completed_at: new Date().toISOString(),
            duration_ms: duration,
          })
          .eq('id', step.id);
      }

      return {
        nodeId: node.id,
        status: 'completed',
        output,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Update step record
      if (step) {
        await this.supabase
          .from('workflow_step_results')
          .update({
            status: 'failed',
            error: { message: error.message, stack: error.stack },
            completed_at: new Date().toISOString(),
            duration_ms: duration,
          })
          .eq('id', step.id);
      }

      return {
        nodeId: node.id,
        status: 'failed',
        output: null,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Execute API call node
   */
  private async executeApiCall(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const { apiId, endpoint, method, headers, body } = node.config;

    // Resolve variables in config
    const resolvedHeaders = this.resolveVariables(headers, context);
    const resolvedBody = this.resolveVariables(body, context);

    // Make API call through Kong proxy
    const proxyUrl = process.env.KONG_PROXY_URL || 'http://localhost:8000';
    const response = await fetch(`${proxyUrl}${endpoint}`, {
      method: method || 'GET',
      headers: resolvedHeaders,
      body: resolvedBody ? JSON.stringify(resolvedBody) : undefined,
    });

    const data = await response.json();

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    };
  }

  /**
   * Execute transform node — applies a simple mapping/expression to inputs.
   * Supported expressions:
   *   - JSONPath-like dot notation: "nodeId.data.field"
   *   - Literal string/number values
   *   - Object mapping: { outputKey: "nodeId.field" }
   */
  private async executeTransform(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const { expression, mapping, outputKey } = node.config;
    const input = this.resolveInputs(node, context);

    // If a mapping object is provided, resolve each value from previous node outputs
    if (mapping && typeof mapping === 'object') {
      const result: Record<string, any> = {};
      for (const [key, path] of Object.entries(mapping)) {
        if (typeof path === 'string') {
          const parts = path.split('.');
          let val: any = input;
          for (const part of parts) val = val?.[part];
          result[key] = val;
        } else {
          result[key] = path;
        }
      }
      return outputKey ? { [outputKey]: result } : result;
    }

    // If a simple expression (dot-path) is provided, resolve it
    if (expression && typeof expression === 'string') {
      const parts = expression.split('.');
      let val: any = input;
      for (const part of parts) val = val?.[part];
      return outputKey ? { [outputKey]: val } : val;
    }

    // Default: pass through all inputs
    return input;
  }

  /**
   * Execute condition node — evaluates a comparison expression and routes execution.
   * Config supports:
   *   - left: dot-path string to resolve from inputs
   *   - operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'exists'
   *   - right: literal value or dot-path string
   */
  private async executeCondition(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const { left, operator, right } = node.config;
    const input = this.resolveInputs(node, context);

    const resolvePath = (val: any): any => {
      if (typeof val !== 'string') return val;
      const parts = val.split('.');
      let resolved: any = input;
      for (const part of parts) resolved = resolved?.[part];
      return resolved !== undefined ? resolved : val;
    };

    const leftVal = resolvePath(left);
    const rightVal = resolvePath(right);

    let conditionMet: boolean;
    switch (operator) {
      case '==':  conditionMet = leftVal == rightVal; break;
      case '!=':  conditionMet = leftVal != rightVal; break;
      case '>':   conditionMet = Number(leftVal) > Number(rightVal); break;
      case '>=':  conditionMet = Number(leftVal) >= Number(rightVal); break;
      case '<':   conditionMet = Number(leftVal) < Number(rightVal); break;
      case '<=':  conditionMet = Number(leftVal) <= Number(rightVal); break;
      case 'contains':
        conditionMet = typeof leftVal === 'string'
          ? leftVal.includes(String(rightVal))
          : Array.isArray(leftVal)
            ? leftVal.includes(rightVal)
            : false;
        break;
      case 'exists':
        conditionMet = leftVal !== undefined && leftVal !== null;
        break;
      default:
        // Default to truthy check of left value
        conditionMet = !!leftVal;
    }

    return { conditionMet, leftVal, rightVal, operator };
  }

  /**
   * Execute delay node
   */
  private async executeDelay(node: WorkflowNode): Promise<any> {
    const { delayMs } = node.config;
    await new Promise((resolve) => setTimeout(resolve, delayMs || 1000));
    return { delayed: delayMs };
  }

  /**
   * Resolve inputs from previous nodes
   */
  private resolveInputs(node: WorkflowNode, context: ExecutionContext): any {
    const inputs: Record<string, any> = {};

    // Get results from connected nodes
    context.nodeResults.forEach((result, nodeId) => {
      inputs[nodeId] = result.output;
    });

    return inputs;
  }

  /**
   * Replace {{variables}} in strings
   */
  private resolveVariables(obj: any, context: ExecutionContext): any {
    if (typeof obj === 'string') {
      return obj.replace(/\{\{(.+?)\}\}/g, (match, path) => {
        const value = this.getNestedValue(context, path.trim());
        return value !== undefined ? value : match;
      });
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveVariables(item, context));
    }

    if (obj && typeof obj === 'object') {
      const resolved: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveVariables(value, context);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Get nested value from context
   */
  private getNestedValue(context: ExecutionContext, path: string): any {
    const parts = path.split('.');
    let value: any = {
      trigger: context.triggerData,
      ...Object.fromEntries(context.nodeResults),
    };

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * Topological sort of workflow nodes
   */
  private topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
    const sorted: WorkflowNode[] = [];
    const visited = new Set<string>();

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit dependencies first
      const dependencies = edges.filter((e) => e.target === nodeId).map((e) => e.source);
      dependencies.forEach(visit);

      const node = nodes.find((n) => n.id === nodeId);
      if (node) sorted.push(node);
    };

    // Start with trigger nodes
    const triggerNodes = nodes.filter(
      (n) => n.type === 'webhook_trigger' || n.type === 'schedule_trigger'
    );

    if (triggerNodes.length > 0) {
      triggerNodes.forEach((n) => visit(n.id));
    } else {
      // If no trigger, start with nodes that have no incoming edges
      const nodesWithNoInput = nodes.filter(
        (n) => !edges.some((e) => e.target === n.id)
      );
      nodesWithNoInput.forEach((n) => visit(n.id));
    }

    // Visit remaining nodes
    nodes.forEach((n) => visit(n.id));

    return sorted;
  }
}
