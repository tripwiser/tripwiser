# TripWiser Backend Deployment Guide

## Deploying to Render

### 1. **Prerequisites**
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Firebase project with service account
- GitHub repository with your code

### 2. **MongoDB Setup (MongoDB Atlas)**
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/trip_packer
   ```

### 3. **Firebase Setup**
1. Go to Firebase Console
2. Create a new project or use existing
3. Go to Project Settings > Service Accounts
4. Generate new private key
5. Download the JSON file
6. Extract the following values:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`

### 4. **Render Deployment Steps**

#### Option A: Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tripwiser-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Option B: Using render.yaml (Blue-Green Deployment)
1. Push your code with `render.yaml` to GitHub
2. In Render Dashboard, click "New +" > "Blueprint"
3. Connect your repository
4. Render will automatically detect and deploy using the configuration

### 5. **Environment Variables Setup**

In Render Dashboard, go to your service > Environment and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trip_packer
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
PEXELS_API_KEY=your-pexels-api-key
UNSPLASH_API_KEY=your-unsplash-api-key
OPENAI_API_KEY=your-openai-api-key
WEATHER_API_KEY=your-weather-api-key
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://tripwiser.app
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

### 6. **Keep-Alive Configuration (Prevent Spinning Down)**

Render's free tier spins down after 15 minutes of inactivity. We've implemented multiple solutions:

#### **Built-in Self-Pinging (Automatic)**
- The server automatically pings itself every 10 minutes
- Requires `RENDER_EXTERNAL_URL` environment variable
- No external services needed

#### **External Ping Services (Recommended)**
Set up one of these services to ping your app every 10 minutes:

**Option A: UptimeRobot (Free)**
1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create account and add new monitor
3. Set URL: `https://your-app-name.onrender.com/ping`
4. Set check interval to 5 minutes
5. Get email alerts if your app goes down

**Option B: cron-job.org (Free)**
1. Go to [cron-job.org](https://cron-job.org)
2. Create account and add new cronjob
3. Set URL: `https://your-app-name.onrender.com/ping`
4. Set schedule: `*/10 * * * *` (every 10 minutes)

**Option C: Local Keep-Alive Script**
```bash
# Run locally to keep your deployed app alive
npm run ping https://your-app-name.onrender.com
```

#### **Testing Keep-Alive**
- Visit: `https://your-app-name.onrender.com/ping`
- Should return: `{"status":"pong","timestamp":"...","uptime":...}`

### 7. **API Keys Setup**

#### Pexels API
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up and get your API key

#### Unsplash API
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create an application and get your API key

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an account and get your API key

#### Weather API
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up and get your API key

### 8. **Post-Deployment Verification**

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **Keep-Alive Test**: Visit `https://your-app-name.onrender.com/ping`
3. **API Test**: Test a simple endpoint like `/api/destinations`
4. **Database Connection**: Check logs for MongoDB connection success
5. **CORS Test**: Test from your frontend application

### 9. **Monitoring & Logs**

- **Logs**: Available in Render Dashboard > Your Service > Logs
- **Metrics**: Monitor CPU, memory, and response times
- **Alerts**: Set up alerts for downtime or errors
- **Keep-Alive Monitoring**: Check ping logs for successful pings

### 10. **Custom Domain (Optional)**

1. In Render Dashboard, go to your service > Settings
2. Click "Custom Domains"
3. Add your domain and configure DNS

### 11. **Troubleshooting**

#### Common Issues:
- **Build Failures**: Check package.json and dependencies
- **Database Connection**: Verify MongoDB URI and network access
- **CORS Errors**: Check ALLOWED_ORIGINS configuration
- **Environment Variables**: Ensure all required vars are set
- **App Spinning Down**: Check keep-alive configuration and ping logs

#### Debug Commands:
```bash
# Check if server is running
curl https://your-app-name.onrender.com/health

# Test keep-alive endpoint
curl https://your-app-name.onrender.com/ping

# Test API endpoint
curl https://your-app-name.onrender.com/api/destinations

# Check logs in Render Dashboard
```

### 12. **Production Checklist**

- [ ] MongoDB Atlas cluster created and connected
- [ ] Firebase service account configured
- [ ] All API keys obtained and configured
- [ ] Environment variables set in Render
- [ ] CORS origins configured for frontend
- [ ] RENDER_EXTERNAL_URL set for self-pinging
- [ ] External ping service configured (optional but recommended)
- [ ] Health endpoint responding
- [ ] Ping endpoint responding
- [ ] Database connection successful
- [ ] API endpoints tested
- [ ] Logs monitored for errors
- [ ] Keep-alive mechanism working
- [ ] Custom domain configured (if needed)

### 13. **Next Steps**

After successful backend deployment:
1. Update frontend API base URL to point to Render
2. Test all frontend features with production backend
3. Deploy frontend to Vercel/Netlify
4. Set up monitoring and alerts
5. Configure CI/CD for automatic deployments 