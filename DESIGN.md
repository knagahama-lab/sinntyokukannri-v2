---
name: Enterprise Operations Platform
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002114'
  on-tertiary-container: '#069669'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embodies high-velocity operational command, precision engineering, and understated corporate authority. It targets technical operators, site reliability engineers, operations directors, and enterprise decision-makers who spend their workdays parsing dense data streams and executing critical workflows.

The visual style merges the refined, keyboard-first velocity of Linear with the structural precision of Stripe and the data rigor of Datadog. It rejects visual clutter, decorative gimmicks, and superficial gradients in favor of ultra-crisp typography, surgical line work, precise typographic scale, and structural layout clarity. The environment feels dependable, fast, and impeccably organized—delivering confidence under operational pressure.

## Colors

The system employs a dual-shell structural palette: a deep slate/navy container structure for peripheral command controls, paired with an elevated, crystalline light workspace for intensive data interaction.

- **Primary Command (`#0f172a` / `#1e293b`):** Deep Navy/Slate reserved for root navigation sidebars, terminal shells, dark modal headers, and primary solid buttons.
- **Action & Focus Blue (`#2563eb`):** Provides sharp, unambiguous interactive states, primary focus rings, selected table rows, and active tab indicators.
- **Status & Diagnostic System:**
  - *Success / Nominal (`#059669` text, `#ecfdf5` background, `#a7f3d0` border)*
  - *Warning / Degraded (`#d97706` text, `#fffbeb` background, `#fde68a` border)*
  - *Critical / Outage (`#e11d48` text, `#fff1f2` background, `#fecdd3` border)*
  - *Informational / In-Flight (`#0284c7` text, `#f0f9ff` background, `#bae6fd` border)*
  - *Neutral / Dormant (`#475569` text, `#f8fafc` background, `#e2e8f0` border)*
- **Neutrals & Canvas Structure:**
  - *App Background:* `#f8fafc`
  - *Surface White:* `#ffffff`
  - *Borders & Dividers:* `#e2e8f0` (Subtle) and `#cbd5e1` (Structural/Interactive)
  - *Text Hierarchy:* Heading & Data Value `#0f172a`, Secondary Body `#475569`, Muted Metadata `#64748b`.

## Typography

Typography is calibrated for maximum data density, rapid scan-efficiency, and cross-lingual internationalization (supporting Japanese via Noto Sans JP fallback pairing). 

- **Primary Matrix (Inter):** Leverages tabular figures (`tnum`) across all numeric displays to align metrics, monetary tallies, and operational percentages systematically. Line heights maintain a strict vertical rhythm without bloating card bounds.
- **Diagnostic Matrix (JetBrains Mono):** Applied exclusively to object identifiers, IP addresses, commit hashes, timestamps, and log feeds.
- **Casing & Weight:** Section headers and metric labels utilize uppercase captions with subtle letter-spacing for structural scanning. Headings never use ornamental serifs; weights are restricted to 400 (regular), 500 (medium), 600 (semibold), and 700 (bold).

## Layout & Spacing

The layout model is governed by a persistent enterprise shell combining a fixed-width dark navigation sidebar (64px collapsed, 240px expanded) with an adaptive, fluid application canvas. 

- **Grid Architecture:** Multi-column fluid grid system across 12 columns with a strict 16px gutter (`1rem`). On displays wider than 1920px, metric dashboards pin max content boundaries to 1720px while allowing data tables to utilize full canvas real estate.
- **Spacing Rhythm:** Built strictly on a 4px/8px modular base. Dense component layouts prioritize micro-increments (4px, 8px, 12px) to conserve vertical space and maximize the count of visible records above the fold.
- **Breakpoints:**
  - *Desktop Large (>1440px):* Full 12-column analytics multi-pane views.
  - *Desktop Standard (1024px - 1439px):* 8-column layout, secondary telemetry panels collapse into slide-out drawers.
  - *Tablet & Mobile (<1023px):* Navigation collapses to an overlay drawer; data grids switch from tabular multi-column views to horizontally scrolling or stacked card representations.

## Elevation & Depth

Visual hierarchy relies on structural borders and precise, ambient drop shadows rather than heavy elevation offsets. Surface separation is tactile, clean, and restrained.

- **Level 0 (App Canvas):** `#f8fafc` flat background.
- **Level 1 (Surface Cards & Panes):** `#ffffff` solid background, encased in an exact `1px solid #e2e8f0` stroke, paired with a diffused ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Level 2 (Hover States & Active Cards):** Border tint deepens to `#cbd5e1`; shadow elevates to `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Dropdown Menus & Popovers):** `#ffffff`, border `1px solid #cbd5e1`, shadow `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Command Palettes):** Backdrop overlay `#0f172a` at 40% opacity with 4px backdrop blur. Modal surface encased in `1px solid #e2e8f0`, shadow `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.

## Shapes

The design system maintains a sharp, disciplined shape geometry categorized at soft roundedness (`0.25rem` / 4px base). 

- **Micro Controls & Inputs:** Buttons, text fields, search boxes, and dropdown triggers carry a 4px (`0.25rem`) border radius, communicating mechanical precision.
- **Surfaces & Cards:** Dashboard panels, metric cards, and dialog containers use an 8px (`0.5rem`) border radius, preventing visual severity while preserving corporate structure.
- **Status Badges & Avatar Containers:** Status indicators and operational pills use full circular rounding (`9999px`) to create clear geometric contrast against rectilinear data blocks.

## Components

### Buttons
- **Primary:** Background `#0f172a`, text `#ffffff`, border `1px solid #0f172a`. Hover state `#1e293b`. Focus ring `2px #2563eb` with 2px offset.
- **Secondary:** Background `#ffffff`, text `#0f172a`, border `1px solid #e2e8f0`. Hover state `#f8fafc` with border `#cbd5e1`.
- **Destructive:** Background `#fff1f2`, text `#e11d48`, border `1px solid #fecdd3`. Hover state `#ffe4e6`.

### Data Tables
- **Container:** Wrapped in a Level 1 elevated white card with no outer overflow.
- **Header:** Height 36px, background `#f8fafc`, text `#64748b`, typography `caption` (uppercase, semibold, letter-spacing `0.05em`), border bottom `1px solid #e2e8f0`.
- **Rows:** Height 44px dense (or 52px comfortable), border bottom `1px solid #f1f5f9`. Zebra hover effect using `#f8fafc` on row pointer hover. Active/selected row highlighted with `#eff6ff` and a `2px solid #2563eb` left accent indicator.
- **Data Alignment:** Text columns left-aligned; numeric counters and currency right-aligned using tabular figures (`font-variant-numeric: tabular-nums`).

### Status Pills & Badges
- Inline compact tokens (height 20px, horizontal padding 8px, font size 11px, weight 600, radius `9999px`).
- Features a leading 6px pulsing or solid diagnostic dot:
  - *Live / Healthy:* Green (`#059669`) text on `#ecfdf5`.
  - *Warning:* Amber (`#d97706`) text on `#fffbeb`.
  - *Critical / Error:* Rose (`#e11d48`) text on `#fff1f2`.
  - *Deploying / Pending:* Sky (`#0284c7`) text on `#f0f9ff`.

### Input Fields & Search Bars
- Height 32px (compact) or 36px (standard). Background `#ffffff`, border `1px solid #e2e8f0`, placeholder `#94a3b8`, text `#0f172a`.
- Focus state: border `#2563eb`, box-shadow `0 0 0 1px #2563eb`. Global search features trailing keyboard shortcut badges (`⌘K`) in monospaced format.

### Checkboxes & Radio Controls
- Checkbox dimension 16x16px, radius 3px. Checked state `#2563eb` with crisp white checkmark SVG. Unchecked border `1px solid #cbd5e1`.

### Metrics & Stat Cards
- Layout: Top-row label (`body-sm`, `#64748b`) paired with top-right iconography or timeframe selector. Main value displayed at `headline-lg` (`#0f172a`, tabular). Bottom row features micro sparkline visual or directional percentage badge (`+12.4%` in emerald badge).

### Command Palette (Spotlight Modal)
- Centered modal dialog, width 640px, top offset 15% viewport. Features integrated search input with zero-latency filter list, grouped by "Actions", "Resources", and "Navigation", navigable entirely via keyboard up/down arrows.