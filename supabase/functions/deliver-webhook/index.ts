import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  id: string;
  type: string;
  created_at: string;
  data: Record<string, any>;
  organization_id: string;
}

/**
 * Generates HMAC signature for webhook verification
 */
async function generateSignature(
  secret: string,
  timestamp: string,
  body: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureData = `${timestamp}.${body}`;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureData));

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Delivers a webhook with retries
 */
async function deliverWebhook(deliveryId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get delivery details
  const { data: delivery } = await supabase
    .from('webhook_deliveries')
    .select(`
      *,
      webhook_endpoint:webhook_endpoints(url, secret)
    `)
    .eq('id', deliveryId)
    .single();

  if (!delivery || !delivery.webhook_endpoint) {
    console.error('Delivery not found:', deliveryId);
    return;
  }

  const { url, secret } = delivery.webhook_endpoint;
  const timestamp = new Date().toISOString();
  const body = JSON.stringify(delivery.payload);
  const signature = await generateSignature(secret, timestamp, body);

  try {
    // Deliver webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-ID': delivery.payload.id,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-Signature': signature,
        'User-Agent': 'apinergy-Webhooks/1.0',
      },
      body,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseBody = await response.text();

    if (response.ok) {
      // Success
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'sent',
          response_status: response.status,
          response_body: responseBody.substring(0, 1000),
        })
        .eq('id', deliveryId);

      await supabase
        .from('webhook_endpoints')
        .update({
          last_triggered_at: new Date().toISOString(),
          failure_count: 0,
        })
        .eq('id', delivery.webhook_endpoint_id);

      console.log('Webhook delivered successfully:', deliveryId);
    } else {
      // Failed response
      throw new Error(`HTTP ${response.status}: ${responseBody}`);
    }
  } catch (error: any) {
    console.error('Webhook delivery failed:', error);

    const attemptNumber = delivery.attempt_number + 1;
    const maxAttempts = 3;

    if (attemptNumber >= maxAttempts) {
      // Exhausted retries
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'exhausted',
          response_body: error.message,
        })
        .eq('id', deliveryId);

      // Increment failure count on endpoint
      const { data: endpoint } = await supabase
        .from('webhook_endpoints')
        .select('failure_count')
        .eq('id', delivery.webhook_endpoint_id)
        .single();

      const newFailureCount = (endpoint?.failure_count || 0) + 1;

      await supabase
        .from('webhook_endpoints')
        .update({
          failure_count: newFailureCount,
          is_active: newFailureCount >= 10 ? false : true, // Auto-disable after 10 failures
        })
        .eq('id', delivery.webhook_endpoint_id);

      console.log('Webhook delivery exhausted:', deliveryId);
    } else {
      // Schedule retry
      const retryDelays = [60, 300, 1800]; // 1 min, 5 min, 30 min
      const nextRetryAt = new Date(Date.now() + retryDelays[attemptNumber - 1] * 1000);

      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          attempt_number: attemptNumber,
          next_retry_at: nextRetryAt.toISOString(),
          response_body: error.message,
        })
        .eq('id', deliveryId);

      console.log('Webhook retry scheduled:', deliveryId, 'at', nextRetryAt);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { delivery_id } = await req.json();

    if (!delivery_id) {
      throw new Error('delivery_id required');
    }

    await deliverWebhook(delivery_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
