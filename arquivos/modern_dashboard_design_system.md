# Modern Data Dashboard -- Design System

## Overview

This design system defines the visual language, components, and
interaction patterns for a modern data analytics dashboard with a **dark
tech aesthetic**, **violet-to-black gradient**, and **glassmorphism
UI**.

The goal is to create an interface that feels:

-   Modern
-   Technological
-   Fluid
-   Interactive
-   Professional (SaaS-style analytics UI)

Inspired by modern design patterns used in products from companies like
Stripe and Vercel.

------------------------------------------------------------------------

# 1. Visual Identity

### Style

Dark Tech + Glassmorphism + Neon Data Visualization

### Visual Concept

    dark background
    +
    violet gradient
    +
    glass cards
    +
    neon data lines

The interface should feel futuristic but still minimal and readable.

------------------------------------------------------------------------

# 2. Color System

## Background Gradient

Primary background gradient:

    #6C3BFF → #2E1A47 → #0B0B0F

Example CSS:

``` css
background: linear-gradient(
180deg,
#6C3BFF 0%,
#2E1A47 40%,
#0B0B0F 100%
);
```

------------------------------------------------------------------------

## Surface Colors (Glassmorphism)

Cards and containers should use a translucent glass style.

    background: rgba(255,255,255,0.05)
    border: rgba(255,255,255,0.1)
    shadow: rgba(0,0,0,0.5)
    blur: 16px–20px

Example:

``` css
background: rgba(255,255,255,0.05);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 18px;
```

------------------------------------------------------------------------

## Data Visualization Colors

  Dataset    Color
  ---------- ---------
  Gasoline   #8B5CF6
  Ethanol    #3B82F6
  Diesel     #EC4899

These colors should appear as **neon-style lines** in charts.

------------------------------------------------------------------------

## Neutral Colors

Primary Text

    #F3F4F6

Secondary Text

    #9CA3AF

Dividers

    #2A2A31

------------------------------------------------------------------------

# 3. Typography

Recommended fonts:

-   Inter
-   Sora
-   Space Grotesk

## Typography Scale

  Element           Size
  ----------------- -------------
  Dashboard Title   36px
  Section Title     24px
  Body Text         15px
  Metric Numbers    42px (bold)

Metric numbers should be large and visually dominant.

------------------------------------------------------------------------

# 4. Glassmorphism Components

## Metric Cards

Metric cards display important KPIs.

Example:

    ╔════════════════════╗
       ⛽ Gasoline

       R$ 5.62
       ↑ 4.2%
    ╚════════════════════╝

Card properties:

-   border-radius: 18px
-   padding: 24px
-   backdrop blur: 16px

Hover interaction:

-   scale: 1.03
-   violet glow
-   smooth transition (200ms)

------------------------------------------------------------------------

## Chart Cards

Charts live inside larger glass containers.

Properties:

    border-radius: 20px
    padding: 32px
    background: rgba(255,255,255,0.04)
    backdrop blur: 20px

------------------------------------------------------------------------

# 5. Chart Design System

Charts should feel **neon, modern, and interactive**.

Line properties:

    stroke-width: 3
    soft glow
    smooth curves

Example series:

    Gasoline ─ violet
    Ethanol  ─ blue
    Diesel   ─ pink

Point styling:

    radius: 4px
    hover radius: 7px

------------------------------------------------------------------------

# 6. Layout System

Example dashboard wireframe:

    ┌─────────────────────────────────────┐
    │              NAVBAR                 │
    │     Fuel Analytics Dashboard        │
    └─────────────────────────────────────┘

    ┌────────────┬────────────┬───────────┐
    │ Gasoline   │  Ethanol   │ Diesel    │
    │   Card     │   Card     │   Card    │
    └────────────┴────────────┴───────────┘

    ┌─────────────────────────────────────┐
    │         MAIN LINE CHART             │
    │   Fuel price evolution over time    │
    └─────────────────────────────────────┘

    ┌──────────────┬──────────────────────┐
    │ inflation    │ ethanol vs gasoline  │
    │ chart        │ chart                │
    └──────────────┴──────────────────────┘

Spacing should be generous to maintain a clean UI.

------------------------------------------------------------------------

# 7. Animation System

Animations should be subtle and smooth.

## 1. Grow From Center

Containers appear from the center of the screen.

    scale(0.2) → scale(1)
    opacity 0 → 1
    duration 600–900ms

------------------------------------------------------------------------

## 2. Progressive Reveal

Chart elements appear in stages.

Sequence:

    axes
    ↓
    points
    ↓
    line draw animation

------------------------------------------------------------------------

## 3. Count-Up Animation

Metric numbers animate from zero.

Example:

    0 → 5.62

Duration:

    800ms–1200ms

------------------------------------------------------------------------

## 4. Chart Morphing (Filter Transition)

When filters change:

Old dataset → new dataset should **animate smoothly**.

Points move to their new positions instead of disappearing.

------------------------------------------------------------------------

## 5. Data Highlight Interaction

When hovering a line:

    active line → highlight
    other lines → fade (30–40% opacity)
    points → slightly larger
    tooltip appears

------------------------------------------------------------------------

# 8. Background Visual Effects

Add subtle depth using blurred gradient shapes.

Example:

    violet blur orb
    blue blur orb

These should sit behind the dashboard elements with high blur.

------------------------------------------------------------------------

# 9. Microinteractions

Hover on cards:

    scale 1.03
    violet glow
    soft shadow

Filter changes:

    smooth data transition
    no sudden redraw

Buttons:

    soft glow
    slight lift animation

------------------------------------------------------------------------

# 10. UX Principles

The dashboard should communicate:

-   clarity
-   speed
-   technological sophistication
-   smooth interaction

Animations should **enhance the experience**, not distract from the
data.

------------------------------------------------------------------------

# Final Result

A highly interactive **modern analytics dashboard** with:

-   violet-to-black gradient background
-   glassmorphism components
-   neon data visualizations
-   smooth microinteractions
-   fluid chart animations
