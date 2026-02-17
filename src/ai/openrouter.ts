import axios from 'axios';
import { AIProvider } from './providers';
import { FocusArea, ReviewResult } from '../types';
import { buildReviewPrompt, parseReviewResponse } from './prompts';

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async review(diff: string, focusAreas: FocusArea[], model: string): Promise<ReviewResult> {
    const prompt = buildReviewPrompt(diff, focusAreas);

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert code reviewer. Provide detailed, actionable feedback.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/yourusername/smartdiff',
            'X-Title': 'SmartDiff Code Review'
          }
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      const parsed = parseReviewResponse(content);

      return {
        summary: parsed.summary,
        issues: parsed.issues,
        suggestions: parsed.suggestions
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenRouter API key. Please check your configuration.');
      } else if (error.response?.status === 429) {
        throw new Error('OpenRouter rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 402) {
        throw new Error('OpenRouter credits exhausted. Please add credits to your account.');
      }
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }
}
