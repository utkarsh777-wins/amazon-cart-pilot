# BOMAgent (CartPilot MCP) 🛒⚡
> Autonomous Amazon Project BOM & Cart Optimizer built with the Model Context Protocol (MCP) and NitroStack TypeScript SDK.

**Track:** Commerce  
**Live Deployed MCP Server:** `https://bomagent-6ad50b79-aspect-oss-connect.app.nitrocloud.ai`  

---

## 📌 Problem: The Broken Project Shopping Workflow
When building an electronics rig or hardware prototype, purchasing parts on Amazon is an error-prone, multi-step chore:
1. **Manual Compatibility Checks:** Adding an ESP32 microcontroller with a bare 12V industrial power supply creates a direct over-voltage hardware hazard. Amazon treats them as independent items and does not warn the builder.
2. **Delivery Bottlenecks:** A single item with 9-day standard shipping stalls an entire 3-day project timeline, forcing users to manually search for Prime-eligible equivalents.
3. **Budget Leakage:** Makers routinely overspend on overpriced peripheral packs and miss stacking category coupons across scattered listings.

## 💡 Solution: The MCP-Powered Autonomous CartPilot
BOMAgent reimagines Amazon checkout into an agentic workflow using the Model Context Protocol. Given a high-level user prompt with target constraints (budget, timeline, hardware specs), the agent connects to cart diagnostics, cross-references compatible Prime catalog inventory, mutates cart contents, applies promo discounts, and verifies checkout readiness in a single conversational turn.

---

## 🛠️ MCP Implementation Architecture

BOMAgent implements the full range of MCP primitives to deliver an end-to-end agentic workflow:

### 1. Tools (`@Tool`)
* `get_amazon_cart_diagnostics`: Audits the active cart (`CART-2026`) against budget caps, delivery deadlines, and logic-level voltage compatibility (flags 12V unregulated vs 3.3V/5V logic mismatches).
* `search_compatible_alternatives`: Scans Amazon's catalog for Prime-eligible, drop-in replacement hardware that resolves voltage hazards and arrives within target deadlines.
* `swap_cart_items_and_apply_coupon`: Mutates the in-memory cart state by replacing incompatible/delayed items with verified catalog parts and stacking promotional coupon codes (`MAKER10` / `PRIMEFAST`).
* `generate_checkout_readiness_report`: Compiles a before-and-after verification summary detailing net financial savings, shipping days saved, and hardware conflict resolutions.

### 2. Resources (`@Resource`)
* `amazon://cart/CART-2026`: Exposes a real-time JSON snapshot of the user's active cart state, catalog replacements, and active coupon structures for external LLM grounding.

### 3. Prompts (`@Prompt`)
* `optimize_amazon_project_cart`: A pre-configured multi-variable prompt template allowing one-click execution of the audit-and-swap workflow.

---

## 📊 Before vs. After Results

| Metric | Original Cart (Manual) | BOMAgent (MCP Optimized) | Impact |
| :--- | :--- | :--- | :--- |
| **Total Cost** | ₹7,250 (Over Budget) | ₹4,530 (With Coupon) | **₹2,720 Saved (37.5% cut)** |
| **Delivery Time** | 9 Days (Deadline Missed) | 2 Days (Prime Express) | **7 Days Faster** |
| **Hardware Safety** | 12V Unregulated Hazard | 5V/3.3V Regulated Buck Rail | **Zero Hardware Smoke Risk** |
| **Manual Steps** | ~15 tab switches & searches | 1 Natural Language Prompt | **Fully Autonomous** |

---

## 🚀 Local Development & Build

### Prerequisites
* Node.js 18+
* NitroStack CLI: `npm install -g @nitrostack/cli`

### Installation & Run
```bash
# Clone the repository
git clone [https://github.com/utkarsh777-wins/amazon-cart-pilot.git](https://github.com/utkarsh777-wins/amazon-cart-pilot.git)
cd amazon-cart-pilot

# Install dependencies
npm install

# Build production bundle
npm run build

# Start local server with STDIO transport
npm start

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/utkarsh777-wins/amazon-cart-pilot.git
cd amazon-cart-pilot

# Install dependencies
npm install

# Build production bundle
npm run build

# Start local server with STDIO transport
npm start