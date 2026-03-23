# lukeapi/check-sla

GitHub Action that fails a CI pipeline if an upstream API on the LukeAPI Marketplace has a degraded SLA.

## Usage

```yaml
- name: Check upstream API SLA
  uses: lukeapi/check-sla@v1
  with:
    api-id: ${{ vars.PAYMENTS_API_ID }}
    platform-url: https://api.lukeapi.com
    api-token: ${{ secrets.LUKEAPI_TOKEN }}
    fail-on-breach: true
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `api-id` | Yes | — | LukeAPI UUID (from the API detail page URL) |
| `platform-url` | No | `https://api.lukeapi.com` | Platform URL (override for self-hosted) |
| `api-token` | Yes | — | Bearer token for authentication |
| `fail-on-breach` | No | `true` | Set to `false` to report without failing |
| `min-uptime` | No | — | Custom uptime % threshold (overrides API-defined target) |
| `max-latency-p95` | No | — | Custom P95 latency ms threshold |

## Outputs

| Output | Description |
|---|---|
| `sla-status` | `ok`, `breached`, `no-definition`, or `no-data` |
| `uptime` | Uptime % of the last measurement window |
| `latency-p95` | P95 latency (ms) of the last measurement window |
| `violations-count` | Number of unacknowledged SLA violations |
| `within-sla` | `true` or `false` |

## Getting a token

Authenticate with the LukeAPI CLI and copy the JWT from `~/.lukeapi/config.json`:

```bash
npx @lukeapi/cli auth
cat ~/.lukeapi/config.json | jq -r .access_token
```

Store it as a repository secret named `LUKEAPI_TOKEN`.

## Finding your API ID

Open the API detail page in the marketplace and copy the UUID from the URL:
`/marketplace/{org}/{api}` → go to Dashboard → APIs → copy the ID from the URL.

Or use the CLI:

```bash
lukeapi search "your api name" --json | jq -r '.apis[0].id'
```

## Example: multi-API dependency check

```yaml
jobs:
  sla-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Payments API SLA
        uses: lukeapi/check-sla@v1
        id: payments
        with:
          api-id: ${{ vars.PAYMENTS_API_ID }}
          api-token: ${{ secrets.LUKEAPI_TOKEN }}
          fail-on-breach: false   # warn but don't block

      - name: Check Geocoding API SLA
        uses: lukeapi/check-sla@v1
        with:
          api-id: ${{ vars.GEOCODING_API_ID }}
          api-token: ${{ secrets.LUKEAPI_TOKEN }}

      - name: Report payment SLA
        if: steps.payments.outputs.sla-status == 'breached'
        run: echo "⚠️ Payments API SLA breached — uptime ${{ steps.payments.outputs.uptime }}%"
```
