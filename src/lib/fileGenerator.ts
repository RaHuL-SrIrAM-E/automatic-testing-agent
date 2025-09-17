import { KarateProject } from './karateProjectGenerator';

export class FileGenerator {
  static generateProjectZip(project: KarateProject): void {
    // Create a ZIP file with all the project files
    const files: { path: string; content: string }[] = [];
    
    // Add all feature files
    project.features.forEach(feature => {
      files.push({ path: feature.path, content: feature.content });
    });
    
    // Add all data files
    project.dataFiles.forEach(dataFile => {
      files.push({ path: dataFile.path, content: dataFile.content });
    });
    
    // Add all config files
    project.configFiles.forEach(configFile => {
      files.push({ path: configFile.path, content: configFile.content });
    });
    
    // Add all test runners
    project.testRunners.forEach(testRunner => {
      files.push({ path: testRunner.path, content: testRunner.content });
    });
    
    // Add README
    files.push({
      path: 'README.md',
      content: this.generateReadme(project)
    });

    // Add setup script
    files.push({
      path: 'setup.sh',
      content: this.generateSetupScript(project.name)
    });

    // Add run script
    files.push({
      path: 'run-tests.sh',
      content: this.generateRunScript()
    });

    // Create ZIP file
    this.downloadAsZip(project.name, files);
  }

  private static generateReadme(project: KarateProject): string {
    return `# ${project.name}

${project.description}

## Quick Start

### Option 1: One-Click Setup (Recommended)
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Option 2: Manual Setup
\`\`\`bash
# Install Java 11+ and Maven
# Then run:
mvn clean test
\`\`\`

## Project Structure

\`\`\`
${this.formatFolderStructure(project.folderStructure, 0)}
\`\`\`

## Running Tests

### Run All Tests
\`\`\`bash
./run-tests.sh
# OR
mvn test
\`\`\`

### Run Specific Feature
\`\`\`bash
mvn test -Dtest=TestRunner#testApi
\`\`\`

### Run in Parallel
\`\`\`bash
mvn test -Dtest=ParallelTestRunner
\`\`\`

### Run with Different Environment
\`\`\`bash
mvn test -Dkarate.env=staging
\`\`\`

## Test Reports
Test reports are generated in the \`target/reports\` directory after test execution.

## Configuration
Edit \`src/test/resources/karate-config.js\` to modify test configuration.

## Test Data
Test data files are located in \`src/test/resources/data/\`.

## Troubleshooting

### Java Not Found
\`\`\`bash
# Install Java 11+
# macOS: brew install openjdk@11
# Ubuntu: sudo apt install openjdk-11-jdk
\`\`\`

### Maven Not Found
\`\`\`bash
# Install Maven
# macOS: brew install maven
# Ubuntu: sudo apt install maven
\`\`\`
`;
  }

  private static generateSetupScript(projectName: string = 'karate-test-project'): string {
    return `#!/bin/bash

echo "🚀 Setting up ${projectName}..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11 or higher."
    echo "   macOS: brew install openjdk@11"
    echo "   Ubuntu: sudo apt install openjdk-11-jdk"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 11 ]; then
    echo "❌ Java 11+ is required. Current version: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java $(java -version 2>&1 | head -n 1 | cut -d'"' -f2) detected"

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven."
    echo "   macOS: brew install maven"
    echo "   Ubuntu: sudo apt install maven"
    exit 1
fi

echo "✅ Maven $(mvn -version | head -n 1 | cut -d' ' -f3) detected"

# Run tests
echo "🧪 Running tests..."
mvn clean test

if [ $? -eq 0 ]; then
    echo "✅ Tests completed successfully!"
    echo "📊 Check target/reports for test results"
else
    echo "❌ Tests failed. Check the output above for details."
    exit 1
fi
`;
  }

  private static generateRunScript(): string {
    return `#!/bin/bash

echo "🧪 Running Karate tests..."

# Run all tests
mvn test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 Test reports available in target/reports/"
else
    echo "❌ Some tests failed. Check the output above for details."
    exit 1
fi
`;
  }

  private static formatFolderStructure(structure: any, depth: number): string {
    let result = '';
    const indent = '  '.repeat(depth);
    
    Object.entries(structure).forEach(([key, value]) => {
      if (typeof value === 'string') {
        result += `${indent}${key}/  # ${value}\n`;
      } else {
        result += `${indent}${key}/\n`;
        result += this.formatFolderStructure(value, depth + 1);
      }
    });
    
    return result;
  }

  private static downloadAsZip(projectName: string, files: { path: string; content: string }[]): void {
    console.log('Starting download process...');
    console.log('Project name:', projectName);
    console.log('Number of files:', files.length);
    
    // Create a structured project file that can be easily extracted
    const projectStructure = {
      projectName,
      version: '1.0.0',
      files: files.map(file => ({
        path: file.path,
        content: file.content,
        size: file.content.length
      })),
      instructions: {
        extract: 'Extract all files maintaining the folder structure',
        run: 'chmod +x setup.sh && ./setup.sh',
        requirements: 'Java 11+ and Maven required'
      }
    };

    console.log('Creating blob...');
    const blob = new Blob([JSON.stringify(projectStructure, null, 2)], { 
      type: 'application/json' 
    });
    
    console.log('Creating download URL...');
    const url = URL.createObjectURL(blob);
    
    console.log('Creating download link...');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-project.json`;
    
    console.log('Triggering download...');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Download process completed!');
  }
}
