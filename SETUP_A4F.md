# A4F Integration - Quick Setup

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Backend server framework
- `cors` - CORS middleware for API
- `dotenv` - Environment variable management

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
A4F_BASE_URL=https://api.a4f.co/v1
A4F_API_KEY=ddc-a4f-ab6afa5a7f6840dfa68c27cc92a1c993
A4F_MODEL=provider-5/gpt-4o-mini
PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

**Important:** Replace `your-actual-api-key-here` with your actual A4F API key.

### 3. Start the Servers

**Option 1: Run separately (recommended)**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run server
```

**Option 2: Run together (requires `concurrently`)**

```bash
npm install -D concurrently
npm run dev:full
```

### 4. Test the Integration

1. Navigate to the interview start page
2. Select your interview preferences (roles, level, question types, etc.)
3. Click "Start Interview"
4. The system will automatically call A4F API to generate questions
5. If A4F fails, it will fall back to local question generation

## 📁 Files Created/Modified

### New Files:
- `server/index.js` - Express backend server with A4F API route
- `src/lib/a4fService.ts` - Frontend service for A4F API calls
- `README_A4F.md` - Comprehensive documentation
- `SETUP_A4F.md` - This quick setup guide

### Modified Files:
- `package.json` - Added express, cors, dotenv dependencies and server scripts
- `src/pages/interviews/StartInterviewPage.tsx` - Added source marker for A4F
- `src/pages/interviews/InterviewRunnerPage.tsx` - Integrated A4F question generation
- `src/lib/index.ts` - Exported A4F service functions

## 🔍 Verification

### Check Backend Server:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Check A4F API:
The backend will automatically use A4F when generating questions. Check the browser console and backend logs for any errors.

## 🐛 Troubleshooting

### "Cannot find module 'express'"
Run `npm install` to install dependencies.

### "A4F API key not configured"
Make sure your `.env` file exists and contains `A4F_API_KEY=your-key`.

### "Connection refused" errors
- Ensure the backend server is running on port 3001
- Check that `VITE_API_BASE_URL` matches your backend URL
- Verify CORS is enabled in the backend

### Questions not generating
- Check browser console for errors
- Check backend server logs
- Verify A4F API key is valid
- System will fall back to local generation if A4F fails

## 📚 Next Steps

- Review `README_A4F.md` for detailed documentation
- Customize the system prompt in `server/index.js` if needed
- Adjust question count and duration logic as needed
- Monitor A4F API usage and costs

