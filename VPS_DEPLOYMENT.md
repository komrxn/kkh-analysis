# 🖥️ VPS Deployment Guide (Contabo/Ubuntu)

Deploy on your own VPS server with full control - no cold starts, no limits!

---

## 📋 Server Requirements

- ✅ Ubuntu 24.04 LTS (у вас есть)
- ✅ 2GB RAM (у вас достаточно - 5% usage)
- ✅ Public IP: `95.111.250.65`
- ✅ Root/sudo access (есть)

---

## 🚀 Quick Deploy (5 minutes)

### Step 1: Push to GitHub

На вашем Mac:

```bash
cd "/Users/macbro/Desktop/Dad's/kkh-analysis"

# Инициализируйте Git (если ещё не сделали)
git init
git add .
git commit -m "Initial commit for VPS deployment"

# Создайте репозиторий на GitHub, затем:
git remote add origin https://github.com/YOUR_USERNAME/kkh-analysis.git
git branch -M main
git push -u origin main
```

### Step 2: Copy deployment script to VPS

```bash
# С вашего Mac
scp deploy-vps.sh root@95.111.250.65:/root/
```

### Step 3: Run on VPS

SSH в ваш сервер:

```bash
ssh root@95.111.250.65
```

Затем на сервере:

```bash
# Сделайте скрипт исполняемым
chmod +x /root/deploy-vps.sh

# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/kkh-analysis.git /opt/kkh-analysis

# Запустите деплой
/root/deploy-vps.sh
```

### Step 4: Access your app

После успешного деплоя откройте:

- **Frontend**: http://95.111.250.65
- **API Docs**: http://95.111.250.65/docs
- **Health**: http://95.111.250.65/health

---

## 🔧 Manual Deployment (if script fails)

<details>
<summary>Click to expand manual steps</summary>

### 1. Install Dependencies

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/kkh-analysis.git
sudo chown -R $USER:$USER kkh-analysis
cd kkh-analysis
```

### 3. Setup Backend

```bash
cd /opt/kkh-analysis/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Build Frontend

```bash
cd /opt/kkh-analysis/frontend

# Create production env
echo "VITE_API_URL=http://95.111.250.65" > .env.production

# Install and build
npm install
npm run build
```

### 5. Create Backend Service

```bash
sudo nano /etc/systemd/system/kkh-backend.service
```

Paste:

```ini
[Unit]
Description=KKH Analysis Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kkh-analysis/backend
Environment="PATH=/opt/kkh-analysis/backend/venv/bin"
Environment="PORT=8000"
Environment="FRONTEND_URL=http://95.111.250.65"
ExecStart=/opt/kkh-analysis/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kkh-backend
sudo systemctl start kkh-backend
sudo systemctl status kkh-backend
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/kkh-analysis
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /opt/kkh-analysis/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health & Docs
    location ~ ^/(health|docs|openapi.json) {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -sf /etc/nginx/sites-available/kkh-analysis /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

</details>

---

## 🔒 Optional: Add SSL (HTTPS)

If you have a domain (e.g., `analysis.yourdomain.com`):

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d analysis.yourdomain.com

# Auto-renewal is set up automatically
```

Update frontend `.env.production`:
```bash
echo "VITE_API_URL=https://analysis.yourdomain.com" > /opt/kkh-analysis/frontend/.env.production
cd /opt/kkh-analysis/frontend
npm run build
```

---

## 📊 Management Commands

### Check Status

```bash
# Backend status
sudo systemctl status kkh-backend

# Nginx status
sudo systemctl status nginx

# View backend logs
sudo journalctl -u kkh-backend -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart kkh-backend

# Restart nginx
sudo systemctl restart nginx
```

### Update Deployment

```bash
cd /opt/kkh-analysis

# Pull latest changes
git pull

# Rebuild frontend
cd frontend
npm run build

# Restart backend
sudo systemctl restart kkh-backend

# Restart nginx
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Backend not starting

```bash
# Check logs
sudo journalctl -u kkh-backend -n 50

# Check if port 8000 is in use
sudo lsof -i :8000

# Test manually
cd /opt/kkh-analysis/backend
source venv/bin/activate
python app.py
```

### Nginx errors

```bash
# Test config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Port conflicts

Your Telegram bot shouldn't conflict (different port), but check:

```bash
# See all listening ports
sudo netstat -tulpn | grep LISTEN
```

---

## 🔥 Firewall Setup (Important!)

Make sure ports are open:

```bash
# Check if firewall is active
sudo ufw status

# If active, allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp  # Optional: direct backend access
```

---

## 💰 Cost

- **VPS**: You already pay for Contabo
- **SSL**: FREE (Let's Encrypt)
- **Total extra cost**: **$0/month**

---

## ✅ Advantages vs Render/Vercel

✅ No cold starts (always running)
✅ No memory limits (full RAM available)
✅ No timeouts
✅ Full control
✅ Faster in your region
✅ Can handle heavy files
✅ Everything on one server

---

## 📱 Your Setup

After deployment:

```
Server: 95.111.250.65
├── Port 80/443: Frontend + Nginx (your analysis app)
├── Port 8000: Backend (internal)
└── Port XXXX: Your Telegram bot (unchanged)
```

Both will work independently! 🎉

