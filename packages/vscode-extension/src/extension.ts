import * as vscode from 'vscode';
import { APITreeProvider } from './providers/APITreeProvider';
import { storeToken, getToken, clearToken, getEmail, getPlatformUrl } from './lib/config';
import { apiFetch, apiJson } from './lib/client';

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new APITreeProvider(context);
  vscode.window.registerTreeDataProvider('kineticapi.apiExplorer', treeProvider);

  // ── Auth ──────────────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.auth', async () => {
      const email = await vscode.window.showInputBox({
        prompt: 'Kinetic API — Email address',
        placeHolder: 'you@example.com',
        validateInput: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email',
      });
      if (!email) return;

      const password = await vscode.window.showInputBox({
        prompt: 'Kinetic API — Password',
        password: true,
      });
      if (!password) return;

      try {
        // Fetch Supabase credentials from the platform
        const cfgRes = await apiFetch('/api/auth/cli-config');
        if (!cfgRes.ok) throw new Error('Cannot reach the platform. Check kineticapi.platformUrl in settings.');
        const { supabase_url, supabase_anon_key } = await cfgRes.json() as {
          supabase_url: string;
          supabase_anon_key: string;
        };

        const res = await fetch(`${supabase_url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase_anon_key,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json() as any;
        if (!res.ok) throw new Error(data.error_description ?? data.msg ?? 'Sign-in failed');

        await storeToken(context, data.access_token, email);
        treeProvider.refresh();
        vscode.window.showInformationMessage(`Kinetic: Signed in as ${email}`);
      } catch (e) {
        vscode.window.showErrorMessage(`Kinetic: ${e instanceof Error ? e.message : 'Sign-in failed'}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.logout', async () => {
      await clearToken(context);
      treeProvider.refresh();
      vscode.window.showInformationMessage('Kinetic: Signed out.');
    })
  );

  // ── Refresh tree ──────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.refreshTree', () => treeProvider.refresh())
  );

  // ── Search ────────────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.search', async () => {
      const query = await vscode.window.showInputBox({
        prompt: 'Search Kinetic API Marketplace',
        placeHolder: 'e.g. payment processing, geolocation, weather',
      });
      if (!query) return;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `Searching for "${query}"…`, cancellable: false },
        async () => {
          try {
            const data = await apiJson<{ apis: { name: string; slug: string; short_description?: string; organization: { name: string; slug: string } }[] }>(
              `/api/marketplace/search?q=${encodeURIComponent(query)}&limit=10`
            );

            if (!data.apis?.length) {
              vscode.window.showInformationMessage(`No APIs found for "${query}"`);
              return;
            }

            const items = data.apis.map((a) => {
              const org = a.organization?.name ?? '';
              return {
                label: a.name,
                description: org,
                detail: a.short_description ?? '',
                api: a,
              };
            });

            const picked = await vscode.window.showQuickPick(items, {
              placeHolder: 'Select an API to open in the marketplace',
              matchOnDescription: true,
              matchOnDetail: true,
            });

            if (picked) {
              const url = `${getPlatformUrl()}/marketplace/${picked.api.organization?.slug}/${picked.api.slug}`;
              vscode.env.openExternal(vscode.Uri.parse(url));
            }
          } catch (e) {
            vscode.window.showErrorMessage(`Search failed: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      );
    })
  );

  // ── Generate Snippet ──────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.generateSnippet', async (apiId?: string, apiSlug?: string, orgSlug?: string) => {
      const token = await getToken(context);
      if (!token) {
        vscode.window.showErrorMessage('Kinetic: Sign in first (run "Kinetic: Sign In")');
        return;
      }

      // If not invoked from tree (no apiId), prompt user to search
      let resolvedApiId = apiId;
      if (!resolvedApiId) {
        const query = await vscode.window.showInputBox({
          prompt: 'API name or slug to generate snippet for',
          placeHolder: 'e.g. stripe-api',
        });
        if (!query) return;
        const data = await apiJson<{ apis: { id: string; name: string; slug: string }[] }>(
          `/api/marketplace/search?q=${encodeURIComponent(query)}&limit=5`
        );
        const picked = await vscode.window.showQuickPick(
          (data.apis ?? []).map((a) => ({ label: a.name, description: a.slug, id: a.id })),
          { placeHolder: 'Select API' }
        );
        if (!picked) return;
        resolvedApiId = picked.id;
      }

      const langMap: Record<string, string> = { typescript: 'typescript', javascript: 'javascript', python: 'python', go: 'go' };
      const currentLang = vscode.window.activeTextEditor?.document.languageId ?? 'typescript';
      const language = langMap[currentLang] ?? 'typescript';

      const prompt = await vscode.window.showInputBox({
        prompt: 'What would you like the snippet to do?',
        placeHolder: 'e.g. Fetch the list of customers with pagination',
        value: `Generate a ${language} code snippet that calls this API`,
      });
      if (!prompt) return;

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Generating code snippet…', cancellable: false },
        async () => {
          try {
            const res = await apiFetch('/api/ai/playground', {
              method: 'POST',
              token,
              body: JSON.stringify({ apiId: resolvedApiId, userPrompt: prompt, language }),
            });

            if (!res.ok || !res.body) {
              const err = await res.json().catch(() => ({})) as any;
              throw new Error(err.error ?? `HTTP ${res.status}`);
            }

            // Collect streaming response
            let code = '';
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              for (const line of chunk.split('\n')) {
                if (line.startsWith('data: ')) {
                  const payload = line.slice(6);
                  if (payload === '[DONE]') break;
                  try { code += JSON.parse(payload).delta ?? ''; } catch {}
                }
              }
            }

            if (!code.trim()) {
              vscode.window.showWarningMessage('No code was generated.');
              return;
            }

            // Insert at cursor or open new doc
            const editor = vscode.window.activeTextEditor;
            if (editor) {
              editor.edit((eb) => eb.insert(editor.selection.active, `\n${code}\n`));
            } else {
              const doc = await vscode.workspace.openTextDocument({ content: code, language });
              vscode.window.showTextDocument(doc);
            }
          } catch (e) {
            vscode.window.showErrorMessage(`Snippet failed: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      );
    })
  );

  // ── Test Endpoint ─────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand('kineticapi.testEndpoint', async (apiId?: string, apiSlug?: string, orgSlug?: string) => {
      const token = await getToken(context);
      if (!token) {
        vscode.window.showErrorMessage('Kinetic: Sign in first (run "Kinetic: Sign In")');
        return;
      }

      const url = await vscode.window.showInputBox({
        prompt: 'Endpoint URL to test',
        placeHolder: 'https://api.example.com/v1/resource',
        validateInput: (v) => v.startsWith('http') ? null : 'Enter a full URL starting with http(s)://',
      });
      if (!url) return;

      const methodPick = await vscode.window.showQuickPick(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
        placeHolder: 'HTTP method',
      });
      if (!methodPick) return;

      let body: string | undefined;
      if (['POST', 'PUT', 'PATCH'].includes(methodPick)) {
        body = await vscode.window.showInputBox({
          prompt: 'Request body (JSON)',
          placeHolder: '{"key": "value"}',
        }) ?? undefined;
      }

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `${methodPick} ${url}`, cancellable: false },
        async () => {
          try {
            const result = await apiJson<{ status: number; headers: Record<string, string>; body: unknown; latency: number }>(
              '/api/proxy',
              {
                method: 'POST',
                token,
                body: JSON.stringify({ method: methodPick, url, body }),
              }
            );

            const content = [
              `# ${methodPick} ${url}`,
              `## Status: ${result.status} (${result.latency}ms)`,
              '',
              '## Response Body',
              '```json',
              typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2),
              '```',
              '',
              '## Response Headers',
              ...Object.entries(result.headers ?? {}).map(([k, v]) => `- ${k}: ${v}`),
            ].join('\n');

            const doc = await vscode.workspace.openTextDocument({ content, language: 'markdown' });
            vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside });
          } catch (e) {
            vscode.window.showErrorMessage(`Request failed: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      );
    })
  );
}

export function deactivate(): void {}
