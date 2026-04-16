# 🎙️ ElevenLabs Voice Agent Integration Guide

## ✅ Integration Complete!

Your Travel Tracker app is now integrated with **ElevenLabs Voice Agent**.

---

## 📋 Credentials Configured

| Item | Value |
|------|-------|
| **Agent ID** | `agent_4001kpbweds6fspt0kmvda033tjm` |
| **API Key** | `sk_960f4e56bf53dc9bba84062a19399bfd29ad0728cbb51c89` |
| **API Endpoint** | `https://api.elevenlabs.io/v1/agents/agent_4001kpbweds6fspt0kmvda033tjm/chat` |
| **Service** | ElevenLabs Voice Agent |

---

## 🚀 Setup Instructions

### Step 1: Create `.env` File
Create a new file named `.env` in the project root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database (if using PostgreSQL)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=travel_tracker
PGSSLMODE=disable

# ElevenLabs Voice Agent Configuration
ELEVENLABS_API_KEY=sk_960f4e56bf53dc9bba84062a19399bfd29ad0728cbb51c89
VOICE_AGENT_ID=agent_4001kpbweds6fspt0kmvda033tjm
VOICE_AGENT_ENDPOINT=https://api.elevenlabs.io/v1/agents/agent_4001kpbweds6fspt0kmvda033tjm/chat

# Optional: Ollama Configuration
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=neural-chat

# Optional: Unsplash Configuration
# UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### Step 2: Restart the Server

```bash
npm start
```

### Step 3: Test Voice Agent

1. **Open the app**: http://localhost:3000
2. **Register/Login** with your account
3. **Go to Travel Guide**: Click on any country (e.g., India)
4. **Click Voice Tab**: You'll see the Voice Tour section
5. **Click "Generate Voice Tour"**: Listen to your personalized voice guide!

---

## 🔊 Features Enabled

✅ **Voice Tour Generation**
- Get voice narrations for any destination
- Personalized agent voice
- Audio caching for faster playback

✅ **Travel Recommendations**
- Voice-based destination guidance
- Interactive voice conversations
- Multi-language support ready

✅ **Voice Guide Panel** (on main page)
- Voice guide availability
- Real-time voice generation
- Error handling with alternatives

---

## 📊 How It Works

```
User Action → Frontend Request → Backend Service → ElevenLabs Agent
                                                           ↓
                                      Generate Voice Response
                                                           ↓
                    Backend Converts to Audio → Frontend Plays Audio
```

### Request Format
```json
{
  "user_message": "Tell me about India's attractions",
  "agent_id": "agent_4001kpbweds6fspt0kmvda033tjm"
}
```

### Response Format
```json
{
  "success": true,
  "audio": "data:audio/mpeg;base64,//NExAAR2...",
  "mimeType": "audio/mpeg"
}
```

---

## 🧪 Testing Endpoints

### Test Voice Generation
```bash
# POST request to generate voice
curl -X POST http://localhost:3000/api/voice-guide \
  -H "Content-Type: application/json" \
  -d '{"text":"Welcome to India!"}'
```

### Expected Response
```json
{
  "success": true,
  "audio": "data:audio/mpeg;base64,...",
  "mimeType": "audio/mpeg"
}
```

---

## ⚠️ Troubleshooting

### Issue: "Voice service unavailable"

**Solution 1: Check API Key**
```bash
# Verify .env file has correct credentials
cat .env | grep ELEVENLABS_API_KEY
```

**Solution 2: Check Agent Endpoint**
```bash
# Verify endpoint URL is correct
cat .env | grep VOICE_AGENT_ENDPOINT
```

**Solution 3: Check Server Logs**
```bash
# Look for error details in server logs
npm start 2>&1 | grep "Voice"
```

### Issue: Audio not playing in browser

- Check browser console (F12) for errors
- Ensure audio codec support
- Try different browser (Chrome recommended)

### Issue: API Rate Limit

- Wait a few minutes before trying again
- Check ElevenLabs account usage limits
- Consider caching for repeated requests

---

## 🔒 Security Notes

⚠️ **Important**: 
- **NEVER commit `.env` file to Git**
- **NEVER share your API key publicly**
- Regenerate key if leaked
- Use `.env.example` for template only

---

## 📞 Support

For issues with:
- **ElevenLabs Agent**: Check https://elevenlabs.io/docs
- **Travel Tracker App**: Check logs and troubleshooting section
- **API Credentials**: Verify in ElevenLabs dashboard

---

## ✨ Next Steps

1. ✅ Voice agent integrated
2. 🔜 Enable all other features (Ollama, Unsplash)
3. 🔜 Add voice to all travel features
4. 🔜 Deploy to production

---

**Last Updated**: April 17, 2026
**Voice Agent Status**: 🟢 Configured & Ready
