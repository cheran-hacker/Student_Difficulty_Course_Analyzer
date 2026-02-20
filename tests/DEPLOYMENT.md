# Deployment Guide for Student Analyzer (MERN Stack)

This guide covers how to deploy your application to production. We recommend using **Render** (easiest for MERN) or a **VPS** (DigitalOcean/AWS).

## Prerequisites
1.  **GitHub Repository**: Push your code to a GitHub repository.
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```
2.  **MongoDB Atlas**: Ensure you have a cloud database connection string (not `localhost`).

## Option 1: Deploy to Render.com (Recommended)

Render can host both your Node.js backend and React frontend.

### Step 1: Database Setup
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Get your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_analyzer?retryWrites=true&w=majority`
3.  Allow Access from Anywhere (0.0.0.0/0) in Network Access (or whitelist Render's IPs later).

### Step 2: Deploy Backend (Web Service)
1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repo.
3.  **Root Directory**: `server`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node index.js`
6.  **Environment Variables**:
    *   `MONGO_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A long, secure random string.
    *   `PORT`: `10000` (Render sets this, but good to have fallback).

### Step 3: Deploy Frontend (Static Site)
1.  Create a new **Static Site** on Render.
2.  Connect your GitHub repo.
3.  **Root Directory**: `client`
4.  **Build Command**: `npm install && npm run build`
5.  **Publish Directory**: `dist`
6.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://student-analyzer-api.onrender.com`).

---

## Option 2: Deploy to VPS (Ubuntu)

If you have a Linux server (DigitalOcean, AWS, Linode).

### 1. Prepare Server
```bash
# Update and install Node.js/Nginx
sudo apt update && sudo apt upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
npm install -g pm2
```

### 2. Clone & Setup Backend
```bash
git clone <your-repo-url>
cd student_analyzer/server
npm install
# Create .env file with production values
nano .env
```
Start with PM2:
```bash
pm2 start index.js --name "student-api"
```

### 3. Build & Serve Frontend
```bash
cd ../client
npm install
npm run build
# Move build to Nginx var/www
sudo mkdir -p /var/www/student_analyzer
sudo cp -r dist/* /var/www/student_analyzer
```

### 4. Configure Nginx
Create `/etc/nginx/sites-available/student_analyzer`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/student_analyzer;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/student_analyzer /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Important Notes
*   **Secrets**: Never commit your `.env` file. Set environment variables in your hosting dashboard.
*   **Cors**: Update your backend `index.js` or `cors` config to allow requests from your production frontend domain.
