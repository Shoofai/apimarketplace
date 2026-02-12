# Kong Gateway Setup for APIMarketplace Pro

This document explains how to set up and run Kong Gateway for local development.

## Prerequisites

- Docker and Docker Compose installed
- Ports 8000, 8001, 8443, 8444, and 5433 available

## Starting Kong

```bash
# Start Kong Gateway with PostgreSQL
docker-compose -f docker-compose.kong.yml up -d

# Check status
docker-compose -f docker-compose.kong.yml ps

# View logs
docker-compose -f docker-compose.kong.yml logs -f kong
```

## Verifying Installation

```bash
# Check Kong admin API
curl http://localhost:8001/status

# Should return Kong version and database status
```

## Stopping Kong

```bash
# Stop all services
docker-compose -f docker-compose.kong.yml down

# Stop and remove volumes (clears database)
docker-compose -f docker-compose.kong.yml down -v
```

## Kong URLs

- **Proxy (public)**: http://localhost:8000
- **Admin API**: http://localhost:8001
- **Proxy SSL**: https://localhost:8443
- **Admin SSL**: https://localhost:8444

## How APIMarketplace Uses Kong

1. **Service Creation**: When an API is published, we create a Kong Service pointing to the upstream API
2. **Route Configuration**: Routes map incoming requests to services based on URL path
3. **Plugins**: 
   - `key-auth`: Validates API keys in X-API-Key header
   - `rate-limiting`: Enforces plan-based rate limits
   - `cors`: Handles cross-origin requests
   - `http-log`: Sends request logs to our Edge Function

## Route Pattern

All API requests follow this pattern:
```
http://localhost:8000/v1/{org_slug}/{api_slug}/{endpoint_path}
```

For example:
```
http://localhost:8000/v1/acme/weather/forecast?city=NYC
```

This gets proxied to the upstream API at:
```
https://api.acme.com/forecast?city=NYC
```

## Troubleshooting

### Port Conflicts

If port 8000 or 8001 is already in use, edit `docker-compose.kong.yml` and change the port mapping:

```yaml
ports:
  - "8080:8000"  # Use 8080 instead of 8000
```

Then update `KONG_PROXY_URL` in `.env.local`.

### Database Connection Issues

If Kong can't connect to PostgreSQL:

```bash
# Check PostgreSQL container status
docker-compose -f docker-compose.kong.yml logs kong-database

# Restart migrations
docker-compose -f docker-compose.kong.yml restart kong-migrations
```

### Clearing Kong Configuration

To reset Kong completely:

```bash
docker-compose -f docker-compose.kong.yml down -v
docker-compose -f docker-compose.kong.yml up -d
```

## Development Without Kong

If you don't want to run Kong locally, set `ENABLE_KONG=false` in `.env.local`. The application will use a mock proxy endpoint at `/api/proxy` for testing.

## Production Deployment

For production, consider using:
- **Kong Konnect**: Managed Kong service
- **AWS API Gateway**: Alternative managed solution
- **Self-hosted Kong**: On Kubernetes or VM with high availability

See `DEPLOYMENT.md` for production setup instructions.
