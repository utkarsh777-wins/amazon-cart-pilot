import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class CalculatorPrompts {
  @Prompt({
    name: 'optimize_amazon_project_cart',
    description: 'Autonomous workflow prompt to audit, fix hardware conflicts, swap delayed items, and optimize an Amazon project cart under budget.',
    arguments: [
      {
        name: 'cartId',
        description: 'The Amazon cart ID to optimize (default: CART-2026)',
        required: false
      }
    ]
  })
  async getHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating Amazon CartPilot optimization prompt');
    const cartId = args?.cartId || 'CART-2026';

    return [
      {
        role: 'user' as const,
        content: `Check my Amazon cart ${cartId}. I need everything delivered within 3 days and my strict budget is ₹6,500. Find any incompatible, delayed, or overpriced items, swap them with compatible Prime alternatives, apply the best coupon, and give me a final checkout readiness report.`
      }
    ];
  }
}