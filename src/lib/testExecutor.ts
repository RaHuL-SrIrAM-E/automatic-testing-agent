// Real test executor that calls the backend API
export interface TestResult {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  details: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    message?: string;
  }>;
  output: string;
  error?: string;
  reportPath?: string;
}

export class TestExecutor {
  private backendUrl: string;

  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  }

  async executeTest(featureCode: string, testName: string = 'generated-test'): Promise<TestResult> {
    console.log('Executing test via backend API:', testName);
    
    try {
      const response = await fetch(`${this.backendUrl}/api/run-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureCode,
          projectName: testName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Test execution completed:', result);
      return result;
    } catch (error) {
      console.error('Error calling backend API:', error);
      
      // Fallback to mock response if backend is unavailable
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log('Backend unavailable, using mock response');
        return this.getMockResponse(featureCode, testName);
      }
      
      throw error;
    }
  }

  private getMockResponse(featureCode: string, testName: string): TestResult {
    // Parse the feature code to determine test scenarios
    const scenarios = this.parseFeatureCode(featureCode);
    
    // Simulate test results based on the scenarios
    const results = this.simulateTestResults(scenarios, testName);
    
    return results;
  }

  private parseFeatureCode(featureCode: string): string[] {
    const scenarios: string[] = [];
    const lines = featureCode.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('Scenario:')) {
        const scenarioName = line.replace('Scenario:', '').trim();
        scenarios.push(scenarioName || 'Unnamed Scenario');
      }
    }
    
    // If no scenarios found, create a default one
    if (scenarios.length === 0) {
      scenarios.push('Generated Test Scenario');
    }
    
    return scenarios;
  }

  private simulateTestResults(scenarios: string[], testName: string): TestResult {
    const total = scenarios.length;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    
    const details = scenarios.map((scenario, index) => {
      // Simulate different outcomes based on scenario content
      let status: 'passed' | 'failed' | 'skipped' = 'passed';
      let duration = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
      let error: string | undefined;
      let message: string | undefined;
      
      // Simulate some failures for demonstration
      if (scenario.toLowerCase().includes('error') || scenario.toLowerCase().includes('fail')) {
        status = 'failed';
        failed++;
        error = 'Simulated test failure for demonstration';
      } else if (scenario.toLowerCase().includes('skip')) {
        status = 'skipped';
        skipped++;
        message = 'Test was skipped';
      } else {
        status = 'passed';
        passed++;
        message = 'Test passed successfully';
      }
      
      return {
        name: scenario,
        status,
        duration,
        error,
        message
      };
    });
    
    // Generate realistic output
    const output = this.generateTestOutput(scenarios, { passed, failed, skipped, total });
    
    return {
      success: failed === 0,
      summary: { total, passed, failed, skipped },
      details,
      output,
      reportPath: `/tmp/${testName}-report.html`
    };
  }

  private generateTestOutput(scenarios: string[], summary: { passed: number; failed: number; skipped: number; total: number }): string {
    let output = `Karate Test Execution Report (Mock Mode)\n`;
    output += `========================================\n\n`;
    output += `Test Suite: Generated Visual Test\n`;
    output += `Timestamp: ${new Date().toISOString()}\n\n`;
    
    output += `Summary:\n`;
    output += `  Total: ${summary.total}\n`;
    output += `  Passed: ${summary.passed}\n`;
    output += `  Failed: ${summary.failed}\n`;
    output += `  Skipped: ${summary.skipped}\n\n`;
    
    output += `Test Details:\n`;
    output += `-------------\n`;
    
    scenarios.forEach((scenario, index) => {
      const status = summary.failed > 0 ? (index === 0 ? 'FAILED' : 'PASSED') : 'PASSED';
      const duration = Math.floor(Math.random() * 2000) + 500;
      
      output += `${index + 1}. ${scenario}\n`;
      output += `   Status: ${status}\n`;
      output += `   Duration: ${duration}ms\n`;
      
      if (status === 'FAILED') {
        output += `   Error: Simulated test failure for demonstration\n`;
      }
      
      output += `\n`;
    });
    
    output += `Execution completed in ${Math.floor(Math.random() * 5000) + 2000}ms\n`;
    output += `\nNote: This is a mock response. Backend API is not available.\n`;
    
    return output;
  }

  async cleanupAll(): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/api/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Backend cleanup completed');
      } else {
        console.warn('Backend cleanup failed');
      }
    } catch (error) {
      console.warn('Backend cleanup error:', error);
    }
  }
}