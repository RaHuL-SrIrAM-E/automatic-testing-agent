import { ComponentNode } from '../types';
import { KarateGenerator } from './karateGenerator';

export interface KarateProject {
  name: string;
  version: string;
  description: string;
  features: FeatureFile[];
  dataFiles: DataFile[];
  configFiles: ConfigFile[];
  testRunners: TestRunner[];
  folderStructure: FolderStructure;
}

export interface FeatureFile {
  name: string;
  path: string;
  content: string;
  tags: string[];
  description: string;
}

export interface DataFile {
  name: string;
  path: string;
  content: string;
  type: 'json' | 'csv' | 'yaml';
}

export interface ConfigFile {
  name: string;
  path: string;
  content: string;
  type: 'karate-config' | 'pom' | 'gradle' | 'properties';
}

export interface TestRunner {
  name: string;
  path: string;
  content: string;
  type: 'junit' | 'testng' | 'cucumber';
}

export interface FolderStructure {
  [key: string]: string | FolderStructure;
}

export class KarateProjectGenerator {
  private karateGenerator: KarateGenerator;

  constructor() {
    this.karateGenerator = new KarateGenerator();
  }

  generateProject(nodes: ComponentNode[], projectName: string = 'karate-test-project'): KarateProject {
    const features = this.generateFeatureFiles(nodes, projectName);
    const dataFiles = this.generateDataFiles();
    const configFiles = this.generateConfigFiles(projectName);
    const testRunners = this.generateTestRunners(projectName);
    const folderStructure = this.generateFolderStructure();

    return {
      name: projectName,
      version: '1.0.0',
      description: 'Generated Karate test project',
      features,
      dataFiles,
      configFiles,
      testRunners,
      folderStructure
    };
  }

  private generateFeatureFiles(nodes: ComponentNode[], projectName: string): FeatureFile[] {
    const features: FeatureFile[] = [];
    
    // Group nodes by feature (for now, create one feature per flow)
    const featureContent = this.karateGenerator.generateFeature(nodes);
    
    features.push({
      name: 'api-tests.feature',
      path: 'src/test/java/features/api-tests.feature',
      content: featureContent,
      tags: ['@api', '@smoke'],
      description: 'API test scenarios generated from visual flow'
    });

    // Add additional feature files for different test categories
    features.push({
      name: 'authentication.feature',
      path: 'src/test/java/features/authentication.feature',
      content: this.generateAuthFeature(),
      tags: ['@auth', '@security'],
      description: 'Authentication test scenarios'
    });

    features.push({
      name: 'data-validation.feature',
      path: 'src/test/java/features/data-validation.feature',
      content: this.generateDataValidationFeature(),
      tags: ['@validation', '@data'],
      description: 'Data validation test scenarios'
    });

    return features;
  }

  private generateDataFiles(): DataFile[] {
    return [
      {
        name: 'test-data.json',
        path: 'src/test/resources/data/test-data.json',
        content: JSON.stringify({
          "users": [
            {
              "id": 1,
              "name": "John Doe",
              "email": "john@example.com",
              "role": "admin"
            },
            {
              "id": 2,
              "name": "Jane Smith",
              "email": "jane@example.com",
              "role": "user"
            }
          ],
          "api": {
            "baseUrl": "https://jsonplaceholder.typicode.com",
            "timeout": 30000
          }
        }, null, 2),
        type: 'json'
      },
      {
        name: 'user-credentials.csv',
        path: 'src/test/resources/data/user-credentials.csv',
        content: `username,password,role
admin,admin123,admin
user,user123,user
test,test123,user`,
        type: 'csv'
      }
    ];
  }

  private generateConfigFiles(projectName: string): ConfigFile[] {
    return [
      {
        name: 'karate-config.js',
        path: 'src/test/resources/karate-config.js',
        content: this.generateKarateConfig(),
        type: 'karate-config'
      },
      {
        name: 'pom.xml',
        path: 'pom.xml',
        content: this.generatePomXml(projectName),
        type: 'pom'
      },
      {
        name: 'application.properties',
        path: 'src/test/resources/application.properties',
        content: this.generateApplicationProperties(),
        type: 'properties'
      }
    ];
  }

  private generateTestRunners(projectName: string): TestRunner[] {
    return [
      {
        name: 'TestRunner.java',
        path: 'src/test/java/TestRunner.java',
        content: this.generateJUnitTestRunner(),
        type: 'junit'
      },
      {
        name: 'ParallelTestRunner.java',
        path: 'src/test/java/ParallelTestRunner.java',
        content: this.generateParallelTestRunner(),
        type: 'junit'
      }
    ];
  }

  private generateFolderStructure(): FolderStructure {
    return {
      'src': {
        'test': {
          'java': {
            'features': 'Feature files directory',
            'runners': 'Test runner classes',
            'utils': 'Utility classes'
          },
          'resources': {
            'data': 'Test data files',
            'config': 'Configuration files'
          }
        }
      },
      'target': 'Maven build output directory',
      'reports': 'Test reports directory'
    };
  }

  private generateAuthFeature(): string {
    return `Feature: Authentication Tests

  Background:
    * def baseUrl = 'https://api.example.com'
    * def authEndpoint = baseUrl + '/auth'

  @auth @login
  Scenario: Successful login with valid credentials
    Given url authEndpoint
    And def loginData = { username: 'admin', password: 'admin123' }
    When method POST
    And request loginData
    Then status 200
    And match response.token != null
    And def authToken = response.token

  @auth @invalid-credentials
  Scenario: Login fails with invalid credentials
    Given url authEndpoint
    And def loginData = { username: 'invalid', password: 'wrong' }
    When method POST
    And request loginData
    Then status 401
    And match response.error == 'Invalid credentials'`;
  }

  private generateDataValidationFeature(): string {
    return `Feature: Data Validation Tests

  Background:
    * def baseUrl = 'https://jsonplaceholder.typicode.com'
    * def usersEndpoint = baseUrl + '/users'

  @validation @user-data
  Scenario: Validate user data structure
    Given url usersEndpoint
    When method GET
    Then status 200
    And match response[0] contains { id: '#number', name: '#string', email: '#string' }
    And match response[0].email == '#regex [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'

  @validation @required-fields
  Scenario: Validate required fields are present
    Given url usersEndpoint
    When method GET
    Then status 200
    And match each response contains { id: '#present', name: '#present', email: '#present' }`;
  }

  private generateKarateConfig(): string {
    return `function() {
  var config = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retry: { count: 3, interval: 1000 }
  };
  
  // Environment-specific configurations
  if (karate.env === 'dev') {
    config.baseUrl = 'https://dev-api.example.com';
  } else if (karate.env === 'staging') {
    config.baseUrl = 'https://staging-api.example.com';
  } else if (karate.env === 'prod') {
    config.baseUrl = 'https://api.example.com';
  }
  
  return config;
}`;
  }

  private generatePomXml(projectName: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>${projectName}</name>
    <description>Karate API Test Project</description>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <karate.version>1.4.1</karate.version>
        <junit.version>5.9.2</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.intuit.karate</groupId>
            <artifactId>karate-junit5</artifactId>
            <version>\${karate.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0</version>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                        <include>**/*Runner.java</include>
                    </includes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`;
  }

  private generateApplicationProperties(): string {
    return `# Application Properties
karate.env=dev
karate.baseUrl=https://jsonplaceholder.typicode.com
karate.timeout=30000

# Test Data Paths
karate.data.path=classpath:data/

# Reporting
karate.reports.dir=target/reports
karate.reports.format=html

# Parallel Execution
karate.parallel=5
karate.threads=10`;
  }

  private generateJUnitTestRunner(): string {
    return `package runners;

import com.intuit.karate.junit5.Karate;

public class TestRunner {
    
    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:features").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testApi() {
        return Karate.run("classpath:features/api-tests.feature").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testAuth() {
        return Karate.run("classpath:features/authentication.feature").relativeTo(getClass());
    }
}`;
  }

  private generateParallelTestRunner(): string {
    return `package runners;

import com.intuit.karate.junit5.Karate;

public class ParallelTestRunner {
    
    @Karate.Test
    Karate testParallel() {
        return Karate.run("classpath:features")
                .relativeTo(getClass())
                .parallel(5);
    }
}`;
  }

  // Generate a ZIP file structure
  generateProjectZip(project: KarateProject): string {
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
    
    return JSON.stringify(files, null, 2);
  }

  private generateReadme(project: KarateProject): string {
    return `# ${project.name}

${project.description}

## Project Structure

\`\`\`
${this.formatFolderStructure(project.folderStructure, 0)}
\`\`\`

## Running Tests

### Prerequisites
- Java 11 or higher
- Maven 3.6 or higher

### Run All Tests
\`\`\`bash
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
`;
  }

  private formatFolderStructure(structure: FolderStructure, depth: number): string {
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
}
