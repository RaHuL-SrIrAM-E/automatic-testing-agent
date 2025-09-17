# 🚀 Karate Visual Builder - Integration Guide

## 📋 Overview
This guide explains how to integrate the Karate Visual Builder with bolt.new for a modern UI experience.

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   bolt.new UI   │ ◄─────────────► │   API Server    │
│   (Frontend)    │                 │   (Backend)     │
└─────────────────┘                 └─────────────────┘
```

## 🔧 Setup Instructions

### 1. Start the API Server
```bash
# In the karate-visual-builder directory
cd src/api
npm install
npm start
```
API will run on `http://localhost:3001`

### 2. Use the bolt.new Prompt
Copy the enhanced prompt (with API integration section) to bolt.new

### 3. Configure API Base URL
In your bolt.new project, set the API base URL:
```javascript
const API_BASE_URL = 'http://localhost:3001';
```

## 📚 API Endpoints Reference

### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "message": "Karate Visual Builder API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### Get Components
```
GET /api/components
```
**Response:**
```json
{
  "success": true,
  "data": {
    "all": [...],
    "byCategory": {
      "HTTP_REQUEST": [...],
      "AUTHENTICATION": [...],
      "VALIDATION": [...],
      "DATA_MANAGEMENT": [...],
      "CONTROL_FLOW": [...]
    }
  }
}
```

### Generate Feature File
```
POST /api/generate-feature
Content-Type: application/json

{
  "nodes": [
    {
      "id": "node-1",
      "type": "GET_REQUEST",
      "position": { "x": 100, "y": 100 },
      "data": {
        "url": "https://api.example.com/users",
        "headers": {},
        "queryParams": {}
      },
      "connections": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "featureCode": "Feature: Generated API Test\n\nScenario: User Test Flow\n  Given url 'https://api.example.com/users'\n  When method GET\n  Then status 200",
    "metadata": {
      "nodeCount": 1,
      "generatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Generate Complete Project
```
POST /api/generate-project
Content-Type: application/json

{
  "nodes": [...],
  "projectName": "my-test-project"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "name": "my-test-project",
      "version": "1.0.0",
      "description": "Generated Karate test project",
      "features": [...],
      "dataFiles": [...],
      "configFiles": [...],
      "testRunners": [...],
      "folderStructure": {...}
    },
    "metadata": {
      "nodeCount": 3,
      "projectName": "my-test-project",
      "generatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Validate Flow
```
POST /api/validate-flow
Content-Type: application/json

{
  "nodes": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": ["No components added to the flow"],
    "nodeCount": 0
  }
}
```

### Get Templates
```
GET /api/templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic-api-test",
      "name": "Basic API Test",
      "description": "Simple GET request with status validation",
      "category": "API Testing",
      "nodes": [...]
    }
  ]
}
```

## 🎨 UI Integration Points

### 1. Component Library
- Fetch components from `/api/components`
- Display in categorized sidebar
- Handle loading states

### 2. Canvas Operations
- Validate flows in real-time using `/api/validate-flow`
- Show validation errors/warnings
- Update UI based on validation results

### 3. Code Generation
- Generate feature files using `/api/generate-feature`
- Generate complete projects using `/api/generate-project`
- Display generated code with syntax highlighting

### 4. Project Management
- Load templates from `/api/templates`
- Save/load project states
- Export functionality

## 🔄 Data Flow

1. **App Start**: Load components and templates
2. **User Drags Component**: Add to canvas state
3. **User Configures Component**: Update component data
4. **Real-time Validation**: Validate flow on changes
5. **Code Generation**: Generate code on demand
6. **Export**: Download generated files

## 🚨 Error Handling

### Network Errors
```javascript
try {
  const response = await fetch(`${API_BASE_URL}/api/generate-feature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  showError('Failed to generate feature file. Please try again.');
}
```

### API Validation Errors
```javascript
const validateFlow = async (nodes) => {
  const response = await fetch(`${API_BASE_URL}/api/validate-flow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes })
  });
  
  const data = await response.json();
  
  if (!data.success) {
    showError(data.error || 'Validation failed');
    return;
  }
  
  // Update UI with validation results
  updateValidationState(data.data);
};
```

## 🎯 Testing the Integration

### 1. Test API Health
```bash
curl http://localhost:3001/api/health
```

### 2. Test Component Loading
```bash
curl http://localhost:3001/api/components
```

### 3. Test Feature Generation
```bash
curl -X POST http://localhost:3001/api/generate-feature \
  -H "Content-Type: application/json" \
  -d '{"nodes":[]}'
```

## 🚀 Deployment

### API Server
- Deploy to any Node.js hosting (Heroku, Railway, etc.)
- Set environment variables
- Configure CORS for production domain

### Frontend (bolt.new)
- Deploy to Vercel, Netlify, etc.
- Update API_BASE_URL for production
- Configure environment variables

## 📝 Notes

- API server must be running before using the frontend
- CORS is configured for localhost:3000 (frontend) and localhost:3001 (API)
- All API responses include success/error indicators
- Error messages are user-friendly and actionable
