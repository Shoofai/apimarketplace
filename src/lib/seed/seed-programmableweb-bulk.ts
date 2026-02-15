/**
 * Bulk seed script for ProgrammableWeb datasets
 *
 * Usage:
 *   1. Download dataset from GitHub:
 *      - JSON (17,923 APIs): https://github.com/aourhtnowvherlcaer/programmableWeb
 *      - TSV (12,879 APIs): https://github.com/kkfletch/API-Dataset
 *   2. Place the file in the project root as:
 *      - programmableweb-all.json OR
 *      - Web_APIs.txt (TSV)
 *   3. Run: npx tsx src/lib/seed/seed-programmableweb-bulk.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && !process.env[key]) process.env[key] = value;
      }
    });
  } catch {
    // Use existing process.env
  }
}

loadEnv();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const PLATFORM_ORG_SLUG = 'platform-directory';

// Category mapping from ProgrammableWeb to our categories
const CATEGORY_MAP: Record<string, string> = {
  // Finance & Payment
  'Financial': 'Finance',
  'Payments': 'Finance',
  'Banking': 'Finance',
  'eCommerce': 'E-commerce',
  'Commerce': 'E-commerce',
  'Shopping': 'E-commerce',
  
  // Communication
  'Messaging': 'Communication',
  'Email': 'Communication',
  'SMS': 'Communication',
  'Voice': 'Communication',
  'Telephony': 'Communication',
  
  // Social
  'Social': 'Social',
  'Social Media': 'Social',
  'Social Network': 'Social',
  'Collaboration': 'Social',
  
  // Maps & Location
  'Mapping': 'Maps/Geo',
  'Maps': 'Maps/Geo',
  'Location': 'Maps/Geo',
  'Geolocation': 'Maps/Geo',
  
  // Weather
  'Weather': 'Weather',
  
  // Development
  'Tools': 'Development',
  'Development': 'Development',
  'Programming': 'Development',
  'Hosting': 'Development',
  
  // AI/ML
  'Machine Learning': 'AI/ML',
  'Artificial Intelligence': 'AI/ML',
  'Natural Language': 'AI/ML',
  
  // Media
  'Photos': 'Other',
  'Video': 'Other',
  'Music': 'Other',
  'Entertainment': 'Other',
  
  // Data
  'Data': 'Data',
  'Search': 'Data',
  'Reference': 'Data',
  
  // Default
  'Other': 'Other',
};

function mapCategory(primaryCategory: string): string {
  if (!primaryCategory) return 'Other';
  return CATEGORY_MAP[primaryCategory] || 'Other';
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

function truncateDescription(desc: string, maxLength: number = 500): string {
  if (!desc || desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength - 3) + '...';
}

interface ProgrammableWebAPI {
  // JSON format (all apis)
  api_id?: string;
  api_name?: string;
  api_description?: string;
  api_primary_category?: string;
  api_url?: string;
  api_provider_url?: string;
  
  // TSV format
  api_desc?: string;
  api_tags?: string;
  ssl_support?: string;
  authentication_model?: string;
}

async function parseJSONDataset(filePath: string): Promise<ProgrammableWebAPI[]> {
  const content = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  // Handle both array and object with apis property
  if (Array.isArray(data)) {
    return data;
  } else if (data.apis && Array.isArray(data.apis)) {
    return data.apis;
  }
  
  throw new Error('Unknown JSON format');
}

async function parseTSVDataset(filePath: string): Promise<ProgrammableWebAPI[]> {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const apis: ProgrammableWebAPI[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = line.split('\t');
    if (fields.length < 5) continue;
    
    apis.push({
      api_name: fields[0] || '',
      api_url: fields[1] || '',
      api_tags: fields[2] || '',
      api_desc: fields[3] || '',
      api_primary_category: fields[4] || '',
      ssl_support: fields[7] || '',
      authentication_model: fields[8] || '',
    });
  }
  
  return apis;
}

async function main() {
  const admin = createAdminClient();
  
  console.log('🔍 Looking for ProgrammableWeb datasets...');
  
  // Check for dataset files
  const jsonPath = resolve(process.cwd(), 'programmableweb-all.json');
  const tsvPath = resolve(process.cwd(), 'Web_APIs.txt');
  
  let apis: ProgrammableWebAPI[] = [];
  
  if (existsSync(jsonPath)) {
    console.log('📁 Found JSON dataset:', jsonPath);
    apis = await parseJSONDataset(jsonPath);
  } else if (existsSync(tsvPath)) {
    console.log('📁 Found TSV dataset:', tsvPath);
    apis = await parseTSVDataset(tsvPath);
  } else {
    console.error('❌ No dataset found. Please download:');
    console.error('  - JSON: https://github.com/aourhtnowvherlcaer/programmableWeb');
    console.error('  - TSV: https://github.com/kkfletch/API-Dataset');
    console.error('Place as "programmableweb-all.json" or "Web_APIs.txt" in project root.');
    process.exit(1);
  }
  
  console.log(`📊 Found ${apis.length} APIs in dataset`);
  
  // Get platform org
  const { data: platformOrg } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', PLATFORM_ORG_SLUG)
    .maybeSingle();
  
  if (!platformOrg) {
    console.error('❌ Platform org not found. Run migration first.');
    process.exit(1);
  }
  
  const platformOrgId = platformOrg.id;
  console.log('✅ Platform org:', platformOrgId);
  
  // Build category map
  const categoryNames = [...new Set(apis.map((a) => mapCategory(a.api_primary_category || '')))];
  const categoryMap: Record<string, string> = {};
  
  console.log('📂 Creating categories...');
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { data: cat } = await admin
      .from('api_categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (cat) {
      categoryMap[name] = cat.id;
    } else {
      const { data: newCat, error } = await admin
        .from('api_categories')
        .insert({ name, slug })
        .select('id')
        .single();
      if (!error && newCat) {
        categoryMap[name] = newCat.id;
      }
    }
  }
  
  console.log(`✅ Categories ready: ${Object.keys(categoryMap).length}`);
  
  // Filter and prepare APIs
  const validApis = apis.filter((api) => {
    const name = api.api_name || '';
    const desc = api.api_description || api.api_desc || '';
    const url = api.api_url || api.api_provider_url || '';
    
    return (
      name.trim().length > 0 &&
      desc.trim().length > 10 &&
      url.trim().length > 0
    );
  });
  
  console.log(`✅ Valid APIs: ${validApis.length}`);
  
  // Batch insert
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  const BATCH_SIZE = 50;
  const batches = Math.ceil(validApis.length / BATCH_SIZE);
  
  for (let i = 0; i < batches; i++) {
    const batchStart = i * BATCH_SIZE;
    const batchEnd = Math.min((i + 1) * BATCH_SIZE, validApis.length);
    const batch = validApis.slice(batchStart, batchEnd);
    
    console.log(`\n📦 Processing batch ${i + 1}/${batches} (${batch.length} APIs)...`);
    
    for (const api of batch) {
      const name = api.api_name || '';
      const slug = generateSlug(name);
      const description = truncateDescription(api.api_description || api.api_desc || '');
      const category = mapCategory(api.api_primary_category || '');
      const categoryId = categoryMap[category] || null;
      const url = api.api_url || api.api_provider_url || '';
      
      // Check if already exists
      const { data: existing } = await admin
        .from('apis')
        .select('id, status')
        .eq('organization_id', platformOrgId)
        .eq('slug', slug)
        .maybeSingle();
      
      const payload = {
        name,
        slug,
        description,
        organization_id: platformOrgId,
        base_url: url,
        original_url: url,
        status: 'unclaimed',
        visibility: 'public',
        category_id: categoryId,
        updated_at: new Date().toISOString(),
      };
      
      try {
        if (existing) {
          // Only update if still unclaimed (don't overwrite claimed/published)
          if (existing.status === 'unclaimed') {
            const { error } = await admin
              .from('apis')
              .update(payload)
              .eq('id', existing.id);
            if (error) {
              console.warn(`  ⚠️  Failed to update ${name}: ${error.message}`);
              errors++;
            } else {
              updated++;
            }
          } else {
            skipped++;
          }
        } else {
          const { error } = await admin
            .from('apis')
            .insert({
              ...payload,
              created_at: new Date().toISOString(),
            });
          if (error) {
            // Likely duplicate slug, skip
            if (error.code === '23505') {
              skipped++;
            } else {
              console.warn(`  ⚠️  Failed to insert ${name}: ${error.message}`);
              errors++;
            }
          } else {
            created++;
          }
        }
      } catch (err) {
        console.warn(`  ⚠️  Error processing ${name}:`, err);
        errors++;
      }
    }
    
    console.log(`  ✅ Batch ${i + 1} done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ BULK SEED COMPLETE');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total processed: ${created + updated + skipped + errors}`);
  console.log('═══════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
