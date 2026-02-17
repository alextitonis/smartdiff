import Anthropic from '@anthropic-ai/sdk';
import { AIProvider } from './providers';
import { FocusArea, ReviewResult } from '../types';
import { buildReviewPrompt, parseReviewResponse } from './prompts';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async review(diff: string, focusAreas: FocusArea[], model: string): Promise<ReviewResult> {
    const prompt = buildReviewPrompt(diff, focusAreas);

    try {
      const response = await this.client.messages.create({
        model: model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = parseReviewResponse(content);

      return {
        summary: parsed.summary,
        issues: parsed.issues,
        suggestions: parsed.suggestions
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Anthropic rate limit exceeded. Please try again later.');
      }
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}
