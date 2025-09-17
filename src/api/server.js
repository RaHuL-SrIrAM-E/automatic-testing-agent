const express = require('express');
const cors = require('cors');
const { KarateGenerator } = require('./karateGenerator');
const { KarateProjectGenerator } = require('./karateProjectGenerator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize generators
const karateGenerator = new KarateGenerator();
const projectGenerator = new KarateProjectGenerator();

// API Routes

// Get component definitions
app.get('/api/components', (req, res) => {
  try {
    const { getComponentsByCategory, componentDefinitions } = require('./componentDefinitions');
    
    const components = {
      all: componentDefinitions,
      byCategory: {
        HTTP_REQUEST: getComponentsByCategory('HTTP_REQUEST'),
        AUTHENTICATION: getComponentsByCategory('AUTHENTICATION'),
        VALIDATION: getComponentsByCategory('VALIDATION'),
        DATA_MANAGEMENT: getComponentsByCategory('DATA_MANAGEMENT'),
        CONTROL_FLOW: getComponentsByCategory('CONTROL_FLOW')
      }
    };
    
    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch component definitions',
      details: error.message
    });
  }
});

// Generate feature file
app.post('/api/generate-feature', (req, res) => {
  try {
    const { nodes } = req.body;
    
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request. Expected nodes array.'
      });
    }
    
    const featureCode = karateGenerator.generateFeature(nodes);
    
    res.json({
      success: true,
      data: {
        featureCode,
        metadata: {
          nodeCount: nodes.length,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate feature file',
      details: error.message
    });
  }
});

// Generate complete project
app.post('/api/generate-project', (req, res) => {
  try {
    const { nodes, projectName = 'karate-test-project' } = req.body;
    
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request. Expected nodes array.'
      });
    }
    
    const project = projectGenerator.generateProject(nodes, projectName);
    
    res.json({
      success: true,
      data: {
        project,
        metadata: {
          nodeCount: nodes.length,
          projectName,
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate project',
      details: error.message
    });
  }
});

// Validate flow
app.post('/api/validate-flow', (req, res) => {
  try {
    const { nodes } = req.body;
    
    if (!nodes || !Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request. Expected nodes array.'
      });
    }
    
    const errors = [];
    const warnings = [];
    
    // Basic validation
    if (nodes.length === 0) {
      warnings.push('No components added to the flow');
    }
    
    // Check for required properties
    nodes.forEach((node, index) => {
      if (node.type.includes('REQUEST') && !node.data.url) {
        errors.push(`Node ${index + 1} (${node.type}) is missing required URL`);
      }
      
      if (node.type === 'BEARER_AUTH' && !node.data.token) {
        errors.push(`Node ${index + 1} (Bearer Auth) is missing required token`);
      }
    });
    
    res.json({
      success: true,
      data: {
        isValid: errors.length === 0,
        errors,
        warnings,
        nodeCount: nodes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to validate flow',
      details: error.message
    });
  }
});

// Get project templates
app.get('/api/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'basic-api-test',
        name: 'Basic API Test',
        description: 'Simple GET request with status validation',
        category: 'API Testing',
        nodes: [
          {
            type: 'GET_REQUEST',
            data: { url: 'https://jsonplaceholder.typicode.com/users' }
          },
          {
            type: 'STATUS_ASSERTION',
            data: { expectedStatus: 200, operator: 'equals' }
          }
        ]
      },
      {
        id: 'auth-api-test',
        name: 'Authenticated API Test',
        description: 'API test with Bearer token authentication',
        category: 'Authentication',
        nodes: [
          {
            type: 'BEARER_AUTH',
            data: { token: 'your-token-here' }
          },
          {
            type: 'GET_REQUEST',
            data: { url: 'https://api.example.com/users' }
          },
          {
            type: 'STATUS_ASSERTION',
            data: { expectedStatus: 200, operator: 'equals' }
          }
        ]
      },
      {
        id: 'data-validation-test',
        name: 'Data Validation Test',
        description: 'API test with comprehensive data validation',
        category: 'Data Validation',
        nodes: [
          {
            type: 'GET_REQUEST',
            data: { url: 'https://jsonplaceholder.typicode.com/users' }
          },
          {
            type: 'STATUS_ASSERTION',
            data: { expectedStatus: 200, operator: 'equals' }
          },
          {
            type: 'FIELD_MATCHER',
            data: { 
              jsonPath: '$[0].name', 
              expectedValue: 'Leanne Graham', 
              operator: 'equals' 
            }
          }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Karate Visual Builder API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/components',
      'GET /api/templates',
      'POST /api/generate-feature',
      'POST /api/generate-project',
      'POST /api/validate-flow'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Karate Visual Builder API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app;
