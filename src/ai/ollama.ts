import axios from 'axios';
import { AIProvider } from './providers';
import { FocusArea, ReviewResult } from '../types';
import { buildReviewPrompt, parseReviewResponse } from './prompts';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'http://localhost:11434';
  }

  async review(diff: string, focusAreas: FocusArea[], model: string): Promise<ReviewResult> {
    const prompt = buildReviewPrompt(diff, focusAreas);

    try {
      // First, check if Ollama is running
      try {
        await axios.get(`${this.baseURL}/api/tags`);
      } catch (error) {
        throw new Error(
          'Cannot connect to Ollama. Make sure Ollama is running (ollama serve) and accessible at ' + this.baseURL
        );
      }

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: model,
          prompt: `You are an expert code reviewer. Provide detailed, actionable feedback.\n\n${prompt}`,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 2000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 minutes timeout for local models
        }
      );

      const content = response.data.response || '';
      const parsed = parseReviewResponse(content);

      return {
        summary: parsed.summary,
        issues: parsed.issues,
        suggestions: parsed.suggestions
      };
    } catch (error: any) {
      if (error.message.includes('Cannot connect')) {
        throw error; // Re-throw our custom connection error
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(
          'Cannot connect to Ollama. Make sure Ollama is running:\n' +
          '  1. Install Ollama: https://ollama.ai\n' +
          '  2. Run: ollama serve\n' +
          '  3. Pull a model: ollama pull llama2'
        );
      } else if (error.response?.status === 404) {
        throw new Error(
          `Model "${model}" not found in Ollama. Pull it with: ollama pull ${model}`
        );
      }
      throw new Error(`Ollama error: ${error.message}`);
    }
  }
}
