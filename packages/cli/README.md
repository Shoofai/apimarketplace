# @kineticapi/cli

Official CLI for the Kinetic API Marketplace. Discover, subscribe to, and test APIs directly from your terminal.

## Installation

```bash
npm install -g @kineticapi/cli
```

## Commands

### Authentication

```bash
kinetic auth              # Sign in interactively
kinetic auth status       # Show current login
kinetic auth logout       # Sign out
```

### Discovery

```bash
kinetic search "payment processing"
kinetic search stripe --category fintech --limit 5
kinetic search --json "image recognition"   # raw JSON output
```

### Subscribe

```bash
kinetic subscribe stripe-api              # interactive plan picker
kinetic subscribe stripe-api --plan free  # pick plan by name
```

Your API key is printed once after subscribing. Store it in your environment:

```bash
export KINETIC_API_KEY="amp_live_..."
```

### Test endpoints

```bash
kinetic test https://api.example.com/v1/ping
kinetic test https://api.example.com/v1/users --method POST --data '{"name":"Alice"}'
kinetic test https://api.example.com/v1/items -H "Authorization: Bearer $TOKEN" --json
```

## Configuration

Config is stored in `~/.kinetic/config.json`. To point the CLI at a self-hosted instance:

```bash
# Clear existing config and re-run kinetic auth — it will prompt for platform URL
kinetic auth logout
kinetic auth
```
