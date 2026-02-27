'use client';

import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface MessageContentProps {
  content: string;
  language?: string;
  className?: string;
}

/**
 * Renders message content with fenced code blocks (```lang\n...\n```) using syntax highlighting.
 * Non-code text is rendered as plain text with preserved newlines.
 */
export function MessageContent({ content, language = 'text', className = '' }: MessageContentProps) {
  const parts = useMemo(() => parseContentWithCodeBlocks(content), [content]);

  return (
    <div className={`text-sm space-y-3 ${className}`}>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <pre key={i} className="whitespace-pre-wrap font-sans break-words">
            {part.value}
          </pre>
        ) : (
          <div key={i} className="rounded-md overflow-hidden border bg-muted/50">
            <SyntaxHighlighter
              language={part.lang || language}
              style={oneDark}
              customStyle={{ margin: 0, padding: '0.75rem 1rem', fontSize: '0.8125rem' }}
              showLineNumbers={false}
              PreTag="div"
              codeTagProps={{ className: 'font-mono' }}
            >
              {part.value}
            </SyntaxHighlighter>
          </div>
        )
      )}
    </div>
  );
}

interface ContentPart {
  type: 'text' | 'code';
  value: string;
  lang?: string;
}

function parseContentWithCodeBlocks(content: string): ContentPart[] {
  if (!content.trim()) return [{ type: 'text', value: '' }];
  const parts: ContentPart[] = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
    }
    parts.push({ type: 'code', value: m[2].trimEnd(), lang: m[1] || undefined });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', value: content });
  }
  return parts;
}
