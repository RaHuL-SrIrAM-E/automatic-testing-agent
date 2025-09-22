const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global variables
let karateJarPath = null;
const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
fs.ensureDirSync(tempDir);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    karateAvailable: !!karateJarPath
  });
});

// Download Karate JAR from official releases
async function ensureKarateJar() {
  if (karateJarPath && await fs.pathExists(karateJarPath)) {
    return karateJarPath;
  }

  const jarPath = path.join(tempDir, 'karate.jar');
  
  try {
    console.log('Downloading Karate JAR from official releases...');
    
    // For demo purposes, we'll use a mock JAR
    // In production, you would download from: https://github.com/karatelabs/karate/releases
    throw new Error('Mock mode - using simulated Karate execution');

    const writer = fs.createWriteStream(jarPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (await fs.pathExists(jarPath)) {
      karateJarPath = jarPath;
      console.log('Karate JAR downloaded successfully from official releases');
      return jarPath;
    } else {
      throw new Error('Karate JAR download failed - file not found');
    }
  } catch (error) {
    console.error('Error downloading Karate JAR:', error);
    // Fallback to mock for demo purposes
    console.log('Falling back to mock Karate JAR for demo...');
    await fs.writeFile(jarPath, 'Mock Karate JAR for demo purposes');
    karateJarPath = jarPath;
    return jarPath;
  }
}

// Execute Karate test
async function executeKarateTest(featureCode, testId) {
  try {
    // Ensure Karate JAR is available
    const karateJar = await ensureKarateJar();

    // Create test directory
    const testDir = path.join(tempDir, testId);
    await fs.ensureDir(testDir);

    // Write feature file
    const featurePath = path.join(testDir, 'test.feature');
    await fs.writeFile(featurePath, featureCode, 'utf8');

    // Create output directory
    const outputDir = path.join(testDir, 'reports');
    await fs.ensureDir(outputDir);

    console.log(`Executing Karate test: ${testId}`);

    // Simulate realistic Karate test execution
    console.log('Simulating Karate test execution...');
    
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Parse the feature code to determine test behavior
    const hasError = featureCode.includes('status 500') || featureCode.includes('status 404') || featureCode.includes('status 400');
    const isSuccess = !hasError;
    
    // Generate realistic mock results
    const mockResults = {
      success: isSuccess,
      summary: {
        total: 1,
        passed: isSuccess ? 1 : 0,
        failed: isSuccess ? 0 : 1,
        skipped: 0
      },
      details: [{
        name: 'Test Scenario',
        status: isSuccess ? 'passed' : 'failed',
        duration: Math.floor(Math.random() * 2000) + 500,
        error: isSuccess ? '' : 'Assertion failed: expected 200 but was 500'
      }],
      output: `Karate Test Execution (Simulated)
=====================================

Feature: Test
Scenario: Test
${isSuccess ? '✓ PASSED' : '✗ FAILED'}

Execution time: ${Math.floor(Math.random() * 2000) + 500}ms
${isSuccess ? 'All tests passed!' : 'Some tests failed. Check the details above.'}

Note: This is a simulated execution for demo purposes.
In production, this would run the actual Karate JAR from:
https://github.com/karatelabs/karate/releases`,
      reportPath: path.join(outputDir, 'karate-summary.json')
    };
    
    console.log('Simulated Karate execution completed');
    
    // Clean up test directory
    await fs.remove(testDir);
    
    return mockResults;
  } catch (error) {
    console.error('Test execution error:', error);
    
    // Clean up on error
    const testDir = path.join(tempDir, testId);
    await fs.remove(testDir).catch(() => {});
    
    return {
      success: false,
      summary: { total: 0, passed: 0, failed: 1, skipped: 0 },
      details: [{
        name: 'Test Execution',
        status: 'failed',
        duration: 0,
        error: error.message
      }],
      output: error.message,
      error: error.message
    };
  }
}

// Parse test results from JSON reports
async function parseTestResults(outputDir, stdout, stderr) {
  try {
    // Look for JSON report files
    const files = await fs.readdir(outputDir);
    const reportFiles = files.filter(file => file.endsWith('.json'));
    
    if (reportFiles.length === 0) {
      // No JSON reports found, try to parse from stdout
      return parseFromStdout(stdout, stderr);
    }

    // Parse the most recent JSON report
    const latestReport = reportFiles.sort().pop();
    const reportPath = path.join(outputDir, latestReport);
    const reportContent = await fs.readFile(reportPath, 'utf8');
    const report = JSON.parse(reportContent);

    return parseKarateReport(report, stdout);
  } catch (error) {
    console.error('Error parsing test results:', error);
    return parseFromStdout(stdout, stderr);
  }
}

// Parse Karate JSON report
function parseKarateReport(report, stdout) {
  const scenarios = report.scenarios || [];
  const total = scenarios.length;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const details = scenarios.map((scenario) => {
    let status = 'failed';
    
    if (scenario.status === 'PASS') {
      status = 'passed';
      passed++;
    } else if (scenario.status === 'SKIP') {
      status = 'skipped';
      skipped++;
    } else {
      status = 'failed';
      failed++;
    }

    return {
      name: scenario.name || scenario.scenarioName || 'Unknown Scenario',
      status,
      duration: scenario.duration || 0,
      error: scenario.errorMessage || (status === 'failed' ? 'Test failed' : undefined),
      message: status === 'passed' ? 'Test passed successfully' : undefined
    };
  });

  return {
    success: failed === 0,
    summary: { total, passed, failed, skipped },
    details,
    output: stdout,
    reportPath: report.reportPath
  };
}

// Parse from stdout when JSON reports aren't available
function parseFromStdout(stdout, stderr) {
  const lines = stdout.split('\n');
  const total = lines.filter(line => line.includes('Scenario:')).length;
  const passed = lines.filter(line => line.includes('passed')).length;
  const failed = lines.filter(line => line.includes('failed') || line.includes('FAIL')).length;
  const skipped = lines.filter(line => line.includes('skipped') || line.includes('SKIP')).length;

  const details = [{
    name: 'Generated Test',
    status: failed > 0 ? 'failed' : (passed > 0 ? 'passed' : 'skipped'),
    duration: 0,
    error: failed > 0 ? stderr : undefined,
    message: failed === 0 ? 'Test completed' : undefined
  }];

  return {
    success: failed === 0,
    summary: { total: Math.max(total, 1), passed, failed, skipped },
    details,
    output: stdout,
    error: stderr || undefined
  };
}

// API Routes

// Execute test endpoint
app.post('/api/run-tests', async (req, res) => {
  try {
    const { featureCode, projectName = 'karate-test' } = req.body;
    
    if (!featureCode) {
      return res.status(400).json({
        success: false,
        error: 'Feature code is required'
      });
    }

    const testId = uuidv4();
    console.log(`Starting test execution: ${testId}`);
    
    const result = await executeKarateTest(featureCode, testId);
    
    res.json(result);
  } catch (error) {
    console.error('Error in run-tests endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      summary: { total: 0, passed: 0, failed: 1, skipped: 0 }
    });
  }
});

// Get test status endpoint
app.get('/api/test-status/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const testDir = path.join(tempDir, testId);
    
    if (!await fs.pathExists(testDir)) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Check if test is still running
    const outputDir = path.join(testDir, 'reports');
    const isRunning = !await fs.pathExists(outputDir);
    
    res.json({
      testId,
      isRunning,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-status endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup endpoint
app.post('/api/cleanup', async (req, res) => {
  try {
    await fs.remove(tempDir);
    await fs.ensureDir(tempDir);
    karateJarPath = null;
    
    res.json({
      success: true,
      message: 'Cleanup completed'
    });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Karate Test Backend running on port ${PORT}`);
  console.log(`📁 Temp directory: ${tempDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await fs.remove(tempDir);
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
  process.exit(0);
});

module.exports = app;
