# Seeding APIs from ProgrammableWeb Datasets

This directory contains scripts to seed the API marketplace with data from ProgrammableWeb.

## Available Scripts

### 1. Curated Seed (65 APIs)
Seeds 65 hand-curated popular APIs across multiple categories.

```bash
npm run seed-public-apis
```

### 2. Bulk Seed from ProgrammableWeb (12K-17K APIs)
Seeds thousands of APIs from ProgrammableWeb datasets.

#### Step 1: Download Dataset

Choose one of these datasets:

**Option A: JSON Format (17,923 APIs)**
```bash
# Download from GitHub
git clone https://github.com/aourhtnowvherlcaer/programmableWeb.git temp-pw
cp "temp-pw/all apis/ProgrammableWeb.json" programmableweb-all.json
rm -rf temp-pw
```

**Option B: TSV Format (12,879 APIs)**
```bash
# Download from GitHub
git clone https://github.com/kkfletch/API-Dataset.git temp-api
cp "temp-api/Dataset/Web_APIs.txt" Web_APIs.txt
rm -rf temp-api
```

Or manually download:
- JSON: https://github.com/aourhtnowvherlcaer/programmableWeb/tree/master/all%20apis
- TSV: https://github.com/kkfletch/API-Dataset/tree/master/Dataset

#### Step 2: Place Dataset in Project Root

Place the downloaded file as:
- `programmableweb-all.json` (for JSON) OR
- `Web_APIs.txt` (for TSV)

at the root of your project (same level as `package.json`).

#### Step 3: Run Bulk Seed

```bash
npm run seed-programmableweb-bulk
```

The script will:
- Parse the dataset (JSON or TSV)
- Map ProgrammableWeb categories to your marketplace categories
- Create category records if needed
- Insert APIs as `unclaimed` with `status = 'unclaimed'`
- Skip duplicates and already-claimed APIs
- Batch process for performance

## Dataset Information

### JSON Dataset (17,923 APIs)
From: https://github.com/aourhtnowvherlcaer/programmableWeb

Contains comprehensive information for all APIs crawled from ProgrammableWeb.com.

### TSV Dataset (12,879 APIs)
From: https://github.com/kkfletch/API-Dataset

Crawled March 2018. Includes 19 fields per API:
- api_name, api_url, api_tags, api_desc
- api_primary_category, api_secondary_categories
- api_date, ssl_support, authentication_model
- request_data_format, response_data_format
- api_version, api_num_sdks, api_num_how_tos
- api_num_sample_codes, api_num_libraries
- api_num_developers, api_num_followers, api_num_comments

## Category Mapping

ProgrammableWeb categories are mapped to your marketplace categories:

- Financial, Payments, Banking → Finance
- eCommerce, Commerce, Shopping → E-commerce
- Messaging, Email, SMS, Voice → Communication
- Social, Social Media → Social
- Mapping, Maps, Location → Maps/Geo
- Weather → Weather
- Tools, Development, Programming → Development
- Machine Learning, AI → AI/ML
- Photos, Video, Music → Other
- Data, Search, Reference → Data

## Notes

- APIs are inserted with `status = 'unclaimed'` and `visibility = 'public'`
- The `original_url` field stores the source URL from ProgrammableWeb
- Descriptions are truncated to 500 characters
- Slugs are auto-generated from API names
- Duplicates (by slug) are skipped
- Already-claimed or published APIs are not overwritten

## Troubleshooting

**"No dataset found"**
- Ensure the dataset file is in the project root
- Check the filename matches exactly: `programmableweb-all.json` or `Web_APIs.txt`

**"Platform org not found"**
- Run the migration first: the platform organization must exist
- Check that the migration `create_preloaded_apis_support` has been applied

**"Permission denied"**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
- The service role key bypasses RLS for seeding

## Performance

- Processes ~50 APIs per batch
- Expect 5-15 minutes for full bulk seed depending on dataset size and network
- Progress is logged for each batch
