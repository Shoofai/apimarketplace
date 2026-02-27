import { KongClient } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

/**
 * Manages API provisioning and deprovisioning in Kong Gateway.
 * Handles service creation, route configuration, and plugin setup.
 */
export class RouteProvisioner {
  private kong: KongClient;

  constructor() {
    this.kong = new KongClient();
  }

  /**
   * Provisions an API in Kong Gateway when published.
   * Creates service, routes, and adds required plugins.
   * 
   * @param apiId - UUID of the API to provision
   */
  async provisionApi(apiId: string): Promise<void> {
    const supabase = createAdminClient();

    try {
      // Fetch API details with organization
      const { data: api, error: apiError } = await supabase
        .from('apis')
        .select(`
          *,
          organization:organizations!apis_organization_id_fkey(slug),
          pricing_plans:api_pricing_plans(*)
        `)
        .eq('id', apiId)
        .single();

      if (apiError || !api) {
        throw new Error(`API not found: ${apiId}`);
      }

      // Create Kong service
      const serviceName = `amp-${api.organization.slug}-${api.slug}`;
      const service = await this.kong.createService(serviceName, api.base_url);

      logger.info('Kong service created', {
        apiId,
        serviceId: service.id,
        serviceName,
        baseUrl: api.base_url,
      });

      // Create catch-all route for the API
      const routePath = `/v1/${api.organization.slug}/${api.slug}`;
      const route = await this.kong.createRoute(
        service.id,
        [`${routePath}`, `${routePath}/`],
        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        `route-${serviceName}`
      );

      logger.info('Kong route created', {
        apiId,
        routeId: route.id,
        routePath,
      });

      // Add key-auth plugin for API key validation
      await this.kong.addPlugin(service.id, 'key-auth', {
        key_names: ['X-API-Key', 'x-api-key'],
        key_in_header: true,
        key_in_query: false,
        key_in_body: false,
        hide_credentials: true,
      });

      // Add rate-limiting plugin (default 100 req/min)
      // This will be overridden per-consumer based on their plan
      await this.kong.addPlugin(service.id, 'rate-limiting', {
        minute: 100,
        policy: 'local',
        fault_tolerant: true,
        hide_client_headers: false,
      });

      // Add CORS plugin for browser-based testing
      await this.kong.addPlugin(service.id, 'cors', {
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        headers: ['Accept', 'Content-Type', 'Authorization', 'X-API-Key'],
        exposed_headers: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
        ],
        credentials: true,
        max_age: 3600,
      });

      // Add http-log plugin for request logging
      const logUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/log-api-request`;
      await this.kong.addPlugin(service.id, 'http-log', {
        http_endpoint: logUrl,
        method: 'POST',
        timeout: 10000,
        keepalive: 60000,
        content_type: 'application/json',
      });

      logger.info('Kong plugins configured', { apiId, serviceId: service.id });

      // Store Kong service ID in database
      const { error: updateError } = await supabase
        .from('apis')
        .update({
          gateway_service_id: service.id,
          settings: {
            kong_route_id: route.id,
            kong_service_name: serviceName,
            provisioned_at: new Date().toISOString(),
          },
        })
        .eq('id', apiId);

      if (updateError) {
        logger.error('Failed to update API with Kong service ID', {
          error: updateError,
          apiId,
        });
        throw updateError;
      }

      logger.info('API successfully provisioned in Kong', {
        apiId,
        serviceId: service.id,
        routeId: route.id,
      });
    } catch (error) {
      logger.error('Error provisioning API in Kong', { error, apiId });
      throw error;
    }
  }

  /**
   * Deprovisions an API from Kong Gateway.
   * Removes service and all associated routes and plugins.
   * 
   * @param apiId - UUID of the API to deprovision
   */
  async deprovisionApi(apiId: string): Promise<void> {
    const supabase = createAdminClient();

    try {
      const { data: api } = await supabase
        .from('apis')
        .select('gateway_service_id, slug')
        .eq('id', apiId)
        .single();

      if (!api?.gateway_service_id) {
        logger.warn('API not provisioned in Kong, nothing to deprovision', { apiId });
        return;
      }

      // Delete Kong service (this also deletes associated routes and plugins)
      await this.kong.deleteService(api.gateway_service_id);

      // Clear gateway_service_id from database
      await supabase
        .from('apis')
        .update({
          gateway_service_id: null,
        })
        .eq('id', apiId);

      logger.info('API deprovisioned from Kong', {
        apiId,
        serviceId: api.gateway_service_id,
      });
    } catch (error) {
      logger.error('Error deprovisioning API from Kong', { error, apiId });
      throw error;
    }
  }

  /**
   * Updates Kong configuration when API settings change.
   * Currently handles rate limit changes.
   * 
   * @param apiId - UUID of the API to update
   */
  async updateApiConfiguration(apiId: string): Promise<void> {
    const supabase = createAdminClient();

    try {
      const { data: api } = await supabase
        .from('apis')
        .select('gateway_service_id, settings')
        .eq('id', apiId)
        .single();

      if (!api?.gateway_service_id) {
        logger.warn('API not provisioned, cannot update', { apiId });
        return;
      }

      // Get all plugins for this service
      const plugins = await this.kong.listPlugins(api.gateway_service_id);

      // Update rate limiting if settings changed
      const rateLimitPlugin = plugins.find((p) => p.name === 'rate-limiting');
      if (rateLimitPlugin) {
        await this.kong.updatePlugin(rateLimitPlugin.id, {
          minute: (api.settings as { rate_limit_per_minute?: number } | null)?.rate_limit_per_minute || 100,
        });
      }

      logger.info('Kong configuration updated', { apiId });
    } catch (error) {
      logger.error('Error updating Kong configuration', { error, apiId });
      throw error;
    }
  }

  /**
   * Checks if Kong Gateway is healthy and accessible.
   * 
   * @returns true if Kong is healthy
   */
  async isKongHealthy(): Promise<boolean> {
    try {
      const health = await this.kong.getHealth();
      return health.status === 'healthy' || health.status === 'ready';
    } catch {
      return false;
    }
  }
}

/**
 * Singleton provisioner instance.
 */
export const routeProvisioner = new RouteProvisioner();
