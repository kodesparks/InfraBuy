```markdown
# Design System Specification: High-End Marketplace Editorial

## 1. Overview & Creative North Star: "The Architectural Curator"
This design system moves away from the "industrial warehouse" aesthetic common in construction and instead embraces the "Architectural Curator." The North Star is a vision where heavy materials meet light-as-air digital interfaces. 

We break the "template" look by utilizing **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid, boxed-in grids, we use breathing room and overlapping layers to create a sense of professional reliability and modern sophistication. This is not just a marketplace; it is a high-end procurement experience that feels as precise as the blueprints our users work from.

---

## 2. Colors & Surface Philosophy
The palette balances the energy of digital-native gradients with the stability of architectural stone and light.

### The Palette (Material Design Tokens)
*   **Primary Core:** `primary` (#6731e2) to `secondary` (#0057bd) gradient.
*   **Surface Layers:** `surface` (#f5f7f9) to `surface_container_lowest` (#ffffff).
*   **Accents:** `tertiary` (#9d365e) for nuanced callouts; `error` (#b41340) for critical alerts.

### The "No-Line" Rule
**Explicit Instruction:** Sectioning via 1px solid borders is strictly prohibited. We define boundaries through **Background Color Shifts**. 
*   Place a `surface_container_low` section directly against a `surface` background to denote a change in context.
*   Use `surface_container_lowest` (Pure White) for interactive cards to make them "pop" against the `surface_bright` background.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper or frosted glass.
1.  **Base:** `background` (#f5f7f9).
2.  **Sectioning:** `surface_container` (#e5e9eb) for large layout blocks.
3.  **Interaction:** `surface_container_lowest` (#ffffff) for the primary interactive cards.
4.  **Floating Elements:** Use Glassmorphism (Semi-transparent `surface_container_lowest` with a 20px backdrop-blur) for the floating bottom navigation.

### The "Glass & Gradient" Rule
To ensure a premium feel, primary CTAs must use a linear gradient from `primary` (#6731e2) to `primary_container` (#ab8eff). This adds "soul" and depth, mimicking the way light hits high-quality materials.

---

## 3. Typography: Editorial Authority
We use **Inter** to convey a Swiss-inspired, professional reliability. The hierarchy is driven by extreme contrast in scale.

*   **Display & Headlines:** Use `700` weight (Bold). These should feel authoritative. Use `display-md` for hero price points or material categories to create a "magazine" feel.
*   **Secondary Titles:** Use `title-md` with `500` weight (Medium) in `on_surface_variant` (#595c5e) to provide clear, quiet sub-headers.
*   **Body:** `body-md` is our workhorse. Keep line-heights generous (1.5x) to ensure readability on technical spec sheets.
*   **Labels:** `label-sm` should be used sparingly for metadata (e.g., SKU numbers, weight units), always in uppercase with +5% letter spacing for a premium technical look.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_lowest` (White) card on a `surface_container_low` background. This creates a "soft lift."
*   **Ambient Shadows:** For floating elements (Bottom Nav, Tooltips), use a "Cloud Shadow":
    *   `Y: 12px, Blur: 24px, Color: rgba(44, 47, 49, 0.06)` (a tinted version of `on_surface`).
*   **The "Ghost Border" Fallback:** If high-contrast accessibility is required, use `outline_variant` at **15% opacity**. Never use a 100% opaque border.
*   **Glassmorphism:** The floating pill navigation must use `surface_container_lowest` at 80% opacity with a `blur(12px)` effect to feel integrated into the environment.

---

## 5. Components & Elements

### Buttons (Pill-Shaped)
*   **Primary:** Gradient (`primary` to `primary_container`), white text, no shadow unless hovered. `borderRadius: full`.
*   **Secondary:** `surface_container_high` background with `primary` text. No border.
*   **Tertiary:** Transparent background, `primary` text, `700` weight.

### Cards & Lists
*   **The Card Rule:** `borderRadius: 2rem` (xl). 
*   **Forbid Dividers:** Do not use lines between list items. Use 16px of vertical whitespace or a subtle background toggle (zebra striping using `surface` and `surface_container_low`) to separate items.
*   **Product Cards:** Use `surface_container_lowest` with a high-degree corner radius. Image should bleed to the top edges.

### Inputs & Fields
*   **Surface:** `surface_container_low`. 
*   **Focus State:** Transition background to `surface_container_lowest` and add a `2px` ghost border using `primary` at 30% opacity.
*   **Rounding:** `1rem` (default) for standard fields; `full` for search bars.

### Specialized Marketplace Components
*   **Availability Badge:** Soft pill shape using `secondary_container` with `on_secondary_container` text.
*   **Floating Bottom Nav:** A pill-shaped container detached from the screen edges. Use Glassmorphism and the Ambient Shadow defined in Section 4.
*   **Quantity Stepper:** A unified pill shape where `-`, `qty`, and `+` sit on a single `surface_container_high` track.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool to separate material categories.
*   **DO** overlap elements (e.g., a product image slightly breaking the boundary of its container) to create a custom, high-end feel.
*   **DO** use tonal shifts (Surface Low to Surface High) to indicate hierarchy.

### Don't
*   **DON'T** use black (#000000) for text. Use `on_surface` (#2c2f31) for a softer, more professional grey-black.
*   **DON'T** use 1px dividers or borders to separate content blocks.
*   **DON'T** use "Standard" Material Design shadows. Only use the wide, diffused Ambient Shadows for truly floating items.
*   **DON'T** use sharp corners. Everything in this system—from buttons to progress bars—must adhere to the `md` to `xl` roundedness scale.

---
**Director's Final Note:** This design system is about the "space between the items." By removing borders and relying on subtle shifts in the color of the "light" (the surfaces), you create an interface that feels like a physical tool—reliable, modern, and expensive.```