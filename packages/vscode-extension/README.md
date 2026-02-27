# Kinetic API Marketplace — VS Code Extension

Discover, test, and generate code for marketplace APIs directly in VS Code and Cursor.

## Features

- **API Explorer** sidebar — browse your subscribed APIs and their quick-action shortcuts
- **Search** — search the marketplace catalog via a QuickPick
- **Generate code snippet** — AI-powered code generation using Claude, inserted at your cursor position
- **Test endpoint** — send HTTP requests through the Kinetic proxy and view responses in a split pane

## Getting Started

1. Install the extension
2. Open the **Kinetic APIs** panel from the activity bar (cloud icon)
3. Click **Sign in to Kinetic** and enter your platform credentials
4. Your subscriptions will appear in the tree view

## Commands

| Command | Description |
|---|---|
| `Kinetic: Sign In` | Authenticate with the marketplace |
| `Kinetic: Sign Out` | Clear stored credentials |
| `Kinetic: Search APIs` | Search the marketplace catalog |
| `Kinetic: Generate Code Snippet` | Generate an AI-powered code snippet for an API |
| `Kinetic: Test API Endpoint` | Test an endpoint through the platform proxy |

## Settings

| Setting | Default | Description |
|---|---|---|
| `kineticapi.platformUrl` | `https://api.kineticapi.com` | Override for self-hosted instances |
