# Troubleshooting Guide - 404 Errors

## Common Causes of 404 Errors

### 1. Server Not Running
**Symptom:** 404 error on all API requests

**Solution:**
```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### 2. Wrong API Endpoint
**Symptom:** 404 on specific routes

**Check:**
- Frontend calls: `/api/auth/login`
- Server route: `app.use('/api/auth', authRoutes)` + `router.post('/login', ...)`
- Full path should be: `/api/auth/login` ✅

### 3. Proxy Not Working
**Symptom:** 404 in browser, but server shows request

**Solution:**
- Check `client/vite.config.ts` has proxy configured
- Restart Vite dev server after changing proxy config
- Try accessing directly: `http://localhost:5000/api/health`

### 4. Route Not Registered
**Symptom:** 404 with route logging showing "Route not found"

**Check:**
- Route is imported in `server/server.js`
- Route is registered with `app.use('/api/...', routeName)`
- Route file exports default router

## Debug Steps

1. **Check Server Logs**
   - Look for request logs: `POST /api/auth/login`
   - Check for 404 messages

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK",...}`

3. **Test Login Endpoint Directly**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@issat.tn","password":"password123"}'
   ```

4. **Check Browser Network Tab**
   - Open DevTools → Network
   - Look at the failed request
   - Check Request URL (should be `/api/auth/login`)
   - Check Response (should show 404 details)

5. **Check Server Console**
   - Should show: `POST /api/auth/login`
   - If not showing, request isn't reaching server

## Quick Fixes

### Restart Everything
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear cache in DevTools

### Check Ports
- Backend should be on port 5000
- Frontend should be on port 5173 (Vite default)
- Check if ports are already in use

## Expected Behavior

**Working Login Flow:**
1. Frontend: `POST /api/auth/login` (via proxy)
2. Vite Proxy: Forwards to `http://127.0.0.1:5000/api/auth/login`
3. Server: Receives request, processes, returns response
4. Frontend: Receives response with token

**If 404:**
- Server logs will show: `❌ 404 - Route not found: POST /api/auth/login`
- This means the route isn't registered correctly

