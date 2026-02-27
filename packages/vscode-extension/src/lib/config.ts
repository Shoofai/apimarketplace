import * as vscode from 'vscode';

const JWT_KEY = 'kineticapi.jwt';
const EMAIL_KEY = 'kineticapi.email';

export function getPlatformUrl(): string {
  return (
    vscode.workspace.getConfiguration('kineticapi').get<string>('platformUrl') ??
    'https://api.kineticapi.com'
  );
}

export async function storeToken(ctx: vscode.ExtensionContext, token: string, email: string): Promise<void> {
  await ctx.secrets.store(JWT_KEY, token);
  await ctx.globalState.update(EMAIL_KEY, email);
}

export async function getToken(ctx: vscode.ExtensionContext): Promise<string | undefined> {
  return ctx.secrets.get(JWT_KEY);
}

export function getEmail(ctx: vscode.ExtensionContext): string | undefined {
  return ctx.globalState.get<string>(EMAIL_KEY);
}

export async function clearToken(ctx: vscode.ExtensionContext): Promise<void> {
  await ctx.secrets.delete(JWT_KEY);
  await ctx.globalState.update(EMAIL_KEY, undefined);
}
