# Karate Visual Builder API

RESTful API for the Karate Visual Builder application.

## 🚀 Quick Start

```bash
cd src/api
npm install
npm start
```

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Components
```
GET /api/components
```
Returns all available component definitions organized by category.

### Generate Feature File
```
POST /api/generate-feature
Content-Type: application/json

{
  "nodes": [
    {
      "type": "GET_REQUEST",
      "data": { "url": "https://api.example.com/users" }
    }
  ]
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

### Validate Flow
```
POST /api/validate-flow
Content-Type: application/json

{
  "nodes": [...]
}
```

### Get Templates
```
GET /api/templates
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test
```

## 🌐 Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 📝 Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if failed"
}
```
