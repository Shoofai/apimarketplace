import * as vscode from 'vscode';
import { apiJson } from '../lib/client';
import { getToken, getEmail, getPlatformUrl } from '../lib/config';

interface SubscriptionAPI {
  id: string;
  name: string;
  slug: string;
  status: string;
  organization: { name: string; slug: string } | null;
  api: {
    id: string;
    name: string;
    slug: string;
    organization: { name: string; slug: string } | null;
  } | null;
}

export class APITreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: 'root' | 'api' | 'action',
    public readonly data?: { apiSlug?: string; orgSlug?: string; apiId?: string; action?: string }
  ) {
    super(label, collapsibleState);
    this.contextValue = itemType;

    if (itemType === 'api') {
      this.iconPath = new vscode.ThemeIcon('cloud');
      this.description = data?.orgSlug ?? '';
    } else if (itemType === 'action') {
      if (data?.action === 'search') this.iconPath = new vscode.ThemeIcon('search');
      if (data?.action === 'snippet') this.iconPath = new vscode.ThemeIcon('sparkle');
      if (data?.action === 'test') this.iconPath = new vscode.ThemeIcon('play');
      if (data?.action === 'open') this.iconPath = new vscode.ThemeIcon('link-external');
    }
  }
}

export class APITreeProvider implements vscode.TreeDataProvider<APITreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<APITreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly ctx: vscode.ExtensionContext) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: APITreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: APITreeItem): Promise<APITreeItem[]> {
    const token = await getToken(this.ctx);

    if (!element) {
      // Root level
      if (!token) {
        const item = new APITreeItem('Sign in to Kinetic', vscode.TreeItemCollapsibleState.None, 'root');
        item.command = { command: 'kineticapi.auth', title: 'Sign In' };
        item.iconPath = new vscode.ThemeIcon('sign-in');
        return [item];
      }

      // Fetch subscriptions
      try {
        const data = await apiJson<{ subscriptions: SubscriptionAPI[] }>('/api/subscriptions', { token });
        const subs = data.subscriptions ?? [];

        if (!subs.length) {
          const item = new APITreeItem('No subscriptions yet', vscode.TreeItemCollapsibleState.None, 'root');
          item.iconPath = new vscode.ThemeIcon('info');
          const search = new APITreeItem('Search marketplace APIs', vscode.TreeItemCollapsibleState.None, 'action', { action: 'search' });
          search.command = { command: 'kineticapi.search', title: 'Search APIs' };
          return [item, search];
        }

        return subs.map((sub) => {
          const api = sub.api ?? sub;
          const org = api.organization ?? sub.organization;
          const orgSlug = Array.isArray(org) ? org[0]?.slug : org?.slug ?? '';
          return new APITreeItem(
            api.name ?? sub.name ?? 'Unknown API',
            vscode.TreeItemCollapsibleState.Collapsed,
            'api',
            { apiId: api.id, apiSlug: api.slug, orgSlug }
          );
        });
      } catch {
        const item = new APITreeItem('Failed to load subscriptions', vscode.TreeItemCollapsibleState.None, 'root');
        item.iconPath = new vscode.ThemeIcon('error');
        return [item];
      }
    }

    // Children of an API node — quick actions
    if (element.itemType === 'api' && element.data) {
      const { apiId, apiSlug, orgSlug } = element.data;

      const actions: APITreeItem[] = [
        (() => {
          const item = new APITreeItem('Generate code snippet', vscode.TreeItemCollapsibleState.None, 'action', { action: 'snippet', apiId, apiSlug, orgSlug });
          item.command = { command: 'kineticapi.generateSnippet', title: 'Generate Snippet', arguments: [apiId, apiSlug, orgSlug] };
          return item;
        })(),
        (() => {
          const item = new APITreeItem('Test an endpoint', vscode.TreeItemCollapsibleState.None, 'action', { action: 'test', apiId, apiSlug, orgSlug });
          item.command = { command: 'kineticapi.testEndpoint', title: 'Test Endpoint', arguments: [apiId, apiSlug, orgSlug] };
          return item;
        })(),
        (() => {
          const item = new APITreeItem('Open in marketplace', vscode.TreeItemCollapsibleState.None, 'action', { action: 'open', apiId, apiSlug, orgSlug });
          item.command = {
            command: 'vscode.open',
            title: 'Open in Marketplace',
            arguments: [vscode.Uri.parse(`${getPlatformUrl()}/marketplace/${orgSlug}/${apiSlug}`)],
          };
          return item;
        })(),
      ];
      return actions;
    }

    return [];
  }
}
