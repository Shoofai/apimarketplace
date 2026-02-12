import { logger } from '@/lib/utils/logger';

const KONG_ADMIN_URL = process.env.KONG_ADMIN_URL || 'http://localhost:8001';

export interface KongService {
  id: string;
  name: string;
  url: string;
  protocol: string;
  host: string;
  port: number;
  path?: string;
  retries?: number;
  connect_timeout?: number;
  write_timeout?: number;
  read_timeout?: number;
  created_at: number;
  updated_at: number;
}

export interface KongRoute {
  id: string;
  name: string;
  protocols: string[];
  methods: string[];
  paths: string[];
  strip_path: boolean;
  preserve_host: boolean;
  service: { id: string };
  created_at: number;
  updated_at: number;
}

export interface KongPlugin {
  id: string;
  name: string;
  service?: { id: string };
  route?: { id: string };
  config: Record<string, any>;
  enabled: boolean;
  created_at: number;
}

/**
 * Kong Admin API client for managing services, routes, and plugins.
 * 
 * @see https://docs.konghq.com/gateway/latest/admin-api/
 */
export class KongClient {
  private baseUrl: string;

  constructor(adminUrl?: string) {
    this.baseUrl = adminUrl || KONG_ADMIN_URL;
  }

  /**
   * Creates a new service in Kong.
   * A service represents an upstream API.
   * 
   * @param name - Unique service name
   * @param url - Upstream API base URL
   * @returns Created service object
   */
  async createService(name: string, url: string): Promise<KongService> {
    try {
      const response = await fetch(`${this.baseUrl}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          url,
          retries: 5,
          connect_timeout: 60000,
          write_timeout: 60000,
          read_timeout: 60000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Failed to create Kong service', { name, url, error });
        throw new Error(`Failed to create Kong service: ${error}`);
      }

      const service = await response.json();
      logger.info('Kong service created', { serviceId: service.id, name });
      return service;
    } catch (error) {
      logger.error('Error creating Kong service', { error, name, url });
      throw error;
    }
  }

  /**
   * Creates a route for a service.
   * Routes define how requests are matched to services.
   * 
   * @param serviceId - Service ID to attach route to
   * @param paths - URL paths that trigger this route (e.g., ['/api/v1/*'])
   * @param methods - HTTP methods (e.g., ['GET', 'POST'])
   * @param name - Optional route name
   * @returns Created route object
   */
  async createRoute(
    serviceId: string,
    paths: string[],
    methods: string[],
    name?: string
  ): Promise<KongRoute> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          paths,
          methods,
          strip_path: true,
          preserve_host: false,
          protocols: ['http', 'https'],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Kong route: ${error}`);
      }

      const route = await response.json();
      logger.info('Kong route created', { routeId: route.id, serviceId, paths });
      return route;
    } catch (error) {
      logger.error('Error creating Kong route', { error, serviceId, paths });
      throw error;
    }
  }

  /**
   * Adds a plugin to a service.
   * Plugins extend Kong functionality (auth, rate limiting, logging, etc.).
   * 
   * @param serviceId - Service ID to attach plugin to
   * @param pluginName - Plugin name (e.g., 'key-auth', 'rate-limiting')
   * @param config - Plugin-specific configuration
   * @returns Created plugin object
   */
  async addPlugin(
    serviceId: string,
    pluginName: string,
    config: Record<string, any>
  ): Promise<KongPlugin> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/plugins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pluginName,
          config,
          enabled: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to add plugin ${pluginName}: ${error}`);
      }

      const plugin = await response.json();
      logger.info('Kong plugin added', { pluginId: plugin.id, pluginName, serviceId });
      return plugin;
    } catch (error) {
      logger.error('Error adding Kong plugin', { error, pluginName, serviceId });
      throw error;
    }
  }

  /**
   * Deletes a service and all its routes.
   * 
   * @param serviceId - Service ID to delete
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        const error = await response.text();
        throw new Error(`Failed to delete Kong service: ${error}`);
      }

      logger.info('Kong service deleted', { serviceId });
    } catch (error) {
      logger.error('Error deleting Kong service', { error, serviceId });
      throw error;
    }
  }

  /**
   * Deletes a specific route.
   * 
   * @param routeId - Route ID to delete
   */
  async deleteRoute(routeId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/routes/${routeId}`, {
        method: 'DELETE',
      });

      logger.info('Kong route deleted', { routeId });
    } catch (error) {
      logger.error('Error deleting Kong route', { error, routeId });
      throw error;
    }
  }

  /**
   * Gets health status of Kong Gateway.
   * 
   * @returns Health check result
   */
  async getHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      return response.json();
    } catch (error) {
      logger.error('Kong health check failed', { error });
      throw error;
    }
  }

  /**
   * Lists all services.
   * 
   * @returns Array of services
   */
  async listServices(): Promise<KongService[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Error listing Kong services', { error });
      throw error;
    }
  }

  /**
   * Gets a specific service by ID.
   * 
   * @param serviceId - Service ID
   * @returns Service object
   */
  async getService(serviceId: string): Promise<KongService> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}`);
      
      if (!response.ok) {
        throw new Error('Service not found');
      }

      return response.json();
    } catch (error) {
      logger.error('Error getting Kong service', { error, serviceId });
      throw error;
    }
  }

  /**
   * Lists routes for a service.
   * 
   * @param serviceId - Service ID
   * @returns Array of routes
   */
  async listRoutes(serviceId: string): Promise<KongRoute[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/routes`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Error listing routes', { error, serviceId });
      throw error;
    }
  }

  /**
   * Lists plugins for a service.
   * 
   * @param serviceId - Service ID
   * @returns Array of plugins
   */
  async listPlugins(serviceId: string): Promise<KongPlugin[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${serviceId}/plugins`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      logger.error('Error listing plugins', { error, serviceId });
      throw error;
    }
  }

  /**
   * Updates a plugin configuration.
   * 
   * @param pluginId - Plugin ID
   * @param config - New configuration
   * @returns Updated plugin object
   */
  async updatePlugin(pluginId: string, config: Record<string, any>): Promise<KongPlugin> {
    try {
      const response = await fetch(`${this.baseUrl}/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plugin');
      }

      return response.json();
    } catch (error) {
      logger.error('Error updating plugin', { error, pluginId });
      throw error;
    }
  }

  /**
   * Enables or disables a plugin.
   * 
   * @param pluginId - Plugin ID
   * @param enabled - Whether to enable the plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      logger.info('Kong plugin toggled', { pluginId, enabled });
    } catch (error) {
      logger.error('Error toggling plugin', { error, pluginId });
      throw error;
    }
  }
}

/**
 * Singleton Kong client instance.
 */
export const kongClient = new KongClient();
