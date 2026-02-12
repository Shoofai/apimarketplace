import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRedisClient } from '@/lib/cache/redis';

/**
 * GET /api/health
 * System health check endpoint
 */
export async function GET() {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {},
  };

  let allHealthy = true;

  // Check Supabase
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('users').select('id').limit(1).single();
    
    health.services.database = {
      status: error && error.code !== 'PGRST116' ? 'error' : 'ok',
      responseTime: Date.now(),
    };
    
    if (error && error.code !== 'PGRST116') {
      allHealthy = false;
    }
  } catch (error: any) {
    health.services.database = {
      status: 'error',
      error: error.message,
    };
    allHealthy = false;
  }

  // Check Redis
  try {
    const redis = await getRedisClient();
    if (redis) {
      const start = Date.now();
      await redis.ping();
      health.services.redis = {
        status: 'ok',
        responseTime: Date.now() - start,
      };
    } else {
      health.services.redis = {
        status: 'disabled',
      };
    }
  } catch (error: any) {
    health.services.redis = {
      status: 'error',
      error: error.message,
    };
    // Redis is optional, don't mark as unhealthy
  }

  // Check Kong Gateway (if enabled)
  if (process.env.ENABLE_KONG === 'true' && process.env.KONG_ADMIN_URL) {
    try {
      const response = await fetch(`${process.env.KONG_ADMIN_URL}/status`, {
        signal: AbortSignal.timeout(5000),
      });
      health.services.kong = {
        status: response.ok ? 'ok' : 'error',
        responseTime: Date.now(),
      };
      if (!response.ok) {
        allHealthy = false;
      }
    } catch (error: any) {
      health.services.kong = {
        status: 'error',
        error: error.message,
      };
      allHealthy = false;
    }
  }

  // Overall status
  health.status = allHealthy ? 'ok' : 'degraded';

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
  });
}
