# Pond0x Dashboard - Cloudflare Worker Guide

## Overview
Your Cloudflare Worker is successfully deployed and handling API proxy requests for the Pond0x Dashboard. This worker solves rate limiting issues and provides reliable access to pond0x.com APIs.

## Current Deployment Status
✅ **DEPLOYED AND WORKING**
- Worker URL: `https://pond0x-api-proxy.pond0xdash.workers.dev`
- Status: Active and functioning correctly
- Last verified: September 5, 2025

## API Endpoints

### Health Endpoint
```
GET https://pond0x-api-proxy.pond0xdash.workers.dev/health?id={ADDRESS}
```
- Returns mining session data, health stats, and AI insights
- Includes CORS headers for dashboard access
- Cached with 60-second TTL

### Manifest Endpoint
```
GET https://pond0x-api-proxy.pond0xdash.workers.dev/manifest?id={ADDRESS}
```
- Returns swap data (SOL and BX swaps), PRO status, badges
- Includes CORS headers for dashboard access
- Cached with 300-second TTL (5 minutes)

## Worker Features

### 1. Rate Limiting Protection
- Handles HTTP 429 errors from pond0x.com APIs
- Implements retry logic with exponential backoff
- Graceful degradation when APIs are unavailable

### 2. CORS Support
- Adds proper CORS headers for dashboard access
- Allows cross-origin requests from your frontend

### 3. Caching
- Health data: 60-second cache
- Manifest data: 300-second cache
- Reduces API load and improves performance

### 4. Error Handling
- Returns structured error responses
- Maintains service availability during API outages

## Dashboard Integration

### Components Using Worker
1. **SwapBoostCalculator.tsx** - Uses both endpoints for Mining Rig Boost calculations
2. **MiningSessionCard.tsx** - Uses health endpoint for mining activity data
3. **Pond0xManifest.tsx** - Uses manifest endpoint for swap and PRO data

### API Cache System
The dashboard includes a comprehensive caching system (`client/src/lib/apiCache.ts`) that:
- Implements client-side caching with TTL
- Provides retry logic with exponential backoff
- Falls back to stale cached data during outages
- Shows user-friendly status indicators

## Mining Rig Boost Calculation

### Cary's Formula
```
Total Swap Boost = (SOL Swaps + BX Swaps) ÷ 6
Total Session Boost = Mining Sessions × -3
Current Boost = Total Swap Boost + Total Session Boost
Final Boost = Math.min(Math.max(Current Boost, 0), 615)
```

### Example Calculation
For address `GPieLbY26GPaje1PDs4s7maUGZNqGQNGm7FzZN3LEoLF`:
- Mining Sessions: 1,916
- SOL Swaps: 55,573
- BX Swaps: 110
- Total Swaps: 55,683
- **Result: 615 (capped)**

## Verification Commands

### Test Health Endpoint
```bash
curl -s "https://pond0x-api-proxy.pond0xdash.workers.dev/health?id=GPieLbY26GPaje1PDs4s7maUGZNqGQNGm7FzZN3LEoLF" | jq '.stats.mining_sessions'
```

### Test Manifest Endpoint
```bash
curl -s "https://pond0x-api-proxy.pond0xdash.workers.dev/manifest?id=GPieLbY26GPaje1PDs4s7maUGZNqGQNGm7FzZN3LEoLF" | jq '{proSwapsSol, proSwapsBx}'
```

### Check Response Headers
```bash
curl -v "https://pond0x-api-proxy.pond0xdash.workers.dev/health?id=GPieLbY26GPaje1PDs4s7maUGZNqGQNGm7FzZN3LEoLF"
```

## Troubleshooting

### Common Issues
1. **Rate Limiting**: Worker handles this automatically with retries
2. **CORS Errors**: Worker includes proper CORS headers
3. **Cache Issues**: TTL ensures fresh data while reducing API load

### Monitoring
- Check worker logs in Cloudflare dashboard
- Monitor API response times and error rates
- Verify cache hit rates for performance optimization

## Future Maintenance

### Updating the Worker
1. Make changes to worker script
2. Deploy using Wrangler CLI: `wrangler deploy`
3. Test endpoints after deployment
4. Update this documentation if needed

### Configuration Management
- Worker configuration is managed through Cloudflare dashboard
- Environment variables can be set for API keys or endpoints
- Route patterns can be modified for custom domains

## Success Metrics
✅ Mining Rig Boost calculations working correctly (615 cap)
✅ Rate limiting issues resolved
✅ Dashboard shows real-time mining data
✅ API caching reduces load and improves performance
✅ Error handling provides graceful degradation
✅ CORS support enables frontend integration

---

**Note**: This worker is production-ready and successfully serving the Pond0x Dashboard. No immediate changes are required.
