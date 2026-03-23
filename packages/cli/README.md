# @lukeapi/cli

Official CLI for the LukeAPI Marketplace. Discover, subscribe to, and test APIs directly from your terminal.

## Installation

```bash
npm install -g @lukeapi/cli
```

## Commands

### Authentication

```bash
lukeapi auth              # Sign in interactively
lukeapi auth status       # Show current login
lukeapi auth logout       # Sign out
```

### Discovery

```bash
lukeapi search "payment processing"
lukeapi search stripe --category fintech --limit 5
lukeapi search --json "image recognition"   # raw JSON output
```

### Subscribe

```bash
lukeapi subscribe stripe-api              # interactive plan picker
lukeapi subscribe stripe-api --plan free  # pick plan by name
```

Your API key is printed once after subscribing. Store it in your environment:

```bash
export LUKEAPI_KEY="amp_live_..."
```

### Test endpoints

```bash
lukeapi test https://api.example.com/v1/ping
lukeapi test https://api.example.com/v1/users --method POST --data '{"name":"Alice"}'
lukeapi test https://api.example.com/v1/items -H "Authorization: Bearer $TOKEN" --json
```

## Configuration

Config is stored in `~/.lukeapi/config.json`. To point the CLI at a self-hosted instance:

```bash
# Clear existing config and re-run lukeapi auth — it will prompt for platform URL
lukeapi auth logout
lukeapi auth
```
