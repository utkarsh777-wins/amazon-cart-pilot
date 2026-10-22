import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { activeCartState, catalogAlternatives, availableCoupons } from './calculator.tools.js';

export class CalculatorResources {
  @Resource({
    uri: 'amazon://cart/CART-2026',
    name: 'Amazon Smart Cart Live State & Catalog Snapshot',
    description: 'Live snapshot of the user\'s active Amazon project cart, compatible Prime replacement catalog, and active promotional coupons.',
    mimeType: 'application/json'
  })
  async getOperations(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching Amazon Smart Cart live resource snapshot');

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              activeCart: activeCartState,
              catalogAlternatives,
              availableCoupons
            },
            null,
            2
          )
        }
      ]
    };
  }
}