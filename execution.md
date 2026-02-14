# Server Execution Guide

This document contains the exact terminal commands to start the frontend and backend servers manually.

## Prerequisites

1. Ensure you have Node.js installed (v18 or higher recommended)
2. Install dependencies: `npm install`
3. Ensure `.env` file exists with required environment variables

## Starting the Servers

### Option 1: Start Backend and Frontend Separately (Recommended)

#### Terminal 1 - Backend Server
```bash
cd /Users/hetkasundra/Downloads/interview_bhois
npm run server
```

**Expected Output:**
```
🚀 Server running on http://localhost:3001
📝 A4F API endpoint: http://localhost:3001/api/generate-questions-a4f
🤖 AI Evaluation endpoints available
```

#### Terminal 2 - Frontend Server
```bash
cd /Users/hetkasundra/Downloads/interview_bhois
npm run dev
```

**Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Option 2: Start Both Servers with Concurrently (If Available)

If you have `concurrently` installed, you can use:

```bash
cd /Users/hetkasundra/Downloads/interview_bhois
npm run dev:full
```

**Note:** This requires `concurrently` package. If not installed, use Option 1.

## Server URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## Environment Variables

Ensure your `.env` file contains:

```env
VITE_PUBLIC_SUPABASE_ANON_KEY="your_supabase_key"
VITE_PUBLIC_SUPABASE_URL="your_supabase_url"
A4F_BASE_URL=https://api.a4f.co/v1
A4F_API_KEY=your_a4f_api_key
A4F_MODEL=provider-5/gpt-4o-mini
PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

## Stopping the Servers

- **Backend:** Press `Ctrl+C` in the backend terminal
- **Frontend:** Press `Ctrl+C` in the frontend terminal

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Kill process on port 3000:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Kill process on port 3001:**
```bash
lsof -ti:3001 | xargs kill -9
```

**Kill all Node processes:**
```bash
pkill -f node
```

### Backend Server Not Starting

1. Check if `.env` file exists and has correct values
2. Verify Node.js version: `node --version`
3. Check if port 3001 is available: `lsof -i:3001`

### Frontend Not Connecting to Backend

1. Ensure backend is running on port 3001
2. Check `VITE_API_BASE_URL` in `.env` file
3. Verify CORS settings in `server/index.js`

## Quick Start Script

You can also create a shell script for quick startup:

**create `start.sh`:**
```bash
#!/bin/bash

# Kill existing processes
pkill -f "node server/index.js"
pkill -f "vite"

# Wait a moment
sleep 1

# Start backend
cd /Users/hetkasundra/Downloads/interview_bhois
npm run server &
sleep 2

# Start frontend
npm run dev
```

**Make it executable:**
```bash
chmod +x start.sh
```

**Run it:**
```bash
./start.sh
```

## Manual Commands (Copy-Paste Ready)

### Start Backend Only
```bash
cd /Users/hetkasundra/Downloads/interview_bhois && npm run server
```

### Start Frontend Only
```bash
cd /Users/hetkasundra/Downloads/interview_bhois && npm run dev
```

### Start Both (Separate Terminals)
**Terminal 1:**
```bash
cd /Users/hetkasundra/Downloads/interview_bhois && npm run server
```

**Terminal 2:**
```bash
cd /Users/hetkasundra/Downloads/interview_bhois && npm run dev
```

### Kill All Servers
```bash
pkill -f "node server/index.js" && pkill -f "vite"
```

### Check Server Status
```bash
# Check backend
curl http://localhost:3001/health

# Check frontend (should return HTML)
curl http://localhost:3000
```

