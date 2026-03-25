# PharmaCare Color System - Visual Style Guide

## Overview

This document outlines the color system for PharmaCare, ensuring consistent use of colors across all pages and components. All colors are defined as CSS custom properties in `src/index.css` and use HSL format.

## Color Palette

### Light Theme

| Variable                 | HSL Value     | Hex Equivalent | Usage                           |
| ------------------------ | ------------- | -------------- | ------------------------------- |
| `--background`           | `0 0% 98%`    | `#f9f9f9`      | Page background                 |
| `--foreground`           | `0 0% 13%`    | `#202020`      | Primary text                    |
| `--primary`              | `15 23% 32%`  | `#644a40`      | Primary buttons, links, accents |
| `--primary-foreground`   | `0 0% 100%`   | `#ffffff`      | Text on primary buttons         |
| `--secondary`            | `33 100% 85%` | `#ffdfb5`      | Secondary elements, highlights  |
| `--secondary-foreground` | `15 52% 23%`  | `#582d1d`      | Text on secondary elements      |
| `--muted`                | `0 0% 94%`    | `#efefef`      | Muted backgrounds               |
| `--muted-foreground`     | `0 0% 39%`    | `#646464`      | Secondary/muted text            |
| `--accent`               | `0 0% 91%`    | `#e8e8e8`      | Accent backgrounds              |
| `--accent-foreground`    | `0 0% 13%`    | `#202020`      | Text on accent backgrounds      |
| `--card`                 | `0 0% 99%`    | `#fcfcfc`      | Card backgrounds                |
| `--card-foreground`      | `0 0% 13%`    | `#202020`      | Text on cards                   |
| `--border`               | `0 0% 85%`    | `#d8d8d8`      | Borders                         |
| `--input`                | `0 0% 85%`    | `#d8d8d8`      | Input backgrounds               |
| `--ring`                 | `15 23% 32%`  | `#644a40`      | Focus rings                     |
| `--destructive`          | `11 79% 54%`  | `#e54d2e`      | Error/destructive actions       |

### Dark Theme

| Variable                 | HSL Value     | Hex Equivalent | Usage                           |
| ------------------------ | ------------- | -------------- | ------------------------------- |
| `--background`           | `0 0% 7%`     | `#111111`      | Page background                 |
| `--foreground`           | `0 0% 93%`    | `#eeeeee`      | Primary text                    |
| `--primary`              | `33 100% 88%` | `#ffe0c2`      | Primary buttons, links, accents |
| `--primary-foreground`   | `183 57% 7%`  | `#081a1b`      | Text on primary buttons         |
| `--secondary`            | `25 21% 19%`  | `#393028`      | Secondary elements              |
| `--secondary-foreground` | `33 100% 88%` | `#ffe0c2`      | Text on secondary elements      |
| `--muted`                | `0 0% 13%`    | `#222222`      | Muted backgrounds               |
| `--muted-foreground`     | `0 0% 71%`    | `#b4b4b4`      | Secondary/muted text            |
| `--accent`               | `0 0% 16%`    | `#2a2a2a`      | Accent backgrounds              |
| `--accent-foreground`    | `0 0% 93%`    | `#eeeeee`      | Text on accent backgrounds      |
| `--card`                 | `0 0% 10%`    | `#191919`      | Card backgrounds                |
| `--card-foreground`      | `0 0% 93%`    | `#eeeeee`      | Text on cards                   |
| `--border`               | `30 8% 11%`   | `#201e18`      | Borders                         |
| `--input`                | `0 0% 28%`    | `#484848`      | Input backgrounds               |
| `--ring`                 | `33 100% 88%` | `#ffe0c2`      | Focus rings                     |
| `--destructive`          | `11 79% 54%`  | `#e54d2e`      | Error/destructive actions       |

## Tailwind CSS Classes

Use these Tailwind classes to apply the color system:

### Text Colors

| Tailwind Class              | CSS Variable             | Light Theme | Dark Theme |
| --------------------------- | ------------------------ | ----------- | ---------- |
| `text-foreground`           | `--foreground`           | `#202020`   | `#eeeeee`  |
| `text-muted-foreground`     | `--muted-foreground`     | `#646464`   | `#b4b4b4`  |
| `text-primary`              | `--primary`              | `#644a40`   | `#ffe0c2`  |
| `text-primary-foreground`   | `--primary-foreground`   | `#ffffff`   | `#081a1b`  |
| `text-secondary-foreground` | `--secondary-foreground` | `#582d1d`   | `#ffe0c2`  |
| `text-destructive`          | `--destructive`          | `#e54d2e`   | `#e54d2e`  |

### Background Colors

| Tailwind Class   | CSS Variable    | Light Theme | Dark Theme |
| ---------------- | --------------- | ----------- | ---------- |
| `bg-background`  | `--background`  | `#f9f9f9`   | `#111111`  |
| `bg-foreground`  | `--foreground`  | `#202020`   | `#eeeeee`  |
| `bg-muted`       | `--muted`       | `#efefef`   | `#222222`  |
| `bg-accent`      | `--accent`      | `#e8e8e8`   | `#2a2a2a`  |
| `bg-primary`     | `--primary`     | `#644a40`   | `#ffe0c2`  |
| `bg-secondary`   | `--secondary`   | `#ffdfb5`   | `#393028`  |
| `bg-card`        | `--card`        | `#fcfcfc`   | `#191919`  |
| `bg-destructive` | `--destructive` | `#e54d2e`   | `#e54d2e`  |

### Border Colors

| Tailwind Class   | CSS Variable | Light Theme | Dark Theme |
| ---------------- | ------------ | ----------- | ---------- |
| `border-border`  | `--border`   | `#d8d8d8`   | `#201e18`  |
| `border-input`   | `--input`    | `#d8d8d8`   | `#484848`  |
| `border-primary` | `--primary`  | `#644a40`   | `#ffe0c2`  |

### Focus Rings

| Tailwind Class       | CSS Variable | Usage                    |
| -------------------- | ------------ | ------------------------ |
| `focus:ring-primary` | `--ring`     | Primary color focus ring |

## Usage Examples

### Buttons

```tsx
// Primary Button
<Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
  Primary Action
</Button>

// Secondary Button
<Button variant='secondary' className='bg-secondary text-secondary-foreground'>
  Secondary Action
</Button>

// Outline Button
<Button variant='outline' className='border-input'>
  Outline Button
</Button>

// Ghost Button
<Button variant='ghost' className='text-foreground hover:bg-muted'>
  Ghost Button
</Button>
```

### Form Inputs

```tsx
// Text Input
<Input
  className='bg-card border-input focus:border-primary focus:ring-primary/10'
  placeholder='Enter text'
/>

// Label
<Label className='text-muted-foreground'>Label Text</Label>
```

### Cards

```tsx
// Card Container
<Card className='bg-card border-border'>
  <CardHeader>
    <CardTitle className='text-foreground'>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className='text-muted-foreground'>Card content text</p>
  </CardContent>
</Card>
```

### Typography

```tsx
// Headings
<h1 className='text-foreground font-display'>Heading 1</h1>
<h2 className='text-foreground font-display'>Heading 2</h2>

// Body Text
<p className='text-foreground'>Primary text content</p>
<p className='text-muted-foreground'>Secondary/muted text</p>
```

## Color Combinations

### Recommended Combinations

| Use Case       | Text Color                | Background Color | Contrast Ratio             |
| -------------- | ------------------------- | ---------------- | -------------------------- |
| Primary Text   | `text-foreground`         | `bg-background`  | 15:1 (Light) / 16:1 (Dark) |
| Secondary Text | `text-muted-foreground`   | `bg-background`  | 7:1 (Light) / 11:1 (Dark)  |
| Primary Button | `text-primary-foreground` | `bg-primary`     | 9:1 (Light) / 12:1 (Dark)  |
| Card Content   | `text-card-foreground`    | `bg-card`        | 15:1 (Light) / 16:1 (Dark) |

### Avoid These Combinations

- ❌ `text-foreground` on `bg-primary` (poor contrast)
- ❌ `text-muted-foreground` on `bg-muted` (poor contrast)
- ❌ Using hardcoded colors like `text-slate-900`, `bg-slate-50`, etc.

## Migration Guide

When updating components to use the color system:

1. **Replace hardcoded slate colors:**
   - `text-slate-900` → `text-foreground`
   - `text-slate-500` → `text-muted-foreground`
   - `bg-slate-50` → `bg-muted`
   - `bg-white` → `bg-card`
   - `border-slate-200` → `border-input`

2. **Use semantic color names:**
   - Instead of `text-slate-700`, consider if it should be `text-foreground` or `text-muted-foreground`
   - Instead of `bg-slate-100`, consider if it should be `bg-muted` or `bg-accent`

3. **Test both themes:**
   - Always verify colors work in both light and dark modes
   - Check contrast ratios meet WCAG AA standards (4.5:1 for text)

## Design Principles

1. **Consistency**: Use CSS variables for all colors - never hardcode hex values
2. **Accessibility**: Ensure minimum 4.5:1 contrast ratio for text
3. **Semantic Naming**: Use `primary`, `secondary`, `muted`, `accent` for semantic meaning
4. **Theme Compatibility**: Test all colors in both light and dark themes
5. **No Glowing Effects**: Avoid neon, glowing, or overly saturated colors

## Future Pages

When creating new pages or components:

1. Import the color system by using Tailwind's utility classes
2. Never use hardcoded colors like `slate-*`, `blue-*`, `green-*`, etc.
3. Use the semantic color classes provided above
4. Test in both light and dark themes
5. Ensure text readability meets WCAG AA standards

## File Structure

```
src/
├── index.css              # CSS variables and theme definitions
├── tailwind.config.js     # Tailwind color mappings
└── components/           # Components use CSS variables via Tailwind classes
```

## Contact

For questions about the color system, refer to the design team.
