import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Exports all user data for GDPR compliance
 */
async function exportUserData(userId: string, organizationId?: string): Promise<any> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const exportData: any = {
    export_date: new Date().toISOString(),
    user_id: userId,
    organization_id: organizationId,
  };

  // User profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  exportData.user_profile = user;

  // Organizations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('*, organizations(*)')
    .eq('user_id', userId);
  exportData.organizations = memberships;

  // API subscriptions
  const { data: subscriptions } = await supabase
    .from('api_subscriptions')
    .select('*, apis(name, slug), pricing_plans(name)')
    .eq('organization_id', organizationId || user?.default_organization_id);
  exportData.subscriptions = subscriptions;

  // API keys (hashed only)
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, name, environment, created_at, last_used_at, expires_at')
    .eq('user_id', userId);
  exportData.api_keys = apiKeys;

  // Invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', organizationId || user?.default_organization_id);
  exportData.invoices = invoices;

  // Notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  exportData.notifications = notifications;

  // AI playground sessions
  const { data: aiSessions } = await supabase
    .from('ai_playground_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  exportData.ai_sessions = aiSessions;

  // Consent records
  const { data: consents } = await supabase
    .from('consent_records')
    .select('*')
    .eq('user_id', userId);
  exportData.consents = consents;

  return exportData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, organization_id, request_id } = await req.json();

    if (!user_id || !request_id) {
      throw new Error('user_id and request_id required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update request status to processing
    await supabase
      .from('data_export_requests')
      .update({ status: 'processing' })
      .eq('id', request_id);

    // Export data
    const exportData = await exportUserData(user_id, organization_id);

    // Create JSON file
    const jsonData = JSON.stringify(exportData, null, 2);
    const fileName = `user_data_export_${user_id}_${Date.now()}.json`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('private')
      .upload(`exports/${fileName}`, jsonData, {
        contentType: 'application/json',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate signed URL (expires in 7 days)
    const { data: signedUrlData } = await supabase.storage
      .from('private')
      .createSignedUrl(`exports/${fileName}`, 7 * 24 * 60 * 60);

    // Update request with download URL
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await supabase
      .from('data_export_requests')
      .update({
        status: 'ready',
        export_url: signedUrlData?.signedUrl,
        file_size_bytes: jsonData.length,
        completed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', request_id);

    // Send notification
    // TODO: Send email notification

    console.log('Data export completed:', request_id);

    return new Response(JSON.stringify({ success: true, url: signedUrlData?.signedUrl }), {
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
