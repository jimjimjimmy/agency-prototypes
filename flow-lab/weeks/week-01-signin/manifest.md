# Week 1 sign-in: parameter manifest

Build: four standalone HTML flows in `builds/`, one hypothesis each. Mobile only, checked at 375 x 812. Copy is staple. original test copy (Jimmy, 2026-10-25: test copy closes Week 1, copy approval at G0). Images are the four approved staple. product shots in `builds/assets/`.

## Colors (staple. tokens, Material 3, light and dark)
| Use | Token |
|---|---|
| Page background, sheets | `--surface` |
| Body text | `--on-surface` |
| Secondary text, labels, hypothesis tag, field border | `--on-surface-variant` |
| Row dividers | `--surface-variant` |
| Primary action, wordmark period, text buttons, focus ring | `--primary` / `--on-primary` |
| Secondary action | `--secondary-container` / `--on-secondary-container` |
| Order state (progress only) | `--tertiary` |
| Field error border and message | `--error` |
| Failure banner | `--error-container` / `--on-error-container` |
| Spinner | `--primary` on `--primary-container` |
| Bottom-sheet backdrop | `--scrim` |

## Typography
| Role | Family | Size / line height | Weight |
|---|---|---|---|
| Wordmark | Inter Tight, -0.04em | 24 / 32 | 600 |
| Screen title (h1) | Inter Tight | 28 / 36 | 600 |
| Sheet title (h2) | Inter Tight | 22 / 28 | 500 |
| Body, buttons, rows | Inter | 16 / 24 | 400, buttons 500 |
| Labels, errors, banner | Inter | 14 / 20 | 500 / 400 |
| Hypothesis tag | Inter, uppercase, 0.04em | 12 / 16 | 500 |

## Spacing (4px grid)
Page padding 24 top, 16 sides. Gap between blocks 16. Label to field 4. Sheet padding 24 / 16 / 32, gap 12. Row padding 12. Field padding 16 (15 with the 2px error border, so text does not shift). Focus ring 2px, offset 2px. Spinner 28px with a 4px border.

Fonts: Inter and Inter Tight load from Google Fonts (one third-party request); system-ui is the fallback.

## Components
Filled button, tonal button, text button (all 48px min height, full width, pill radius). Outlined text field (56px min height, 12px radius). Error banner (12px radius). Bottom sheet (28px top radius). Order rows. Square product image (12px radius). Spinner.

## States, per flow
| Flow | Success | Failure | Reset |
|---|---|---|---|
| 1 Passkey-first | passkey or password to order status | passkey canceled (banner); empty password (field error) | Start over; Use passkey instead |
| 2 Guest order status | email link to order status | empty email; bad email format (field errors) | Use a different email; Start over |
| 3 Social over OTP | Google or Apple, or emailed code, to order status | social sign-in canceled (banner); empty or bad email, code not 6 digits (field errors) | Send a new code; Use a different email; Back to sign-in options; Start over |
| 4 OTP auto-read | texted code, filled from Messages, to order status | empty or short number; code not 6 digits (field errors) | Not now; Use a different number; Start over |

## Interactions
Screens switch in place. Focus moves to the new screen title. Pending timers (social connect, incoming text) are canceled on Cancel, Verify, Start over, and Use a different number; the incoming-text sheet only opens while the code screen is showing and the code field is empty. Spinner stops under reduced motion.

## Bottom sheets (modal)
`role="dialog"`, `aria-modal="true"`, titled by their h2. While a sheet is open the rest of the page is `inert`, so focus stays in the sheet. Focus moves to the sheet's first button on open, and back to the control that opened it on close (or to the code field after a code is used, or to the screen title if that control is gone). Escape does what the sheet's dismiss button does: Cancel on the passkey and connecting sheets, Not now on the Messages sheet. Every sheet has a visible dismiss button.

## Accessibility
Every field has a visible label, `aria-describedby` to its error, and `aria-invalid` on error. Error and banner regions use `role="alert"` and stay rendered while empty, so announcements are not skipped. Visible 2px focus ring on all controls. Tap targets 48px or more. Contrast from the staple. M3 tones. Input types and autocomplete set: `current-password`, `email`, `one-time-code`, `tel-national`.
