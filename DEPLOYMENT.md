# 🚀 Free Deployment Guide

Deploy the ANOVA/PCA Analysis Platform for **$0/month** using Render (backend) and Vercel (frontend).

---

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Project pushed to GitHub repository

---

## 🔧 Part 1: Deploy Backend to Render.com

### Step 1: Create GitHub Repository

```bash
cd "/Users/macbro/Desktop/Dad's/kkh-analysis"
git init
git add .
git commit -m "feat(deploy): add free deployment configs for Render and Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kkh-analysis.git
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `kkh-analysis` repository
4. Configure the service:
   - **Name**: `kkh-analysis-backend`
   - **Region**: `Oregon` (or nearest free region)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free** (512MB RAM)

5. Add Environment Variables:
   - Click **"Environment"** tab
   - Add: `FRONTEND_URL` = `https://your-app.vercel.app` (temporary, update later)
   - Add: `PYTHON_VERSION` = `3.11.9`

6. Click **"Create Web Service"**

7. **Copy the backend URL** (e.g., `https://kkh-analysis-backend.onrender.com`)

### Step 3: Test Backend

Once deployed, test the health endpoint:

```bash
curl https://YOUR-BACKEND-URL.onrender.com/health
```

Expected response:
```json
{"status":"healthy","service":"analysis-backend"}
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import your `kkh-analysis` repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com` (from Step 2)

6. Click **"Deploy"**

7. **Copy the frontend URL** (e.g., `https://kkh-analysis.vercel.app`)

### Step 2: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL: `https://YOUR-APP.vercel.app`
5. Click **"Save Changes"** (backend will redeploy)

---

## ✅ Part 3: Test Deployment

### Test Full Flow

1. Open your Vercel URL: `https://YOUR-APP.vercel.app`
2. Upload test file: `backend/test_data_example.csv`
3. Select **ANOVA** analysis
4. Click **"Run Analysis"**
5. Verify results appear

### Check API Documentation

Visit: `https://YOUR-BACKEND-URL.onrender.com/docs`

---

## 🔄 Continuous Deployment

Now your app auto-deploys:

- **Push to `main`** → Both frontend and backend redeploy automatically
- **Backend**: ~2-3 min build time
- **Frontend**: ~1 min build time

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
# ✅ Auto-deployed!
```

---

## ⚙️ Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ⏱️ **Cold starts**: 30-60s after 15 min inactivity
- 💾 **RAM**: 512MB
- 📊 **Build**: 90 sec timeout
- 🔄 **Auto-sleep**: After 15 min inactivity

**Vercel Free Tier:**
- ✅ Unlimited bandwidth
- ✅ No cold starts
- ✅ Global CDN
- 📦 100GB bandwidth/month

### Cold Start Solutions

If backend is sleeping, first request will take ~30-60s. Solutions:

1. **UptimeRobot** (free): Ping backend every 5 minutes
   ```
   https://uptimerobot.com
   Monitor Type: HTTP(s)
   URL: https://YOUR-BACKEND-URL.onrender.com/health
   Interval: 5 minutes
   ```

2. **Show loading message**: Frontend already shows "Analyzing..." during waits

---

## 🔒 Security Best Practices

### Environment Variables

Never commit these files:
- `.env`
- `.env.local`
- `.env.production`

Already gitignored, but verify:

```bash
cat .gitignore | grep .env
```

### CORS Configuration

Backend CORS is configured to only accept requests from:
- `http://localhost:8080` (local dev)
- Your production frontend URL (from `FRONTEND_URL` env var)

Update `backend/app.py` if you need additional origins.

---

## 🐛 Troubleshooting

### Backend Errors

**"Application failed to respond"**
- Check Render logs: Service → Logs tab
- Verify `requirements.txt` has all dependencies
- Ensure `uvicorn` command is correct

**"CORS error"**
- Verify `FRONTEND_URL` env var matches your Vercel URL (include `https://`)
- Check backend logs for allowed origins

### Frontend Errors

**"Network error"**
- Verify `VITE_API_URL` in Vercel env vars
- Test backend directly: `curl https://YOUR-BACKEND.onrender.com/health`
- Check browser console for CORS errors

**Build fails**
- Check Vercel build logs
- Ensure `frontend/` is set as root directory
- Verify `node_modules` is not committed

### Cold Start Taking Forever

- First request after sleep takes 30-60s (normal for Render free tier)
- Set up UptimeRobot to prevent sleep
- Consider upgrading to Render paid tier ($7/mo, no sleep)

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Render (Backend) | Free | $0/mo |
| Vercel (Frontend) | Hobby | $0/mo |
| UptimeRobot (optional) | Free | $0/mo |
| **Total** | | **$0/mo** |

---

## 🚀 Upgrade Options (Optional)

If you need better performance:

### Render Pro ($7/mo)
- No cold starts
- 512MB → 2GB RAM
- Faster builds

### Vercel Pro ($20/mo)
- More bandwidth
- Advanced analytics
- Team features

---

## 📚 Useful Links

- 📖 [Render Docs](https://render.com/docs)
- 📖 [Vercel Docs](https://vercel.com/docs)
- 🔧 [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- 🎨 [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## 🎉 You're Live!

Your app is now deployed and accessible worldwide:

- **Frontend**: `https://YOUR-APP.vercel.app`
- **Backend**: `https://YOUR-BACKEND.onrender.com`
- **API Docs**: `https://YOUR-BACKEND.onrender.com/docs`

Share the frontend URL with users! 🎊

