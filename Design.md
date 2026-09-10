# Design Tokens — Authentication Flow

Source of truth for the auth UI. Extracted from the Figma "New project" page (file: `New project`, page: `New project`). Visual language references [reading-journal-app.netlify.app/forgot-password](https://reading-journal-app.netlify.app/forgot-password): cream page background, white card, dark-green pill buttons, soft warm-gray borders.

**Rule for implementation: use only the tokens below. No hardcoded hex codes, spacing, or radii outside this list.**

## Color

| Token | Value | Usage |
|---|---|---|
| `color-bg-page` | `#F7F3EC` | Page background behind the auth card |
| `color-surface` | `#FFFFFF` | Card background |
| `color-text-primary` | `#252525` | Headings, filled input text, primary body text |
| `color-text-secondary` | `#6B6B6B` | Subtitles, placeholder text |
| `color-border-default` | `#D8D1C7` | Default input/button border |
| `color-border-focus` | `#29483F` | Input border on focus |
| `color-brand-primary` | `#3F3D9E` | Primary button fill, links |
| `color-brand-primary-hover` | `#32317E` | Primary button hover fill |
| `color-on-brand` | `#FFFFFF` | Text/icons on brand-primary fill |
| `color-error` | `#DC2626` | Error text, error border |
| `color-error-bg` | `#FEF2F2` | Error banner background |
| `color-success` | `#16A34A` | Met password requirement (✓) |
| `color-unmet` | `#A3A3A3` | Unmet password requirement (ⓧ) |

## Spacing

| Token | Value (px) |
|---|---|
| `space-xs` | 4 |
| `space-sm` | 8 |
| `space-md` | 12 |
| `space-base` | 16 |
| `space-lg` | 20 |
| `space-xl` | 24 |
| `space-xxl` | 32 |
| `space-xxxl` | 40 |

## Radius

| Token | Value (px) | Usage |
|---|---|---|
| `radius-input` | 10 | Text fields, password fields |
| `radius-card` | 20 | Auth card container |
| `radius-button` | 999 (pill) | Primary/secondary buttons |

## Typography

Font family: **Inter** (fallback: `system-ui, sans-serif`).

| Style | Weight | Size / Line-height | Usage |
|---|---|---|---|
| `text-h1` | Semi Bold (600) | 26px / 34px | Screen titles ("Create Account", "Log in", …) |
| `text-subtitle` | Regular (400) | 14px / 20px | Subtitle under a title |
| `text-label` | Medium (500) | 13px / 18px | Field labels |
| `text-body` | Regular (400) | 14px / 20px | Input values, body copy |
| `text-caption` | Regular (400) | 12px / 16px | Helper/error text, password requirement rows |
| `text-button-label` | Semi Bold (600) | 15px / 20px | Button labels |
| `text-link` | Medium (500) | 14px / 20px | Inline text links |

## Component states

- **Input / Password field**: `Default` (border `color-border-default`), `Focus` (border `color-border-focus`, 1.5px), `Filled` (text `color-text-primary`), `Error` (border + helper text `color-error`).
- **Button**: `Primary` (fill `color-brand-primary`, text `color-on-brand`, pill radius), `Secondary` (white fill, `color-border-default` stroke, text `color-text-primary`).
- **Password requirement row**: unmet → `ⓧ` in `color-unmet`; met → `✓` in `color-success`. Updates live while typing (implemented in code, not as separate design states).
- **Footer link pattern**: a muted prompt (`text-link` size, `color-text-secondary`) followed by a bold, underlined action in `color-brand-primary` (e.g. "Already have an account? **Log in**"). Used consistently across Create Account, Login, Forgot Password, and Check your email.
- **First Name / Last Name validation**: only Latin letters are accepted. Non-Latin input shows the error "Use Latin letters" (in addition to the existing "This field is required" empty-state error).

## Card layout

- Card width: 440px, padding 40px, corner radius `radius-card`, background `color-surface`, subtle shadow (`0 4px 24px rgba(0,0,0,0.06)`).
- Card is centered on a full-viewport `color-bg-page` background.
- Vertical rhythm inside the card: 20px gap between elements.
