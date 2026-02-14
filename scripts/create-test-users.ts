/**
 * Script to create all test users for KineticAPI
 * 
 * Usage:
 *   npx tsx scripts/create-test-users.ts
 * 
 * This script creates 6 test users with different profiles:
 * 1. Platform Admin
 * 2. Enterprise Provider
 * 3. Pro Provider
 * 4. Free Developer
 * 5. Enterprise Developer
 * 6. Pro Developer
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read environment variables from .env.local
function loadEnv() {
  try {
    const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
    const env: Record<string, string> = {};
    
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    });
    
    return env;
  } catch (error) {
    console.error('❌ Failed to read .env.local file');
    throw error;
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestUser {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  organization_slug: string;
  organization_id: string;
  organization_type: 'provider' | 'consumer' | 'both';
  organization_plan: 'free' | 'pro' | 'enterprise';
  is_platform_admin: boolean;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@apimarketplace.pro',
    password: 'TestPass123!',
    full_name: 'Platform Admin',
    organization_name: 'KineticAPI Platform',
    organization_slug: 'apimarketplace-platform',
    organization_id: '00000000-0000-0000-0000-000000000000',
    organization_type: 'both',
    organization_plan: 'enterprise',
    is_platform_admin: true,
  },
  {
    email: 'provider.enterprise@acme.com',
    password: 'TestPass123!',
    full_name: 'Sarah Johnson',
    organization_name: 'Acme API Corp',
    organization_slug: 'acme-api-corp',
    organization_id: '11111111-1111-1111-1111-111111111111',
    organization_type: 'provider',
    organization_plan: 'enterprise',
    is_platform_admin: false,
  },
  {
    email: 'provider.pro@devtools.com',
    password: 'TestPass123!',
    full_name: 'Mike Chen',
    organization_name: 'DevTools Inc',
    organization_slug: 'devtools-inc',
    organization_id: '22222222-2222-2222-2222-222222222222',
    organization_type: 'provider',
    organization_plan: 'pro',
    is_platform_admin: false,
  },
  {
    email: 'developer.free@startup.com',
    password: 'TestPass123!',
    full_name: 'Alex Rivera',
    organization_name: 'Startup Studio',
    organization_slug: 'startup-studio',
    organization_id: '33333333-3333-3333-3333-333333333333',
    organization_type: 'consumer',
    organization_plan: 'free',
    is_platform_admin: false,
  },
  {
    email: 'developer.enterprise@corp.com',
    password: 'TestPass123!',
    full_name: 'Jennifer Smith',
    organization_name: 'Enterprise Corp',
    organization_slug: 'enterprise-corp',
    organization_id: '44444444-4444-4444-4444-444444444444',
    organization_type: 'both',
    organization_plan: 'enterprise',
    is_platform_admin: false,
  },
  {
    email: 'developer.pro@solo.dev',
    password: 'TestPass123!',
    full_name: 'David Park',
    organization_name: 'Solo Developer',
    organization_slug: 'solo-dev',
    organization_id: '55555555-5555-5555-5555-555555555555',
    organization_type: 'consumer',
    organization_plan: 'pro',
    is_platform_admin: false,
  },
];

async function createTestUser(user: TestUser): Promise<boolean> {
  console.log(`\n📝 Creating user: ${user.email}`);

  try {
    // Step 1: Check if auth user already exists
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users.find(u => u.email === user.email);

    let authUserId: string;

    if (existingAuthUser) {
      console.log(`   ℹ️  Auth user already exists`);
      authUserId = existingAuthUser.id;
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.full_name,
          organization_name: user.organization_name,
        },
      });

      if (authError) {
        console.error(`   ❌ Failed to create auth user:`, authError.message);
        return false;
      }

      if (!authData.user) {
        console.error(`   ❌ No user data returned`);
        return false;
      }

      authUserId = authData.user.id;
      console.log(`   ✅ Auth user created (ID: ${authUserId})`);
    }

    // Step 2: Check if organization exists, if not create it
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', user.organization_id)
      .single();

    if (!existingOrg) {
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({
          id: user.organization_id,
          name: user.organization_name,
          slug: user.organization_slug,
          type: user.organization_type,
          plan: user.organization_plan,
          settings: user.organization_type === 'provider' ? { verified: true } : {},
        });

      if (orgError) {
        console.error(`   ❌ Failed to create organization:`, orgError.message);
        return false;
      }
      console.log(`   ✅ Organization created`);
    } else {
      console.log(`   ℹ️  Organization already exists`);
    }

    // Step 3: Check if user record exists, if not create it
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .single();

    if (!existingUser) {
      const { error: userError } = await supabase.from('users').insert({
        id: authUserId,
        email: user.email,
        full_name: user.full_name,
        current_organization_id: user.organization_id,
        is_platform_admin: user.is_platform_admin,
        onboarding_completed: true, // Skip onboarding for test users
      });

      if (userError) {
        console.error(`   ❌ Failed to create user record:`, userError.message);
        return false;
      }
      console.log(`   ✅ User record created`);
    } else {
      // Update user to set admin flag if needed
      if (user.is_platform_admin) {
        await supabase
          .from('users')
          .update({ is_platform_admin: true })
          .eq('id', authUserId);
        console.log(`   ✅ User updated (admin flag set)`);
      } else {
        console.log(`   ℹ️  User record already exists`);
      }
    }

    // Step 4: Check if organization membership exists, if not create it
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('user_id', authUserId)
      .eq('organization_id', user.organization_id)
      .single();

    if (!existingMember) {
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: user.organization_id,
          user_id: authUserId,
          role: 'owner',
        });

      if (memberError) {
        console.error(`   ❌ Failed to create organization membership:`, memberError.message);
        return false;
      }
      console.log(`   ✅ Organization membership created`);
    } else {
      console.log(`   ℹ️  Organization membership already exists`);
    }

    console.log(`✅ Successfully created/verified: ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating user ${user.email}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting test user creation...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`👥 Creating ${TEST_USERS.length} test users\n`);
  console.log('═'.repeat(60));

  const results = await Promise.all(TEST_USERS.map(createTestUser));

  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Successful: ${results.filter(r => r).length}`);
  console.log(`   ❌ Failed: ${results.filter(r => !r).length}`);

  if (results.every(r => r)) {
    console.log('\n🎉 All test users created successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('   Password for ALL users: TestPass123!\n');
    console.table(
      TEST_USERS.map(u => ({
        Email: u.email,
        Name: u.full_name,
        Organization: u.organization_name,
        Plan: u.organization_plan,
        Type: u.organization_type,
        Admin: u.is_platform_admin ? '👑' : '—',
      }))
    );
    console.log('\n✨ You can now log in with any of these users!');
    console.log('🔗 Login URL: http://localhost:3000/login\n');
  } else {
    console.log('\n⚠️  Some users failed to create. Check errors above.');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
