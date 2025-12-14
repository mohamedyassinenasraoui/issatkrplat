# Quick Fix for 404 Error

## The Problem
Getting `404 (Not Found)` on `/api/auth/login`

## Solution Steps

### 1. Make sure backend server is running
```bash
cd server
npm run dev
```

**You MUST see:**
```
🚀 Server running on port 5000
📡 Local: http://localhost:5000
```

### 2. Test the endpoint directly
Open in browser: `http://localhost:5000/api/health`

Should return JSON with `"status": "OK"`

### 3. Check server console when you try to login
You should see:
```
[HH:MM:SS] POST /api/auth/login
  Body: {"email":"...","password":"..."}
```

**If you DON'T see this**, the request isn't reaching the server (proxy issue).

**If you DO see this but get 404**, the route isn't registered correctly.

### 4. Restart both servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Clear browser cache
- Press `Ctrl+Shift+R` (hard refresh)
- Or clear cache in DevTools

### 6. Check browser Network tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the `/api/auth/login` request
5. Check:
   - Request URL (should be `http://localhost:5173/api/auth/login`)
   - Status (404?)
   - Response (what does it say?)

## Common Issues

### Issue 1: Server not running
**Symptom:** No logs in server console
**Fix:** Start server with `npm run dev` in server directory

### Issue 2: Proxy not working
**Symptom:** Request shows in browser but not in server console
**Fix:** 
- Check `client/vite.config.ts` has proxy config
- Restart Vite dev server
- Try accessing `http://localhost:5000/api/auth/login` directly

### Issue 3: Route not found
**Symptom:** Server shows request but returns 404
**Fix:** Check `server/routes/auth.js` exists and exports router correctly

### Issue 4: Port conflict
**Symptom:** Server won't start
**Fix:** Change PORT in `server/.env` or kill process using port 5000

## Test Commands

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@issat.tn\",\"password\":\"password123\"}"
```

If curl works but browser doesn't, it's a proxy/CORS issue.
If curl doesn't work, the server isn't running or route isn't registered.

