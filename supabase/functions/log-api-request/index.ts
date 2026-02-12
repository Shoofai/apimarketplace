import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface KongLogPayload {
  request?: {
    method: string;
    uri: string;
    size?: number;
    headers?: Record<string, string>;
  };
  response?: {
    status: number;
    size?: number;
  };
  latencies?: {
    request?: number;
    proxy?: number;
  };
  client_ip?: string;
  consumer?: {
    custom_id?: string;
  };
  service?: {
    id?: string;
  };
  route?: {
    id?: string;
  };
}

Deno.serve(async (req) => {
  try {
    // Parse Kong log payload
    const log: KongLogPayload = await req.json();

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract subscription_id from consumer custom_id
    const subscriptionId = log.consumer?.custom_id || null;

    // Extract API ID from service metadata
    // We'll store this in Kong service tags or custom_id
    const apiId = log.service?.id;

    if (!apiId) {
      console.warn('No API ID in Kong log, skipping');
      return new Response(JSON.stringify({ success: false, reason: 'no_api_id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch subscription and API details
    const { data: subscription } = await supabase
      .from('api_subscriptions')
      .select('id, api_id, organization_id')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      console.warn('Subscription not found:', subscriptionId);
      return new Response(JSON.stringify({ success: false, reason: 'subscription_not_found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert request log
    const { error: logError } = await supabase.from('api_requests_log').insert({
      subscription_id: subscription.id,
      api_id: subscription.api_id,
      organization_id: subscription.organization_id,
      method: log.request?.method || 'GET',
      path: log.request?.uri || '/',
      status_code: log.response?.status || 0,
      latency_ms: log.latencies?.request || 0,
      upstream_latency_ms: log.latencies?.proxy || 0,
      request_size_bytes: log.request?.size || 0,
      response_size_bytes: log.response?.size || 0,
      ip_address: log.client_ip || null,
      user_agent: log.request?.headers?.['user-agent'] || null,
    });

    if (logError) {
      console.error('Failed to insert request log:', logError);
      throw logError;
    }

    // Increment usage counter on subscription
    await supabase
      .from('api_subscriptions')
      .update({
        current_period_usage: supabase.rpc('increment', { row_id: subscription.id }),
      })
      .eq('id', subscription.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request log:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
