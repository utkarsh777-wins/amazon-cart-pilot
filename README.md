# CartPilot AI - Autonomous Amazon Project BOM & Cart Optimizer

Built for the **MCP to the Moon Buildathon (Commerce Track)**.

## Overview
CartPilot AI is an autonomous Model Context Protocol (MCP) server that reimagines Amazon's multi-item project shopping workflow. Instead of manually cross-checking delivery bottlenecks, voltage incompatibilities, and budget overruns across multiple tabs, our AI agent audits the cart, instantly surfaces Prime-eligible drop-in hardware alternatives, applies stacking discount codes, and generates an instant, checkout-ready verification report in a single natural language prompt.

## Key Tools Provided
1. `get_amazon_cart_diagnostics`: Runs an automated audit for budget overruns, delivery delays, and spec mismatches.
2. `search_compatible_alternatives`: Finds Prime-eligible drop-in hardware replacements.
3. `swap_cart_items_and_apply_coupon`: Mutates the cart state by swapping items and applying promo codes (`MAKER10`).
4. `generate_checkout_readiness_report`: Outputs the final pre-checkout summary comparing before vs. after.