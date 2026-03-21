'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Palette, ImageIcon, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

function LogoUploadCard({
  title,
  description,
  currentSrc,
  previewSize,
  accept,
  onUpload,
  previewBg = 'light',
}: {
  title: string;
  description: string;
  currentSrc: string;
  previewSize: number;
  accept: string;
  onUpload: (file: File) => Promise<void>;
  /** Which background to preview on — 'light' for white bg, 'dark' for dark bg */
  previewBg?: 'light' | 'dark';
}) {
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setState({ status: 'error', message: 'File must be under 2MB' });
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setState({ status: 'uploading' });
    try {
      await onUpload(file);
      setState({ status: 'success', message: 'Uploaded successfully! Changes will appear on next page load.' });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Upload failed' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {preview ? 'New' : 'Current'}
            </p>
            <div
              className={`flex items-center justify-center rounded-lg border p-4 ${
                previewBg === 'dark'
                  ? 'border-gray-700 bg-gray-900'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Image
                src={preview || currentSrc}
                alt={title}
                width={previewSize}
                height={previewSize}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          {preview && (
            <Badge variant="outline" className="border-green-300 text-green-600">
              <Check className="mr-1 h-3 w-3" /> Ready to save
            </Badge>
          )}
        </div>

        {/* Upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={state.status === 'uploading'}
            className="gap-2"
          >
            {state.status === 'uploading' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {state.status === 'uploading' ? 'Uploading...' : 'Upload new'}
          </Button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, or ICO. Max 2MB. Recommended: SVG for best quality.
          </p>
        </div>

        {/* Status */}
        {state.status === 'success' && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <Check className="h-4 w-4" />
            {state.message}
          </div>
        )}
        {state.status === 'error' && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {state.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BrandingSettings() {
  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');

    const res = await fetch('/api/admin/branding/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleLogoDarkUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo-dark');

    const res = await fetch('/api/admin/branding/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleFaviconUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'favicon');

    const res = await fetch('/api/admin/branding/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(data.error || 'Upload failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branding</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your platform logo and favicon. Changes apply across the entire application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LogoUploadCard
          title="Logo (Light Mode)"
          description="Used on light backgrounds — navbar, footer, emails, and auth pages."
          currentSrc="/logo.svg"
          previewSize={48}
          accept=".svg,.png,.jpg,.jpeg,.webp"
          onUpload={handleLogoUpload}
          previewBg="light"
        />
        <LogoUploadCard
          title="Logo (Dark Mode)"
          description="Used on dark backgrounds — dark theme navbar, footer, and dashboard."
          currentSrc="/logo-dark.svg"
          previewSize={48}
          accept=".svg,.png,.jpg,.jpeg,.webp"
          onUpload={handleLogoDarkUpload}
          previewBg="dark"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LogoUploadCard
          title="Favicon"
          description="Browser tab icon. Shown in bookmarks and browser tabs."
          currentSrc="/favicon.svg"
          previewSize={32}
          accept=".svg,.png,.ico"
          onUpload={handleFaviconUpload}
        />
      </div>

      {/* Info */}
      <Card className="border-primary-200 bg-primary-50/50 dark:border-primary-800/50 dark:bg-primary-900/10">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-primary-900 dark:text-primary-300">How it works</h3>
          <ul className="mt-2 space-y-1 text-xs text-primary-700 dark:text-primary-400">
            <li>&#8226; Light logo replaces <code className="rounded bg-primary-100 px-1 dark:bg-primary-900/30">/public/logo.svg</code>, dark logo replaces <code className="rounded bg-primary-100 px-1 dark:bg-primary-900/30">/public/logo-dark.svg</code></li>
            <li>&#8226; SVG format is recommended for crisp rendering at all sizes</li>
            <li>&#8226; The component auto-switches between light and dark variants based on theme</li>
            <li>&#8226; Changes take effect on next page load (browser cache may need clearing)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
