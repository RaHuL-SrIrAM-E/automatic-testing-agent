import { ComponentNode } from '../types';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAAy8qvRuJavw6h7Se2weyQSkHFRKu3dow";

export interface GeminiResponse {
  explanation: string;
  components: ComponentNode[];
}

export class GeminiService {
  private static async callGeminiAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini API';
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error(`Failed to call Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateTestComponents(userInput: string): Promise<GeminiResponse> {
    const prompt = this.createPrompt(userInput);
    
    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseGeminiResponse(response, userInput);
    } catch (error) {
      console.error('Error generating test components:', error);
      // Fallback to mock response if API fails
      return this.getMockResponse(userInput);
    }
  }

  private static createPrompt(userInput: string): string {
    return `You are an expert API testing assistant that generates Karate test components based on user descriptions.

Available component types:
- GET_REQUEST: HTTP GET requests
- POST_REQUEST: HTTP POST requests  
- PUT_REQUEST: HTTP PUT requests
- DELETE_REQUEST: HTTP DELETE requests
- BEARER_AUTH: Bearer token authentication
- BASIC_AUTH: Basic authentication
- API_KEY_AUTH: API key authentication
- STATUS_ASSERTION: HTTP status code validation
- JSON_SCHEMA_VALIDATOR: JSON schema validation
- FIELD_MATCHER: Field value matching
- RESPONSE_TIME_CHECK: Response time validation
- VARIABLE_EXTRACTOR: Extract values from response
- VARIABLE_SETTER: Set variables
- DATA_PROVIDER: Provide test data
- LOOP_ITERATOR: Loop through data
- CONDITIONAL_BRANCH: Conditional logic
- DELAY_WAIT: Add delays

User request: "${userInput}"

Please generate appropriate Karate test components for this request. Respond with a JSON object in this exact format:

{
  "explanation": "Brief explanation of what components were generated and why",
  "components": [
    {
      "type": "GET_REQUEST",
      "name": "Get Users",
      "url": "https://api.example.com/users",
      "headers": {"Content-Type": "application/json"},
      "queryParams": {"page": "1", "limit": "10"},
      "position": {"x": 50, "y": 50}
    },
    {
      "type": "STATUS_ASSERTION", 
      "expectedStatus": 200,
      "position": {"x": 50, "y": 200}
    }
  ]
}

Guidelines:
- Always include appropriate HTTP request components
- Add validation components for status codes, response times, etc.
- Include authentication components if mentioned
- Use realistic URLs and data
- Position components with 150px vertical spacing
- Keep explanations concise but helpful
- If the request is unclear, ask for clarification

Respond only with the JSON object, no additional text.`;
  }

  private static parseGeminiResponse(response: string, userInput: string): GeminiResponse {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Convert to ComponentNode format
      const components: ComponentNode[] = parsed.components.map((comp: any, index: number) => ({
        id: `node-${Date.now()}-${index}`,
        type: comp.type,
        position: comp.position || { x: 50, y: 50 + (index * 150) },
        data: {
          url: comp.url || '',
          headers: comp.headers || {},
          queryParams: comp.queryParams || {},
          body: comp.body || '',
          bodyType: comp.bodyType || 'json',
          expectedStatus: comp.expectedStatus || 200,
          token: comp.token || '',
          username: comp.username || '',
          password: comp.password || '',
          apiKey: comp.apiKey || '',
          keyName: comp.keyName || '',
          keyLocation: comp.keyLocation || 'header',
          // Add other properties as needed
        },
        connections: [],
        outputs: [],
        inputs: []
      }));

      return {
        explanation: parsed.explanation || 'Generated test components based on your request.',
        components
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.getMockResponse(userInput);
    }
  }

  private static getMockResponse(userInput: string): GeminiResponse {
    // Fallback mock response
    const components: ComponentNode[] = [];
    let explanation = "I've generated the following test components based on your request:\n\n";

    if (userInput.toLowerCase().includes('get') || userInput.toLowerCase().includes('fetch')) {
      components.push({
        id: `node-${Date.now()}-1`,
        type: 'GET_REQUEST',
        position: { x: 50, y: 50 },
        data: {
          url: userInput.includes('/api/') ? this.extractUrl(userInput) : 'https://jsonplaceholder.typicode.com/users',
          headers: {},
          queryParams: {}
        },
        connections: [],
        outputs: [],
        inputs: []
      });
      explanation += "• GET Request component for fetching data\n";
    }

    if (userInput.toLowerCase().includes('post') || userInput.toLowerCase().includes('create')) {
      components.push({
        id: `node-${Date.now()}-2`,
        type: 'POST_REQUEST',
        position: { x: 50, y: 200 },
        data: {
          url: userInput.includes('/api/') ? this.extractUrl(userInput) : 'https://jsonplaceholder.typicode.com/posts',
          headers: { 'Content-Type': 'application/json' },
          body: '{"title": "Test Post", "body": "Test content"}',
          bodyType: 'json'
        },
        connections: [],
        outputs: [],
        inputs: []
      });
      explanation += "• POST Request component for creating data\n";
    }

    if (userInput.toLowerCase().includes('status') || userInput.toLowerCase().includes('200')) {
      components.push({
        id: `node-${Date.now()}-3`,
        type: 'STATUS_ASSERTION',
        position: { x: 50, y: 350 },
        data: {
          expectedStatus: this.extractStatus(userInput) || 200
        },
        connections: [],
        outputs: [],
        inputs: []
      });
      explanation += "• Status validation to check response code\n";
    }

    if (components.length === 0) {
      explanation = "I couldn't understand your request clearly. Could you please be more specific? For example:\n\n• \"Test a GET request to /api/users that returns 200 status\"\n• \"Create a POST request to /api/login with authentication\"\n• \"Test an API endpoint with JSON validation\"";
    }

    return { explanation, components };
  }

  private static extractUrl(input: string): string {
    const urlMatch = input.match(/\/api\/[^\s]+/);
    return urlMatch ? `https://example.com${urlMatch[0]}` : 'https://jsonplaceholder.typicode.com/users';
  }

  private static extractStatus(input: string): number {
    const statusMatch = input.match(/\b(200|201|400|401|404|500)\b/);
    return statusMatch ? parseInt(statusMatch[0]) : 200;
  }
}
