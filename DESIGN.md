# UI Design Specification
## Risk Management Platform — R-143 Detail View

> Use this document as a reference to migrate your existing UI to match the target design shown in the screenshot.

---

## 1. Design Tokens

### Color Palette

```css
/* Primary / Brand */
--color-primary: #7C3AED;          /* purple — sidebar active bg */
--color-primary-dark: #5B21B6;

/* Accent Gradient (header risk score card) */
--gradient-risk: linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #EF4444 100%);

/* Background */
--color-bg-app: linear-gradient(160deg, #EDE9FE 0%, #FDF2F8 50%, #FEE2E2 100%);
--color-bg-card: #FFFFFF;
--color-bg-sidebar: #FFFFFF;

/* Text */
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;

/* Status / Semantic */
--color-status-in-progress: #8B5CF6;   /* purple dot */
--color-risk-very-high: #EF4444;       /* red */
--color-risk-high-badge: #FEF2F2;      /* light red bg for badge */
--color-risk-high-badge-text: #DC2626;

/* Dark card (vulnerability panel) */
--color-card-dark-bg: #111827;
--color-card-dark-text: #FFFFFF;

/* Residual risk card */
--color-residual-bg: #FFF1F2;          /* light pink */
--color-residual-dot: #F43F5E;

/* Borders */
--color-border: #E5E7EB;
--color-border-light: #F3F4F6;

/* Chart line */
--color-chart-line: #6366F1;           /* indigo/purple */
--color-chart-dot: #4F46E5;
```

### Typography

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
--text-xs:   12px / 1.4;
--text-sm:   13px / 1.5;
--text-base: 14px / 1.5;
--text-md:   16px / 1.5;
--text-lg:   18px / 1.4;
--text-xl:   20px / 1.3;
--text-2xl:  24px / 1.2;
--text-3xl:  28px / 1.2;  /* page title */

/* Weights */
--font-regular:   400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
```

### Spacing & Sizing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;

--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  16px;
--radius-xl:  20px;
--radius-full: 9999px;

--shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:   0 4px 12px rgba(0,0,0,0.10);
```

---

## 2. Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  TOPBAR (full width, white, h-14)                        │
├────────────┬─────────────────────────────────────────────┤
│            │  CONTENT AREA                               │
│  SIDEBAR   │  ┌─────────────────────────────────────┐   │
│  (240px)   │  │  Page Header (title + actions)      │   │
│            │  ├─────────────────────────────────────┤   │
│            │  │  Meta Cards Row                     │   │
│            │  ├─────────────────────────────────────┤   │
│            │  │  Tab Bar                             │   │
│            │  ├─────────────────────────────────────┤   │
│            │  │  Main Detail Body (2-col on large)  │   │
│            │  └─────────────────────────────────────┘   │
└────────────┴─────────────────────────────────────────────┘
```

- App background: gradient (`--color-bg-app`)
- Sidebar width: `240px` fixed, white bg, no border (subtle shadow or none)
- Content area: `flex-1`, `padding: 24px 32px`

---

## 3. Topbar

**Height:** 56px  
**Background:** White  
**Box shadow:** `0 1px 0 #E5E7EB` (bottom border only)

### Left — Logo
- Icon: stylized cube/box mark (brand purple), ~24px
- Label: `Platform` — `--text-lg`, `--font-semibold`, `#111827`

### Center — Breadcrumb
- Items: `Homepage / Risk Management / Risk Register / Details`
- Separator: `/` in `--color-text-muted`
- Inactive items: `--color-text-secondary`, `--text-sm`
- Active (last) item: `--color-text-primary`, `--font-medium`

### Right — Action Chips
Three pill-shaped chips, white background, `--color-border` border, `--radius-full`:

| Chip | Icon | Badge |
|------|------|-------|
| Notes | document icon | `7` (purple bg) |
| Tasks | checkmark icon | `5` (purple bg) |
| Bell  | bell icon | `2` (purple bg) |

Badge: `16px × 16px` circle, `#7C3AED` bg, white text, `--text-xs`.

---

## 4. Sidebar

**Width:** 240px  
**Background:** White  
**Padding:** `16px 12px`

### Logo Row (inside sidebar top if not in topbar)
If separate from topbar, same logo treatment.

### Navigation Items

Each item:
- Height: `40px`
- Padding: `0 12px`
- Border-radius: `--radius-md`
- Icon: 18px, left-aligned
- Label: `--text-sm`, `--font-medium`
- Default state: `color: #374151`, transparent bg
- Hover state: `bg: #F9FAFB`
- **Active state:** `bg: #111827` (near-black), `color: #FFFFFF`, icon white

**Nav items (top to bottom):**
1. Home
2. **Workspace** ← active
3. Risk Management (with chevron, expandable)
4. Compliance (expanded — shows sub-items indented)
   - Regulatory Requirements
   - Controls & Assessments
5. Initiatives Management (with chevron)
6. Governance (with chevron)
7. Audit Management (with chevron)
8. Issues and Exceptions (with chevron)
9. User's Management (with chevron)
10. Settings (with chevron)
11. Consultancy (with chevron)

Sub-items: `padding-left: 24px`, `color: --color-text-secondary`, no bg on hover (or very subtle).

### Bottom User Row
- Avatar: 32px circle, photo
- Name: `Mark Bennet`, `--text-sm`, `--font-medium`
- Theme toggle: sun/moon icon toggle pill (right-aligned)

---

## 5. Page Header

**Margin bottom:** `24px`

### Title Row
- Title: `R-143: Vendors Data Leak Due To Human Error`
- Font: `--text-3xl`, `--font-bold`, `--color-text-primary`

### Action Buttons (top-right)
Two icon-only buttons, white bg, border `--color-border`, `--radius-md`, `32px × 32px`:
- Print icon
- Download icon

---

## 6. Meta Cards Row

Four cards in a horizontal row (`display: grid; grid-template-columns: 1fr 1fr 1fr 1.5fr auto`).

**Default card style:**
- Background: White
- Border-radius: `--radius-lg`
- Padding: `16px 20px`
- Shadow: `--shadow-card`
- Label: `--text-xs`, `--color-text-muted`, uppercase or regular weight
- Value: `--text-md`, `--font-semibold`, `--color-text-primary`

| # | Label | Value | Notes |
|---|-------|-------|-------|
| 1 | Category | Operational | Standard card |
| 2 | Latest update | Dec 23, 2025 | Standard card |
| 3 | Status | • In Progress | Purple dot before text |
| 4 | Risk Score | Very High 5 | Special gradient card (see below) |
| 5 | — | — | Solid red square card (accent block) |

**Risk Score Card (card #4):**
- Background: `--gradient-risk`
- Text color: White
- Label: white, `--text-xs`
- Value: white, `--text-xl`, `--font-bold`
- Border-radius: `--radius-lg` left side, `0` right side (flows into card #5)

**Accent Block (card #5):**
- Width: ~48px
- Background: `#EF4444` (solid red) or continuation of gradient end color
- Border-radius: `0 --radius-lg --radius-lg 0`
- No content (decorative)

---

## 7. Tab Bar

Horizontal pill-style tabs. Active tab has a visible border/outline style.

```
[ Risk Profile ]  [ Tasks 5 ]  [ Key Indicators 2 ]  [ Issues 5 ]  [ Exceptions 6 ]        [ High Risk ]
```

**Tab item:**
- Padding: `6px 14px`
- Border-radius: `--radius-full`
- Font: `--text-sm`, `--font-medium`
- Default: border `1px solid --color-border`, bg white
- Active (Risk Profile): border `1.5px solid #111827`, bg white
- Badge number: inline, same text, separated by space or inside a small circle

**High Risk badge (right-aligned):**
- Background: `--color-risk-high-badge` (`#FEF2F2`)
- Text: `--color-risk-high-badge-text` (`#DC2626`)
- Border-radius: `--radius-full`
- Padding: `4px 12px`
- Font: `--text-sm`, `--font-semibold`

---

## 8. Main Detail Body

Two-column layout below the tab bar:

```
┌────────────────────────────────┬────────────────────┐
│  Left Column (flex-1)          │  Right Column      │
│  - Section heading             │  - Risk Source     │
│  - Description text            │  - Inherent Score  │
│  - Owners / Managers /         │  - Residual Score  │
│    Stakeholders row            │  - Methodology     │
└────────────────────────────────┴────────────────────┘
```

### Section Heading
- Text: `Departments: Cybersecurity`
- Font: `--text-xl`, `--font-bold`
- Margin bottom: `12px`

### Description Label + Text
- Label: `Description`, `--text-xs`, `--color-text-muted`
- Body: `--text-sm`, `--color-text-secondary`, line-height 1.6
- Truncated with `...` at bottom (overflow fade or ellipsis)

### People Row (Owners / Managers / Stakeholders)
Three sub-columns side by side.

**Label:** `--text-xs`, `--color-text-muted` (e.g. "Owners")  
**Avatar stack:**
- Avatar size: `28px` circle
- Overlap: `-8px` margin-left on each after first
- Overflow count badge: `+N` circle, `--color-border` bg, `--text-xs`, same size

### Right Column Cards

**Risk Source Card:**
- White bg, `--radius-md`, padding `14px 16px`
- Label: `Risk Source`, `--text-xs`, muted
- Value: `General`, `--text-md`, `--font-semibold`

**Inherent Risk Score Card:**
- Same as above
- Value: `20`
- Indicator dot: top-right corner, small `8px` circle, `#6366F1` (indigo)

**Residual Risk Score Card:**
- Background: `--color-residual-bg` (`#FFF1F2`)
- Indicator dot: `#F43F5E` (rose)
- Value: `5`

**Risk Methodology Card:**
- White bg
- Label: `Risk methodology`
- Value: `Risk Management`

---

## 9. Bottom Row

Two cards side by side:

### Vulnerability Card (Dark)
- Background: `--color-card-dark-bg` (`#111827`)
- Border-radius: `--radius-lg`
- Padding: `20px`
- Label: `Vulnerability`, `--text-xs`, `#9CA3AF`
- Title: `Vendors Data Encryption Attack`, white, `--text-md`, `--font-semibold`
- Row — `Priority` label (gray) + value chip `5` (dark pill, white text)
- Row — `Threat` label (gray) + value `8` (same chip style)

Value chip: `32px × 32px` circle or rounded square, `#374151` bg, white text, `--text-sm`, `--font-semibold`.

### Incident Frequency Card
- White bg, `--radius-lg`
- Header row: title `Incident Frequency` (left) + time-toggle `12 months / 30 days / 1 week` (right)
- **Active toggle pill:** `30 days` — `#111827` bg, white text, `--radius-full`, `--text-sm`
- Inactive toggles: plain text, `--color-text-muted`

**Chart:**
- Type: smooth line chart (spline/bezier)
- Line color: `--color-chart-line` (`#6366F1`)
- Fill: subtle gradient fill below line, same color at ~10% opacity
- End dot: filled circle `10px`, `--color-chart-dot`
- No axis labels visible (clean/minimal)
- No grid lines, or very subtle light gray

---

## 10. Component Reference Summary

| Component | Bg | Radius | Shadow |
|-----------|-----|--------|--------|
| Sidebar | White | — | none |
| Topbar | White | — | bottom border |
| Meta card | White | 16px | card shadow |
| Risk score card | Purple→Red gradient | 16px L, 0 R | card shadow |
| Tab | White | full | none |
| Section card | White | 10px | card shadow |
| Residual card | Rose-50 | 10px | card shadow |
| Dark card | #111827 | 16px | md shadow |
| Chart card | White | 16px | card shadow |
| Avatar | Photo | full | 0 0 0 2px white |

---

## 11. Responsive Notes

- Sidebar collapses to icon-only at `< 1024px`
- Meta cards row wraps to 2×2 at `< 768px`
- Main body columns stack vertically at `< 768px`
- Bottom row stacks at `< 640px`

---

## 12. Animation / Interaction

- Sidebar items: `transition: background 150ms ease`
- Tab switching: `transition: border-color 150ms ease`
- Cards on hover: `box-shadow` slightly elevated (`--shadow-md`)
- Avatar stack: top avatar has `z-index` escalation
- Chart: animate line draw on mount (`stroke-dashoffset` animation, `800ms ease-out`)
