---
name: Serene Healthcare Identity
colors:
  surface: '#ecfdfb'
  surface-dim: '#ccdddb'
  surface-bright: '#ecfdfb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f7f5'
  surface-container: '#e0f1ef'
  surface-container-high: '#dbecea'
  surface-container-highest: '#d5e6e4'
  on-surface: '#0f1e1d'
  on-surface-variant: '#3e4946'
  inverse-surface: '#243332'
  inverse-on-surface: '#e3f4f2'
  outline: '#6e7976'
  outline-variant: '#bec9c5'
  surface-tint: '#006b5f'
  primary: '#006056'
  on-primary: '#ffffff'
  primary-container: '#1f7a6e'
  on-primary-container: '#b3fff1'
  inverse-primary: '#83d5c7'
  secondary: '#a7391e'
  on-secondary: '#ffffff'
  secondary-container: '#fd7958'
  on-secondary-container: '#6e1500'
  tertiary: '#006231'
  on-tertiary: '#ffffff'
  tertiary-container: '#007e40'
  on-tertiary-container: '#c1ffcc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff2e3'
  primary-fixed-dim: '#83d5c7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a2'
  on-secondary-fixed: '#3c0700'
  on-secondary-fixed-variant: '#862208'
  tertiary-fixed: '#7efba4'
  tertiary-fixed-dim: '#61de8a'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#ecfdfb'
  on-background: '#0f1e1d'
  surface-variant: '#d5e6e4'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 40px
---

## Brand & Style
The design system is crafted for a premium, mobile-first healthcare experience targeting professionals in their 30s. It balances the authority of a medical institution with the approachability of a lifestyle companion. The visual language is rooted in **Modern Corporate Minimalism**, prioritizing clarity, efficiency, and a sense of calm.

The atmosphere is "Privacy-Respecting"—achieved through generous negative space and a clean, uncluttered interface that avoids cognitive overload. By focusing on high-quality typography and a card-based architecture, the design system ensures that sensitive health data feels organized and secure rather than clinical or intimidating.

## Colors
The palette is anchored by **Deep Teal**, chosen to evoke stability, professional trust, and a soothing medical environment. **Soft Coral** serves as the strategic accent color for primary Call-to-Actions (CTAs) and motivation-based interactions, providing a warm, energetic contrast that isn't overly aggressive.

- **Primary (Deep Teal):** Used for navigation, headers, and primary branding elements to establish authority.
- **Secondary (Soft Coral):** Reserved for high-priority actions like "Start Consultation" or "Save Progress."
- **Success (Green):** A refined emerald used for health goal achievements and positive feedback.
- **Neutral/Text (Charcoal):** A deep, slightly desaturated charcoal used for maximum legibility without the harshness of pure black.
- **Surface (Off-white):** The base background color, providing a soft canvas that reduces eye strain compared to stark white.

For Dark Mode, the background transitions to a deep charcoal-teal hybrid to maintain the "Trust" narrative while preserving high contrast for text.

## Typography
This design system utilizes **Plus Jakarta Sans** to bridge the gap between technical precision and friendly approachability. Its modern, geometric curves offer excellent legibility for both Korean and English scripts, which is essential for a health-tech context.

Headings are set with a Semi-Bold weight (600) to provide a clear information hierarchy, while body text uses a Regular weight (400) with increased line height to ensure readability for office workers who may be viewing the app in high-stress or low-light environments. Letter spacing is slightly tightened on larger headlines to maintain a premium, editorial feel.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile devices. It utilizes a 4-column system for handheld screens, expanding to 8 or 12 columns for tablet and desktop views.

- **Margins:** A generous 20px outer margin is used to give content "breathing room," reinforcing the premium and calm aesthetic.
- **Gutter:** A 16px gutter ensures distinct separation between cards and UI modules.
- **Rhythm:** Spacing follows a 4px base unit. Vertical rhythm is strictly managed through three "Stack" tokens (8px, 16px, 24px) to maintain consistency across different pages.
- **Reflow:** On tablet devices, cards should reflow into a two-column masonry layout rather than stretching full-width, preserving the "Personal Dashboard" feel.

## Elevation & Depth
Depth is communicated through **Ambient Shadows** and **Tonal Layers**. Instead of traditional high-contrast dropshadows, this design system uses soft, diffused shadows with a slight Deep Teal tint to make elements appear as though they are floating gently above the surface.

- **Surface Levels:** The background is `#F7F8F7`, while primary cards use `#FFFFFF`.
- **Card Shadows:** Use a 12px blur with 4% opacity of the Primary color to create a natural, organic lift.
- **Interactions:** When a card is pressed, it should subtly scale down (98%) and its shadow should decrease, simulating physical pressure and haptic feedback.

## Shapes
The shape language is defined by **Rounded** geometry to evoke friendliness and safety.

- **Standard Components:** Buttons, input fields, and small tags utilize a 0.5rem (8px) radius.
- **Container Elements:** Main content cards and bottom sheets use the `rounded-lg` (16px) or `rounded-xl` (24px) tokens to create a soft, protective frame around user data.
- **Iconography:** Icons should feature rounded terminals and consistent stroke weights to match the typeface.

## Components
- **Cards:** The central UI element. Pure white background, 16px corner radius, and ambient teal-tinted shadows. Internal padding should be a consistent 20px.
- **Buttons:**
    - *Primary:* Deep Teal background with White text.
    - *CTA:* Soft Coral background with White text, used exclusively for conversion points.
    - *Secondary:* Transparent background with a 1px Deep Teal border.
- **Input Fields:** Minimalist style with a light gray fill (#EDF0EF). Upon focus, the border transitions to a 1.5px Deep Teal stroke. Labels are always visible above the field in `label-md`.
- **Chips/Badges:** Used for health tags (e.g., "Keto", "Active"). Pill-shaped with a low-opacity tint of the primary color and dark text.
- **Lists:** Clean separation using subtle 1px dividers (#E0E5E4) rather than heavy boxes, maintaining the "Clean" brand pillar.
- **Progress Bars:** Thick, 8px rounded bars. The background track uses a light version of the primary color, while the active fill uses the solid Primary or Success green.
