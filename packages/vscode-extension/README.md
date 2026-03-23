# LukeAPI Marketplace — VS Code Extension

Discover, test, and generate code for marketplace APIs directly in VS Code and Cursor.

## Features

- **API Explorer** sidebar — browse your subscribed APIs and their quick-action shortcuts
- **Search** — search the marketplace catalog via a QuickPick
- **Generate code snippet** — AI-powered code generation using Claude, inserted at your cursor position
- **Test endpoint** — send HTTP requests through the LukeAPI proxy and view responses in a split pane

## Getting Started

1. Install the extension
2. Open the **LukeAPIs** panel from the activity bar (cloud icon)
3. Click **Sign in to LukeAPI** and enter your platform credentials
4. Your subscriptions will appear in the tree view

## Commands

| Command | Description |
|---|---|
| `LukeAPI: Sign In` | Authenticate with the marketplace |
| `LukeAPI: Sign Out` | Clear stored credentials |
| `LukeAPI: Search APIs` | Search the marketplace catalog |
| `LukeAPI: Generate Code Snippet` | Generate an AI-powered code snippet for an API |
| `LukeAPI: Test API Endpoint` | Test an endpoint through the platform proxy |

## Settings

| Setting | Default | Description |
|---|---|---|
| `lukeapi.platformUrl` | `https://api.lukeapi.com` | Override for self-hosted instances |
