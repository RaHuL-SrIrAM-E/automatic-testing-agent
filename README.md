# Karate Visual Builder

A visual drag-and-drop tool for generating Apache Karate test suites. Build API test flows visually and export them as `.feature` files.

## Features

### 🎨 Visual Flow Builder
- Drag-and-drop interface for building test flows
- Real-time canvas with component connections
- Intuitive component palette with categorized test components

### 🔧 Component Library
- **HTTP Requests**: GET, POST, PUT, DELETE with full configuration
- **Authentication**: Bearer tokens, Basic auth, API keys
- **Validation**: Status checks, field matching, response time validation
- **Data Management**: Variable extraction, data providers, variable setters
- **Control Flow**: Loops, conditionals, delays

### ⚡ Real-time Code Generation
- Live preview of generated Karate code
- Syntax highlighting and formatting
- Export to `.feature` files
- Copy to clipboard functionality

### 🎯 Professional UI
- Clean, modern interface inspired by Postman and Figma
- Responsive design for different screen sizes
- Intuitive drag-and-drop interactions
- Color-coded component categories

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd karate-visual-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Building a Test Flow

1. **Drag Components**: Drag components from the left palette to the canvas
2. **Configure Properties**: Click on a component to configure its properties in the right panel
3. **View Generated Code**: See the live Karate code generation in the bottom panel
4. **Export**: Download the generated `.feature` file OR generate a complete project

### Two Output Modes

#### 1. Feature File Mode (Original)
- Generates single `.feature` files
- Perfect for quick API tests
- Copy-paste into existing Karate projects

#### 2. Complete Project Mode (New!)
- Generates full Maven project structure
- Ready-to-run with one command
- Includes all configuration files, test data, and documentation

### Running Generated Projects

#### Quick Start (One Command):
```bash
# After downloading and extracting the project
chmod +x setup.sh && ./setup.sh
```

#### Manual Setup:
```bash
# Install Java 11+ and Maven, then:
mvn clean test
```

### Example Generated Code

When you create a flow with: Bearer Auth → GET Request → Status Check → Field Validation

```gherkin
Feature: Generated API Test

Scenario: User Test Flow
  * header Authorization = 'Bearer your-token-here'
  Given url 'https://api.example.com/users'
  When method GET
  Then status 200
  And match $.data[0].name == 'John Doe'
```

## Component Types

### HTTP Request Components
- **GET Request**: Configure URL, headers, query parameters
- **POST Request**: Configure URL, headers, request body (JSON/form)
- **PUT Request**: Similar to POST for updates
- **DELETE Request**: Configure URL and headers

### Authentication Components
- **Bearer Token**: Set Authorization header with Bearer token
- **Basic Auth**: Username/password authentication
- **API Key**: Custom header or query parameter authentication

### Validation Components
- **Status Assertion**: Check HTTP status codes with operators
- **Field Matcher**: Assert specific JSON field values using JSONPath
- **Response Time Check**: Validate response time limits

### Data Management Components
- **Variable Extractor**: Extract values from responses using JSONPath
- **Variable Setter**: Set static variable values
- **Data Provider**: Load test data from external sources

## Project Structure

```
src/
├── components/
│   ├── Canvas/              # Main canvas area
│   ├── ComponentPalette/    # Left sidebar with components
│   ├── PropertiesPanel/     # Right sidebar for configuration
│   └── CodePreview/         # Bottom panel for generated code
├── lib/
│   ├── componentDefinitions.ts  # Component library definitions
│   └── karateGenerator.ts       # Code generation engine
├── types/
│   └── index.ts            # TypeScript type definitions
└── App.tsx                 # Main application component
```

## Technology Stack

- **React 18** with TypeScript
- **React DnD** for drag-and-drop functionality
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-component`
3. Commit your changes: `git commit -am 'Add new component type'`
4. Push to the branch: `git push origin feature/new-component`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Advanced flow connections and branching
- [ ] Test data management and CSV import
- [ ] Custom component creation
- [ ] Flow templates and examples
- [ ] Integration with Karate test runner
- [ ] Collaborative editing features
- [ ] Version control and flow history
