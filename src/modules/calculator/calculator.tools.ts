import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export interface CartItem {
  itemId: string;
  name: string;
  category: string;
  priceInr: number;
  deliveryDays: number;
  primeEligible: boolean;
  voltageSpec: string;
  compatibleWith3v3Logic: boolean;
  issueFlag: string | null;
}

export interface CatalogAlternative {
  productId: string;
  replacesItemId: string;
  name: string;
  priceInr: number;
  deliveryDays: number;
  primeEligible: boolean;
  rating: number;
  voltageSpec: string;
  compatibleWith3v3Logic: boolean;
  whyRecommended: string;
}

const ORIGINAL_CART_TOTAL = 7250;
const ORIGINAL_MAX_DELIVERY_DAYS = 9;

// Mutable in-memory state so tool calls actually update the cart
export const activeCartState: {
  cartId: string;
  projectTitle: string;
  targetBudgetInr: number;
  maxDeliveryDays: number;
  appliedCoupon: string | null;
  couponDiscountInr: number;
  items: CartItem[];
  swapHistory: Array<{
    removedItemId: string;
    removedName: string;
    addedProductId: string;
    addedName: string;
    moneySavedInr: number;
    daysSaved: number;
  }>;
} = {
  cartId: 'CART-2026',
  projectTitle: 'Custom Edge-AI Smart Desk Companion Rig',
  targetBudgetInr: 6500,
  maxDeliveryDays: 3,
  appliedCoupon: null,
  couponDiscountInr: 0,
  swapHistory: [],
  items: [
    {
      itemId: 'ITEM-ESP32',
      name: 'ESP32-S3 DevKitC-1 Dual-Core Wi-Fi/BLE Microcontroller Board',
      category: 'Microcontroller',
      priceInr: 650,
      deliveryDays: 2,
      primeEligible: true,
      voltageSpec: '3.3V Logic / 5V USB-C Input',
      compatibleWith3v3Logic: true,
      issueFlag: null
    },
    {
      itemId: 'ITEM-PSU-12V',
      name: 'Industrial 12V 5A Bare-Metal Switching Power Supply',
      category: 'Power Supply',
      priceInr: 1850,
      deliveryDays: 9,
      primeEligible: false,
      voltageSpec: '12V Unregulated Direct Output',
      compatibleWith3v3Logic: false,
      issueFlag: 'CRITICAL_SPEC_AND_DELIVERY_CONFLICT: 12V unregulated output will damage 3.3V/5V ESP32 & sensors without a buck converter, and 9-day shipping violates the 3-day deadline.'
    },
    {
      itemId: 'ITEM-LCD-GC9A01',
      name: 'Waveshare 1.28-inch Round IPS LCD Display Module (GC9A01 SPI)',
      category: 'Display',
      priceInr: 1450,
      deliveryDays: 2,
      primeEligible: true,
      voltageSpec: '3.3V SPI Interface',
      compatibleWith3v3Logic: true,
      issueFlag: null
    },
    {
      itemId: 'ITEM-BB-PRO',
      name: 'Imported Pro-Grade Heavy Bench Breadboard & Gold Jumper Kit',
      category: 'Prototyping',
      priceInr: 2100,
      deliveryDays: 5,
      primeEligible: false,
      voltageSpec: 'Standard 830 Tie-Points',
      compatibleWith3v3Logic: true,
      issueFlag: 'OVERPRICED_AND_DELAYED: Costs ₹2,100 (causes budget overrun) and takes 5 days to arrive (violates 3-day deadline).'
    },
    {
      itemId: 'ITEM-MIC-INMP441',
      name: 'INMP441 Omnidirectional I2S Digital Microphone Sensor + PAM8403 Amp',
      category: 'Audio Sensor',
      priceInr: 1200,
      deliveryDays: 2,
      primeEligible: true,
      voltageSpec: '3.3V I2S Digital Logic',
      compatibleWith3v3Logic: true,
      issueFlag: null
    }
  ]
};

export const catalogAlternatives: CatalogAlternative[] = [
  {
    productId: 'ALT-PSU-BUCK-5V',
    replacesItemId: 'ITEM-PSU-12V',
    name: '5V/3.3V Dual-Rail USB-C Power Supply + LM2596 Buck Converter Combo',
    priceInr: 550,
    deliveryDays: 1,
    primeEligible: true,
    rating: 4.8,
    voltageSpec: 'Regulated 5V & 3.3V Output with Thermal Protection',
    compatibleWith3v3Logic: true,
    whyRecommended: 'Fixes the 12V over-voltage hardware hazard, saves ₹1,300, and arrives in 1 day via Prime instead of 9 days.'
  },
  {
    productId: 'ALT-BB-MAKER',
    replacesItemId: 'ITEM-BB-PRO',
    name: 'MakerBest 2-Pack 830-Point Solderless Breadboard + 120pc Dupont Jumper Kit',
    priceInr: 450,
    deliveryDays: 1,
    primeEligible: true,
    rating: 4.7,
    voltageSpec: 'Standard 830 Tie-Points (Double Breadboard Layout Ready)',
    compatibleWith3v3Logic: true,
    whyRecommended: 'Identical prototyping capability, saves ₹1,650, and arrives in 1 day via Prime instead of 5 days.'
  }
];

export const availableCoupons: Record<string, { code: string; flatDiscountInr: number; description: string }> = {
  MAKER10: {
    code: 'MAKER10',
    flatDiscountInr: 430,
    description: '10% Maker & Embedded Electronics Instant Discount'
  },
  PRIMEFAST: {
    code: 'PRIMEFAST',
    flatDiscountInr: 300,
    description: '₹300 Flat Off on Prime All-In-One Project Bundles'
  }
};

export class CalculatorTools {
  @Tool({
    name: 'get_amazon_cart_diagnostics',
    description:
      'Fetches the user\'s current Amazon cart items and runs an automated diagnostic audit checking for total budget overruns, delivery date bottlenecks, and technical specification incompatibilities between items in the cart. Always call this tool first when a user asks to inspect, fix, or optimize their Amazon cart.',
    inputSchema: z.object({
      cartId: z.string().describe('The Amazon cart ID to audit, e.g., CART-2026'),
      maxBudget: z.number().describe('Maximum allowed budget in INR, e.g., 6500'),
      maxDeliveryDays: z.number().describe('Maximum acceptable delivery days, e.g., 3')
    })
  })
  async getAmazonCartDiagnostics(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Running Amazon Cart Diagnostics', input);

    activeCartState.targetBudgetInr = input.maxBudget || 6500;
    activeCartState.maxDeliveryDays = input.maxDeliveryDays || 3;

    const subtotal = activeCartState.items.reduce((sum, item) => sum + item.priceInr, 0);
    const finalTotal = Math.max(0, subtotal - activeCartState.couponDiscountInr);
    const slowestDeliveryDays = Math.max(...activeCartState.items.map((i) => i.deliveryDays));

    const problematicItems = activeCartState.items.filter(
      (item) =>
        !item.compatibleWith3v3Logic ||
        item.deliveryDays > activeCartState.maxDeliveryDays ||
        item.issueFlag !== null
    );

    return {
      cartId: activeCartState.cartId,
      projectTitle: activeCartState.projectTitle,
      auditStatus: problematicItems.length > 0 || finalTotal > activeCartState.targetBudgetInr ? 'ACTION_REQUIRED' : 'READY_FOR_CHECKOUT',
      budgetAnalysis: {
        currentSubtotalInr: subtotal,
        couponDiscountInr: activeCartState.couponDiscountInr,
        currentFinalTotalInr: finalTotal,
        targetBudgetInr: activeCartState.targetBudgetInr,
        overBudgetByInr: Math.max(0, finalTotal - activeCartState.targetBudgetInr),
        withinBudget: finalTotal <= activeCartState.targetBudgetInr
      },
      deliveryAnalysis: {
        slowestItemDeliveryDays: slowestDeliveryDays,
        requiredMaxDeliveryDays: activeCartState.maxDeliveryDays,
        onTimeDelivery: slowestDeliveryDays <= activeCartState.maxDeliveryDays
      },
      problematicItemsCount: problematicItems.length,
      problematicItems: problematicItems.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        priceInr: item.priceInr,
        deliveryDays: item.deliveryDays,
        voltageSpec: item.voltageSpec,
        compatibleWith3v3Logic: item.compatibleWith3v3Logic,
        issueFlag: item.issueFlag
      })),
      allCartItems: activeCartState.items,
      recommendedNextStep:
        'Call search_compatible_alternatives for each problematic itemId (ITEM-PSU-12V and ITEM-BB-PRO) to find Prime drop-in replacements.'
    };
  }

  @Tool({
    name: 'search_compatible_alternatives',
    description:
      'Searches Amazon\'s product catalog for Prime-eligible drop-in replacement products that resolve specification conflicts, fit within maxPrice, and arrive within maxDeliveryDays. Call this after get_amazon_cart_diagnostics identifies problematic or overpriced items.',
    inputSchema: z.object({
      problemItemId: z.string().describe('The itemId of the problematic cart item to replace (e.g., ITEM-PSU-12V or ITEM-BB-PRO)'),
      maxPrice: z.number().optional().describe('Maximum price in INR for the replacement item'),
      maxDeliveryDays: z.number().optional().describe('Maximum delivery time in days')
    })
  })
  async searchCompatibleAlternatives(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Searching compatible catalog alternatives', input);

    const matches = catalogAlternatives.filter(
      (alt) => alt.replacesItemId.toUpperCase() === String(input.problemItemId).toUpperCase()
    );

    return {
      queriedProblemItemId: input.problemItemId,
      matchingAlternativesFound: matches.length,
      alternatives: matches.length > 0 ? matches : catalogAlternatives,
      availablePromoCoupons: Object.values(availableCoupons),
      recommendedNextStep:
        'Call swap_cart_items_and_apply_coupon to replace the problematic cart item with the matching productId and apply coupon code MAKER10.'
    };
  }

  @Tool({
    name: 'swap_cart_items_and_apply_coupon',
    description:
      'Mutates the active Amazon cart by replacing an incompatible, delayed, or overpriced item with a selected catalog replacement and applies a promotional coupon code (MAKER10 or PRIMEFAST). Returns the updated cart state.',
    inputSchema: z.object({
      cartId: z.string().describe('The Amazon cart ID, e.g., CART-2026'),
      removeItemId: z.string().describe('The itemId currently in the cart to remove (e.g., ITEM-PSU-12V or ITEM-BB-PRO)'),
      replacementProductId: z.string().describe('The catalog productId to add in its place (e.g., ALT-PSU-BUCK-5V or ALT-BB-MAKER)'),
      couponCode: z.string().optional().describe('Optional coupon code to apply (e.g., MAKER10 or PRIMEFAST)')
    })
  })
  async swapCartItemsAndApplyCoupon(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Swapping cart item and applying coupon', input);

    const removeIndex = activeCartState.items.findIndex(
      (item) => item.itemId.toUpperCase() === String(input.removeItemId).toUpperCase()
    );

    const replacement = catalogAlternatives.find(
      (alt) => alt.productId.toUpperCase() === String(input.replacementProductId).toUpperCase()
    );

    if (!replacement) {
      throw new Error(`Replacement product ${input.replacementProductId} not found in catalog.`);
    }

    let removedItem: CartItem | null = null;
    if (removeIndex !== -1) {
      removedItem = activeCartState.items[removeIndex];
      const newCartItem: CartItem = {
        itemId: replacement.productId,
        name: replacement.name,
        category: removedItem.category,
        priceInr: replacement.priceInr,
        deliveryDays: replacement.deliveryDays,
        primeEligible: replacement.primeEligible,
        voltageSpec: replacement.voltageSpec,
        compatibleWith3v3Logic: replacement.compatibleWith3v3Logic,
        issueFlag: null
      };
      activeCartState.items[removeIndex] = newCartItem;

      activeCartState.swapHistory.push({
        removedItemId: removedItem.itemId,
        removedName: removedItem.name,
        addedProductId: replacement.productId,
        addedName: replacement.name,
        moneySavedInr: removedItem.priceInr - replacement.priceInr,
        daysSaved: removedItem.deliveryDays - replacement.deliveryDays
      });
    }

    if (input.couponCode) {
      const normalizedCode = String(input.couponCode).toUpperCase();
      const coupon = availableCoupons[normalizedCode] || availableCoupons.MAKER10;
      activeCartState.appliedCoupon = coupon.code;
      activeCartState.couponDiscountInr = coupon.flatDiscountInr;
    }

    const updatedSubtotal = activeCartState.items.reduce((sum, item) => sum + item.priceInr, 0);
    const updatedFinalTotal = Math.max(0, updatedSubtotal - activeCartState.couponDiscountInr);
    const slowestDeliveryDays = Math.max(...activeCartState.items.map((i) => i.deliveryDays));

    return {
      status: 'SWAP_SUCCESSFUL',
      cartId: activeCartState.cartId,
      swappedOut: removedItem ? { itemId: removedItem.itemId, name: removedItem.name, oldPriceInr: removedItem.priceInr, oldDeliveryDays: removedItem.deliveryDays } : null,
      swappedIn: { productId: replacement.productId, name: replacement.name, newPriceInr: replacement.priceInr, newDeliveryDays: replacement.deliveryDays },
      appliedCoupon: activeCartState.appliedCoupon,
      couponDiscountInr: activeCartState.couponDiscountInr,
      updatedCartSummary: {
        subtotalInr: updatedSubtotal,
        finalTotalInr: updatedFinalTotal,
        targetBudgetInr: activeCartState.targetBudgetInr,
        withinBudget: updatedFinalTotal <= activeCartState.targetBudgetInr,
        slowestDeliveryDays,
        withinDeliveryDeadline: slowestDeliveryDays <= activeCartState.maxDeliveryDays
      }
    };
  }

  @Tool({
    name: 'generate_checkout_readiness_report',
    description:
      'Generates the final pre-checkout verification summary for the Amazon cart, confirming all items are spec-compatible, under budget, and arriving on time, along with total money and days saved.',
    inputSchema: z.object({
      cartId: z.string().describe('The Amazon cart ID, e.g., CART-2026')
    })
  })
  async generateCheckoutReadinessReport(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating final checkout readiness report', input);

    const subtotal = activeCartState.items.reduce((sum, item) => sum + item.priceInr, 0);
    const finalTotal = Math.max(0, subtotal - activeCartState.couponDiscountInr);
    const slowestDeliveryDays = Math.max(...activeCartState.items.map((i) => i.deliveryDays));
    const allCompatible = activeCartState.items.every((item) => item.compatibleWith3v3Logic && item.issueFlag === null);

    return {
      cartId: activeCartState.cartId,
      projectTitle: activeCartState.projectTitle,
      checkoutReady:
        allCompatible &&
        finalTotal <= activeCartState.targetBudgetInr &&
        slowestDeliveryDays <= activeCartState.maxDeliveryDays,
      beforeVsAfterComparison: {
        originalCartTotalInr: ORIGINAL_CART_TOTAL,
        optimizedSubtotalInr: subtotal,
        couponApplied: activeCartState.appliedCoupon,
        couponDiscountInr: activeCartState.couponDiscountInr,
        finalOptimizedTotalInr: finalTotal,
        totalMoneySavedInr: ORIGINAL_CART_TOTAL - finalTotal,
        originalDeliveryDays: ORIGINAL_MAX_DELIVERY_DAYS,
        optimizedDeliveryDays: slowestDeliveryDays,
        deliveryDaysSaved: ORIGINAL_MAX_DELIVERY_DAYS - slowestDeliveryDays,
        hardwareConflictsResolved: activeCartState.swapHistory.length
      },
      swapsExecuted: activeCartState.swapHistory,
      finalCartItems: activeCartState.items
    };
  }
}