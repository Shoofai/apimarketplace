import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

const ConfigSchema = z.object({
  appName: z.string().min(1),
  googleSheetId: z.string().min(1),
  sheetName: z.string().optional().default('Sheet1'),
  driveFolderId: z.string().min(1),
  outputPath: z.string().default('./content/blog'),
  imageOutputPath: z.string().default('./public/images/blog'),
  googleCredentialsPath: z.string().default('./blog-import-oauth-credentials.json'),
});

export type BlogImportConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(): BlogImportConfig {
  const configPath = resolve(process.cwd(), 'blog-import.config.json');
  if (!existsSync(configPath)) {
    throw new Error(
      `Config not found at ${configPath}. Copy blog-import.config.example.json and fill in your values.`
    );
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return ConfigSchema.parse(raw);
}
