import OpenAI from 'openai';
import { AIProvider } from './providers';
import { FocusArea, ReviewResult } from '../types';
import { buildReviewPrompt, parseReviewResponse } from './prompts';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async review(diff: string, focusAreas: FocusArea[], model: string): Promise<ReviewResult> {
    const prompt = buildReviewPrompt(diff, focusAreas);

    try {
      const response = await this.client.chat.completions.create({
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
      });

      const content = response.choices[0]?.message?.content || '';
      const parsed = parseReviewResponse(content);

      return {
        summary: parsed.summary,
        issues: parsed.issues,
        suggestions: parsed.suggestions
      };
    } catch (error: any) {
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      } else if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
