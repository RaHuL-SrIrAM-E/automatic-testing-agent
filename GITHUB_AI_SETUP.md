# GitHub AI Integration Setup

## ✅ What's Now Working

The GitHub workflow now uses **real Gemini AI** to analyze repository code and generate test components!

## 🔧 Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### 2. Set Environment Variable

**Option A: Create a `.env` file (Recommended)**

Create a file named `.env` in the `backend/` directory:

```bash
cd backend
echo "GEMINI_API_KEY=your-actual-api-key-here" > .env
```

**Option B: Set in terminal (Temporary)**

```bash
export GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Restart Backend Server

```bash
cd backend
node server.js
```

## 🎯 How It Works Now

### **Before (Mock Mode):**
```
GitHub Repo → Parse Files → Return Mock Data ❌
```

### **After (AI Mode):**
```
GitHub Repo → Download Code → Analyze with Gemini AI → Generate Real Test Components ✅
```

## 📋 Usage

1. **Click "Generate" button** in the UI
2. **Enter GitHub repository URL** (e.g., `https://github.com/user/repo`)
3. **Enter GitHub Personal Access Token**
4. **Click "Generate Tests"**
5. **Wait for AI analysis** (10-30 seconds)
6. **View generated components** on canvas

## 🔍 What the AI Does

1. **Analyzes API Code** - Reads your controller/routes files
2. **Identifies Endpoints** - Finds GET, POST, PUT, DELETE endpoints
3. **Generates Test Components** - Creates:
   - HTTP Request components
   - Status Assertion components
   - Schema Validation components
4. **Returns to Canvas** - Components appear ready to use

## 🎨 Example Output

For a Flask/Python API with these endpoints:
```python
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify([...])

@app.route('/api/users', methods=['POST'])
def create_user():
    return jsonify({...})
```

The AI will generate:
- `GET /api/users` component
- `POST /api/users` component
- Status assertions (200)
- Schema validations

## ⚠️ Important Notes

1. **API Key Required** - Without a valid key, it falls back to mock data
2. **Rate Limits** - Gemini has rate limits (60 requests/minute free tier)
3. **Token Limits** - Analyzes up to 5 files per repository
4. **Code Length** - Limits each file to 2000 characters for analysis
5. **Fallback** - If AI fails, returns mock components

## 🐛 Troubleshooting

### "Using mock generation for demo purposes"
- **Problem**: Gemini API key not set or invalid
- **Solution**: Check `.env` file or environment variable

### "Gemini AI call failed"
- **Problem**: API key invalid or rate limit exceeded
- **Solution**: Verify API key, wait and retry

### "No API files found"
- **Problem**: Repository doesn't have recognizable API files
- **Solution**: Repository will use mock components

## 🔐 Security

- **Never commit** your `.env` file to git
- **Add to `.gitignore`**: `backend/.env`
- **API keys are sensitive** - keep them secret

## 📊 Current Status

| Feature | Status |
|---------|--------|
| GitHub API Integration | ✅ Working |
| Repository Analysis | ✅ Working |
| File Download | ✅ Working |
| **Gemini AI Integration** | ✅ **NOW WORKING** |
| **Real Component Generation** | ✅ **NOW WORKING** |
| Mock Fallback | ✅ Working |

## 🚀 Next Steps

1. Get your Gemini API key
2. Set it in `.env` file
3. Restart backend server
4. Try the GitHub workflow!
5. Enjoy AI-generated test components! 🎉

