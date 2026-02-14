'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type VersionItem = {
  id: string | null;
  version: string;
  changelog: string | null;
  is_default: boolean | null;
  status: string | null;
  created_at: string | null;
};

export function VersionSelector({
  versions,
  currentVersion,
  onVersionChange,
}: {
  versions: VersionItem[];
  currentVersion: string;
  onVersionChange?: (version: string) => void;
}) {
  if (versions.length <= 1) {
    return <span className="font-medium">{currentVersion}</span>;
  }

  return (
    <Select
      value={currentVersion}
      onValueChange={(v) => onVersionChange?.(v)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Version" />
      </SelectTrigger>
      <SelectContent>
        {versions.map((v) => (
          <SelectItem key={v.id ?? v.version} value={v.version}>
            {v.version}
            {v.is_default ? ' (default)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
