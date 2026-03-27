#!/usr/bin/env tsx
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import matter from 'gray-matter';
import { loadConfig, type BlogImportConfig } from './config';
import { getGoogleClients } from './google-auth';

interface SheetRow {
  application: string;
  order: number;
  category: string;
  articleName: string;
  imageName: string;
}

interface ImportResult {
  imported: string[];
  skipped: string[];
  errors: { article: string; error: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchManifest(
  sheets: any,
  config: BlogImportConfig
): Promise<SheetRow[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: `${config.sheetName}!A:E`,
  });

  const rows = res.data.values;
  if (!rows || rows.length < 2) return [];

  const headers = (rows[0] as string[]).map((h: string) => h.toLowerCase().trim());
  const appIdx = headers.findIndex((h: string) => h.includes('application'));
  const orderIdx = headers.findIndex((h: string) => h.includes('order'));
  const catIdx = headers.findIndex((h: string) => h.includes('category'));
  const articleIdx = headers.findIndex((h: string) => h.includes('article'));
  const imageIdx = headers.findIndex((h: string) => h.includes('image'));

  return rows
    .slice(1)
    .filter((row: string[]) => row[appIdx]?.trim() === config.appName)
    .map((row: string[]) => ({
      application: row[appIdx]?.trim() || '',
      order: parseInt(row[orderIdx]) || 0,
      category: row[catIdx]?.trim() || 'General',
      articleName: row[articleIdx]?.trim() || '',
      imageName: row[imageIdx]?.trim() || '',
    }));
}

async function findFileInDrive(
  drive: any,
  folderId: string,
  fileName: string
): Promise<string | null> {
  const nameWithoutExt = fileName.replace(/\.\w+$/, '');
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name contains '${nameWithoutExt}' and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 10,
  });
  const files = res.data.files || [];
  return files.length > 0 ? files[0].id : null;
}

async function downloadFile(drive: any, fileId: string): Promise<Buffer> {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

export async function importBlogPosts(
  options: { dryRun?: boolean; force?: boolean } = {}
): Promise<ImportResult> {
  const config = loadConfig();
  const { sheets, drive } = await getGoogleClients(config.googleCredentialsPath);
  const result: ImportResult = { imported: [], skipped: [], errors: [] };

  if (!options.dryRun) {
    mkdirSync(resolve(config.outputPath), { recursive: true });
    mkdirSync(resolve(config.imageOutputPath), { recursive: true });
  }

  console.log(`\n📋 Fetching manifest for "${config.appName}"...`);
  const manifest = await fetchManifest(sheets, config);
  console.log(`   Found ${manifest.length} articles\n`);

  if (manifest.length === 0) {
    console.log('No articles found for this application.');
    return result;
  }

  for (const row of manifest) {
    const slug = slugify(row.articleName);
    const outputFile = resolve(config.outputPath, `${slug}.mdx`);

    if (existsSync(outputFile) && !options.force) {
      console.log(`⏭️  Skipped: ${row.articleName} (already exists)`);
      result.skipped.push(row.articleName);
      continue;
    }

    if (options.dryRun) {
      console.log(`📝 Would import: ${row.articleName} → ${slug}.mdx`);
      result.imported.push(row.articleName);
      continue;
    }

    try {
      const articleFileId = await findFileInDrive(drive, config.driveFolderId, row.articleName);
      if (!articleFileId) throw new Error(`Article file not found in Drive: ${row.articleName}`);

      const articleBuffer = await downloadFile(drive, articleFileId);
      let markdownContent = articleBuffer.toString('utf-8');

      // Strip existing frontmatter if present
      if (markdownContent.startsWith('---')) {
        const parsed = matter(markdownContent);
        markdownContent = parsed.content;
      }

      // Download image
      let imagePath = '';
      if (row.imageName) {
        const imageFileId = await findFileInDrive(drive, config.driveFolderId, row.imageName);
        if (imageFileId) {
          const imageBuffer = await downloadFile(drive, imageFileId);
          const normalizedImageName = row.imageName.toLowerCase().replace(/\s+/g, '-');
          writeFileSync(resolve(config.imageOutputPath, normalizedImageName), imageBuffer);
          imagePath = `/images/blog/${normalizedImageName}`;
        }
      }

      // Generate MDX
      const frontmatter = [
        '---',
        `title: "${row.articleName}"`,
        `slug: "${slug}"`,
        `category: "${row.category}"`,
        `order: ${row.order}`,
        imagePath ? `image: "${imagePath}"` : null,
        `publishedAt: "${new Date().toISOString().split('T')[0]}"`,
        `author: "LukeAPI Team"`,
        '---',
      ]
        .filter(Boolean)
        .join('\n');

      writeFileSync(outputFile, `${frontmatter}\n\n${markdownContent.trim()}\n`);
      console.log(`✅ Imported: ${row.articleName} → ${slug}.mdx`);
      result.imported.push(row.articleName);

      await new Promise((r) => setTimeout(r, 100)); // Rate limit
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Error: ${row.articleName} — ${msg}`);
      result.errors.push({ article: row.articleName, error: msg });
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`   ✅ Imported: ${result.imported.length}`);
  console.log(`   ⏭️  Skipped: ${result.skipped.length}`);
  console.log(`   ❌ Errors: ${result.errors.length}\n`);

  return result;
}

// CLI entry point
if (require.main === module || process.argv[1]?.includes('import')) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const authOnly = args.includes('--auth');

  if (authOnly) {
    const config = loadConfig();
    getGoogleClients(config.googleCredentialsPath)
      .then(() => console.log('✅ Authentication successful'))
      .catch((err) => {
        console.error('❌ Authentication failed:', err.message);
        process.exit(1);
      });
  } else {
    importBlogPosts({ dryRun, force })
      .then((result) => {
        if (result.errors.length > 0) process.exit(1);
      })
      .catch((err) => {
        console.error('Fatal error:', err.message);
        process.exit(1);
      });
  }
}
