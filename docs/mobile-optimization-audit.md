# Comprehensive Mobile Optimization Audit

**Stack:** Next.js 15 + TypeScript + Tailwind CSS  
**Audit date:** Evidence from codebase scan (no runtime testing).  
**Items that cannot be verified statically are marked "Needs confirmation".**

---

## 1. Device coverage model

| Class            | Width range   | Notes |
|------------------|---------------|--------|
| Mobile Small     | 320px – 375px | Public nav and some tables likely break (see below). |
| Mobile Standard  | 375px – 430px | Same risks; button/icon sizes may be tight. |
| Mobile Large     | 430px – 480px | Generally better; tables and nav still at risk. |
| Tablet           | 768px – 1024px| Sidebars and grids use `lg:`; layout should hold. |
| Laptop           | 1024px – 1440px| Target; no issues identified. |
| Large Desktop    | 1440px+       | No issues identified. |

---

## 2. Mobile layout issues

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/landing/PublicNav.tsx](src/components/landing/PublicNav.tsx) | PublicNav | All links (Browse APIs, Pricing, Docs, Theme, Login, Sign Up) in a single row with no hamburger or collapse. On 320–375px this will overflow or wrap poorly. | **High** | Add a hamburger menu for `md:` or `sm:` down; show logo + menu icon; put links in Sheet or dropdown. |
| [src/components/landing/Comparison.tsx](src/components/landing/Comparison.tsx) | Comparison table | `min-w-[800px]` on table; wrapper has `overflow-x-auto`. Horizontal scroll on small viewports; no card/stacked mobile variant. | **Medium** | Keep overflow-x-auto; consider a stacked/card layout for `sm:` or `md:` breakpoints. |
| [src/components/marketplace/ComparisonTable.tsx](src/components/marketplace/ComparisonTable.tsx) | ComparisonTable | Table `min-w-[600px]`; wrapper has `overflow-x-auto`. Same as above. | **Medium** | Same as above; optional card layout for mobile. |
| [src/components/landing/TechShowcase.tsx](src/components/landing/TechShowcase.tsx) | TechShowcase | `min-w-[140px]` on carousel cards + `shrink-0`; horizontal scroll. Acceptable if scroll is obvious. | **Low** | Ensure scroll hint (e.g. fade or “scroll”) on small screens. |
| [src/components/features/notifications/NotificationCenter.tsx](src/components/features/notifications/NotificationCenter.tsx) | Dropdown content | `w-[380px]` on dropdown; on 320px width may feel tight or overflow. | **Low** | Use `max-w-[min(380px,100vw-2rem)]` or similar so it doesn’t exceed viewport. |
| [src/components/marketplace/MarketplaceContent.tsx](src/components/marketplace/MarketplaceContent.tsx) | Filter sidebar | Sidebar `hidden lg:block`; filters are hidden below `lg`. **Needs confirmation:** Is there a mobile filter UI (drawer/sheet)? | **Medium** | If no mobile filter UI, add a “Filters” button that opens a Sheet with FilterSidebar content. |
| [src/components/landing/ValueProposition.tsx](src/components/landing/ValueProposition.tsx) | Sticky CTA | `sticky top-16` bar; on short viewports could consume a lot of vertical space. | **Low** | Consider `top-4` or hiding sticky on very small height (e.g. `max-h-[100dvh]`). |
| [src/components/dashboard/DashboardSidebar.tsx](src/components/dashboard/DashboardSidebar.tsx) | Sidebar | `min-h-[calc(100vh-4rem)]`; uses `100vh` (see device-specific risks). | **Low** | Prefer `100dvh` or `min-h-screen` with safe-area if needed. |
| [src/app/dashboard/developer/playground/page.tsx](src/app/dashboard/developer/playground/page.tsx) | Playground card | `h-[calc(100vh-12rem)]`; fixed height can be too tall on short viewports. | **Low** | Use `min-h` or `max-h-[...]` so content can shrink on small screens. |

---

## 3. Touch interaction issues

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/ui/button.tsx](src/components/ui/button.tsx) | Button sizes | `sm`: h-8 (32px); `icon`: h-9 w-9 (36px). Below 44px minimum touch target. | **Medium** | Ensure primary actions use `size="default"` (h-9) or `lg`; add `min-h-[44px] min-w-[44px]` for icon buttons on touch (e.g. via media or touch detection). |
| [src/components/dashboard/DashboardNav.tsx](src/components/dashboard/DashboardNav.tsx) | Menu trigger | Sheet trigger uses `size="icon"` (h-9 w-9). Slightly under 44px. | **Low** | Use a larger tap area (e.g. p-3) or `min-w-[44px] min-h-[44px]` for the menu button. |
| [src/components/dashboard/FloatingQuickActions.tsx](src/components/dashboard/FloatingQuickActions.tsx) | FAB | Fixed bottom-right; button sizes not audited. **Needs confirmation:** Tap target ≥ 44px. | **Low** | Verify FAB and child buttons are ≥ 44px; add padding if not. |
| [src/components/marketplace/CompareButton.tsx](src/components/marketplace/CompareButton.tsx) | CompareButton | **Needs confirmation:** Tap target and spacing from other elements. | **Low** | Ensure ≥ 44px and adequate spacing. |
| Dropdowns / hover | Various | DropdownMenuTrigger and hover-only states (e.g. KillerFeatures, TechShowcase “group-hover”) may be awkward on touch. | **Low** | Ensure dropdowns open on tap; consider tap-to-toggle for hover-only cards. |

---

## 4. Navigation problems

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/landing/PublicNav.tsx](src/components/landing/PublicNav.tsx) | Public nav | No hamburger; links in one row overflow on mobile (see Layout). | **High** | Add mobile menu (Sheet or off-canvas) and hamburger for small breakpoints. |
| [src/components/dashboard/DashboardNav.tsx](src/components/dashboard/DashboardNav.tsx) | Dashboard nav | Has Sheet + Menu (hamburger) for `lg:hidden`; sidebar in Sheet. Good. | **OK** | — |
| [src/components/landing/PublicNav.tsx](src/components/landing/PublicNav.tsx) | Header | `fixed top-0`; no safe-area padding. **Needs confirmation:** Notch/dynamic island overlap. | **Medium** | Add `pt-[env(safe-area-inset-top)]` to nav or body. |
| [src/components/dashboard/DashboardNav.tsx](src/components/dashboard/DashboardNav.tsx) | Sticky header | `sticky top-0`; height h-16. Could cover anchor targets. | **Low** | Ensure anchor links (e.g. docs) use scroll-margin-top to account for header. |
| [src/components/marketplace/MarketplaceTopBar.tsx](src/components/marketplace/MarketplaceTopBar.tsx) | Marketplace bar | `sticky top-0`; same as above. | **Low** | Same scroll-margin-top for in-page anchors. |

---

## 5. Forms and input issues

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| Various | Input types | email, tel, number used where appropriate (Footer, ContactForm, ContactQuiz, login, signup, profile, audit, FilterSidebar, phone-input). | **OK** | — |
| [src/components/landing/Footer.tsx](src/components/landing/Footer.tsx) | Newsletter | `type="email"`; no explicit `inputmode` or `autocomplete`. | **Low** | Add `inputMode="email"` and `autoComplete="email"` for better mobile keyboards. |
| [src/app/(public)/contact/ContactForm.tsx](src/app/(public)/contact/ContactForm.tsx) | ContactForm | **Needs confirmation:** Input font size; iOS zooms if &lt; 16px. | **Medium** | Ensure inputs use at least 16px (e.g. text-base) to avoid iOS zoom on focus. |
| [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) | Login | Same as above. | **Medium** | Same. |
| [src/app/(auth)/signup/page.tsx](src/app/(auth)/signup/page.tsx) | Signup | Same as above. | **Medium** | Same. |
| General | Validation messages | **Needs confirmation:** Long validation text may not wrap or may overflow on narrow screens. | **Low** | Use `text-sm` and allow wrapping; avoid fixed min-width on error boxes. |

---

## 6. Performance risks

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/app/dashboard/analytics/provider/page.tsx](src/app/dashboard/analytics/provider/page.tsx) | Chart.js | Line, Bar, Doughnut from react-chartjs-2. Chart.js can be heavy on low-end devices. | **Medium** | Lazy-load chart components (dynamic import); consider reducing animations or complexity on mobile. |
| [src/app/dashboard/analytics/cost-intelligence/page.tsx](src/app/dashboard/analytics/cost-intelligence/page.tsx) | Chart.js | Line chart. Same as above. | **Medium** | Same. |
| [src/components/features/usage/UsageDashboard.tsx](src/components/features/usage/UsageDashboard.tsx) | Chart.js | Line, Doughnut, Bar. Same. | **Medium** | Same. |
| [src/components/landing/APIFlowDiagram.tsx](src/components/landing/APIFlowDiagram.tsx) | APIFlowDiagram | Custom diagram; **Needs confirmation:** re-renders and DOM size on mobile. | **Low** | Profile on a low-end device; simplify or lazy-load if needed. |
| [src/components/landing/hero/HeroSplit.tsx](src/components/landing/hero/HeroSplit.tsx) | Hero | Decorative SVGs and gradients; `overflow-hidden`. Generally OK. | **Low** | — |
| General | Client components | Many `'use client'` components; **Needs confirmation:** bundle size and code-splitting. | **Low** | Run `next build` and analyze client chunks; lazy-load below-the-fold or heavy UI. |

---

## 7. Media optimization issues

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/marketplace/APICard.tsx](src/components/marketplace/APICard.tsx) | APICard | Uses `next/image` for API logo. | **OK** | — |
| [src/components/marketplace/ComparisonTable.tsx](src/components/marketplace/ComparisonTable.tsx) | ComparisonTable | Uses `next/image` with `sizes="56px"`. | **OK** | — |
| [src/app/marketplace/[org_slug]/[api_slug]/page.tsx](src/app/marketplace/[org_slug]/[api_slug]/page.tsx) | API detail | Uses `next/image`. | **OK** | — |
| Codebase | Raw `<img>` | No raw `<img>` found in `src`; Next Image used for marketplace images. | **OK** | — |
| [src/components/landing/PageHero.tsx](src/components/landing/PageHero.tsx) | PageHero | Background and visuals; **Needs confirmation:** no oversized raster images. | **Low** | Ensure any background images use responsive sizes or CSS. |
| [next.config.js](next.config.js) | Images | `remotePatterns` for Supabase and avatars; `formats: avif, webp`. Good. | **OK** | — |

---

## 8. Accessibility concerns (mobile)

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/dashboard/DashboardNav.tsx](src/components/dashboard/DashboardNav.tsx) | Menu button | `aria-label="Open menu"`. Good. | **OK** | — |
| [src/components/dashboard/DashboardNav.tsx](src/components/dashboard/DashboardNav.tsx) | Account trigger | `aria-label="Account menu"` and `data-testid`. Good. | **OK** | — |
| [src/components/landing/PublicNav.tsx](src/components/landing/PublicNav.tsx) | Nav links | No `aria-current` for current page. **Needs confirmation:** ThemeSwitcher and icon-only buttons have labels. | **Low** | Add `aria-current="page"` where applicable; ensure ThemeSwitcher is labeled. |
| [src/components/ui/button.tsx](src/components/ui/button.tsx) | Icon buttons | `[&_svg]:size-4`; icon-only buttons rely on parent aria-label. **Needs confirmation:** All icon buttons have accessible names. | **Low** | Audit all `<Button size="icon">` and ensure `aria-label` or visible text. |
| [src/components/features/notifications/NotificationCenter.tsx](src/components/features/notifications/NotificationCenter.tsx) | Bell icon | **Needs confirmation:** Accessible name for notification trigger. | **Low** | Add `aria-label="Notifications"` (or similar). |
| General | Font size | `text-xs` used in many places; 12px may be hard to read on small screens. | **Low** | Avoid reducing below 12px for body; ensure contrast. |
| [src/app/globals.css](src/app/globals.css) | Base font | **Needs confirmation:** Base font size and line-height for body. | **Low** | Ensure at least 16px for body on mobile for readability. |

---

## 9. Viewport and scroll problems

| File | Component / location | Description | Severity | Recommended fix |
|------|----------------------|-------------|----------|------------------|
| [src/components/landing/Comparison.tsx](src/components/landing/Comparison.tsx) | Table wrapper | `overflow-x-auto`; horizontal scroll. Acceptable. | **OK** | — |
| [src/components/marketplace/ComparisonTable.tsx](src/components/marketplace/ComparisonTable.tsx) | Table wrapper | Same. | **OK** | — |
| [src/app/dashboard/admin/operations/readiness/ReadinessDashboard.tsx](src/app/dashboard/admin/operations/readiness/ReadinessDashboard.tsx) | Tables | `overflow-x-auto` on table wrappers. Good. | **OK** | — |
| [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx) | Dialog | `max-w-lg`; `fixed` centered. On short viewports, tall dialogs could exceed height. **Needs confirmation:** Scroll inside dialog when content is long. | **Medium** | Ensure dialog content area is scrollable (e.g. `max-h-[90vh] overflow-y-auto`) and focus trap works. |
| [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) | Sheet | Side sheet; **Needs confirmation:** SheetContent scroll when sidebar content is long. | **Low** | Ensure SheetContent has overflow-y-auto if content can be tall. |
| [src/components/CookieConsentBanner.tsx](src/components/CookieConsentBanner.tsx) | Cookie banner | `fixed bottom-0`; full width. Can block CTA or inputs. | **Low** | Ensure main CTAs are above the fold or add enough padding-bottom so they’re not hidden. |
| [src/components/marketplace/CompareBar.tsx](src/components/marketplace/CompareBar.tsx) | CompareBar | `fixed bottom-6`; centered. Can overlap cookie banner or other fixed elements. | **Low** | Z-index and spacing already set; **Needs confirmation:** no overlap with CookieConsentBanner. |

---

## 10. Device-specific risks

| Issue | Location / pattern | Description | Severity | Recommended fix |
|-------|--------------------|-------------|----------|------------------|
| 100vh | [DashboardSidebar](src/components/dashboard/DashboardSidebar.tsx), [LegalPageLayout](src/components/legal/LegalPageLayout.tsx), [AIPlayground](src/components/features/playground/AIPlayground.tsx), [playground page](src/app/dashboard/developer/playground/page.tsx) | `calc(100vh - ...)` used. On iOS Safari, 100vh includes address bar so content can be too tall and cause double scrollbar. | **Medium** | Prefer `100dvh` where supported and fallback to `100vh`; or use `min-height: -webkit-fill-available` + 100vh. |
| Safe area | [PublicNav](src/components/landing/PublicNav.tsx), [CookieConsentBanner](src/components/CookieConsentBanner.tsx), [CompareBar](src/components/marketplace/CompareBar.tsx), [FloatingQuickActions](src/components/dashboard/FloatingQuickActions.tsx) | No `env(safe-area-inset-*)` found. Fixed nav and fixed bottom elements may sit under notch or home indicator. | **Medium** | Add `padding-top: env(safe-area-inset-top)` to fixed top nav; `padding-bottom: env(safe-area-inset-bottom)` to fixed bottom bars and cookie banner. |
| Overscroll | General | **Needs confirmation:** Overscroll bounce (e.g. iOS) doesn’t break layout or cause weird jumps. | **Low** | If issues appear, consider `overscroll-behavior: none` on main scroll container (use sparingly). |

---

## 11. Cross-browser mobile compatibility

| Area | Notes | Severity |
|------|--------|----------|
| Safari iOS | 100vh, safe-area, input zoom, and fixed positioning are the main risks; covered above. | Medium |
| Chrome Android | Generally good; test with Chrome DevTools device mode. | Low |
| Samsung Internet | **Needs confirmation:** Same as Chrome for this stack. | Low |
| Firefox Mobile | **Needs confirmation:** No unsupported CSS/JS used. | Low |
| CSP | [middleware](src/middleware.ts) sets CSP in production; `'unsafe-inline'` and `'unsafe-eval'` for scripts. May be required for Next; verify Stripe and any third-party scripts. | Low |

---

## 12. Orientation and loading

| Item | Status | Notes |
|------|--------|------|
| Orientation change | **Needs confirmation** | No fixed width that would break on rotation; Tailwind breakpoints are width-based. Manually test landscape on phone and tablet. |
| Skeleton / loading | Present | Loading states (e.g. marketplace loading, skeletons in dashboard) reduce layout shift. |
| Layout shift | **Needs confirmation** | Ensure images have dimensions or aspect-ratio; Next Image helps. |

---

## 13. Tailwind / breakpoint coverage

- Many components use `sm:`, `md:`, `lg:` (e.g. DashboardNav, MarketplaceContent, LegalPageLayout, landing sections). Layout is generally responsive.
- Dashboard sidebar is hidden on small screens and shown in a Sheet (`lg:hidden` for trigger, sidebar in SheetContent); good.
- Public nav is the main gap: no breakpoint-based collapse, so it breaks on mobile small/standard.
- Tables use `overflow-x-auto` with fixed `min-width`; no mobile-specific card layout for comparison tables.

---

## Top 15 mobile risks (fix before production)

1. **PublicNav has no mobile menu** – Links in one row overflow on 320–375px. Add hamburger + Sheet/menu.
2. **Public nav and fixed elements lack safe-area** – Add `env(safe-area-inset-top/bottom)` to fixed nav and bottom bars.
3. **100vh usage** – Replace with 100dvh or add fallback for Safari (e.g. min-height -webkit-fill-available).
4. **Button touch targets** – Ensure primary actions and icon buttons are at least 44px (e.g. min height/width or padding).
5. **Dialog/Sheet scroll** – Ensure long content in dialogs and sheets scrolls and doesn’t overflow viewport.
6. **Comparison tables** – min-width 600/800px forces horizontal scroll; consider stacked/card layout for small breakpoints.
7. **Input font size** – Ensure form inputs are ≥ 16px to avoid iOS zoom on focus.
8. **Chart.js on mobile** – Lazy-load and optionally simplify charts on small screens or low-end devices.
9. **NotificationCenter dropdown width** – Constrain to viewport (e.g. max-w-[min(380px,100vw-2rem)]).
10. **Cookie banner vs CompareBar** – Verify z-index and spacing so both don’t overlap badly.
11. **Marketplace filter sidebar** – Confirm mobile filter UI (e.g. “Filters” button + Sheet); add if missing.
12. **Sticky ValueProposition bar** – Reduce vertical footprint on short viewports if needed.
13. **Icon-only buttons** – Audit and add aria-labels where missing.
14. **ThemeSwitcher and PublicNav** – Ensure accessible names and keyboard/touch behavior.
15. **Landscape and orientation** – Manually test key flows in landscape on phone and tablet.

---

## Mobile readiness score (0–100)

| Category | Score | Notes |
|----------|-------|--------|
| Layout responsiveness | 70 | Good use of breakpoints and overflow; PublicNav and comparison tables are main gaps. |
| Touch interaction safety | 65 | Some buttons/icons below 44px; dropdowns generally OK. |
| Performance on mobile | 75 | Next Image in use; Chart.js and client bundles are the main risks. |
| Accessibility | 75 | Some aria-labels and structure; icon buttons and form labels need a pass. |
| Cross-device compatibility | 70 | 100vh and safe-area need fixes; no obvious browser-specific breaks. |

**Overall: 71/100**

---

## Verdict

**Needs fixes**

- **Reasoning:** The app is largely responsive and uses Tailwind breakpoints and overflow correctly. The main blockers are: (1) **PublicNav** with no mobile menu, which will break on 320–375px; (2) **safe-area** not applied to fixed headers/footers; (3) **100vh** on key layouts; (4) **touch targets** for small/icon buttons. Addressing the top 5–6 items (nav, safe-area, 100vh, touch targets, dialog scroll, comparison tables) would move the app to a “Ship” posture for mobile; the rest are improvements and confirmations.

---

## Implementation summary (post-audit fixes)

Fixes applied in priority order:

**CRITICAL**
- **PublicNav** ([src/components/landing/PublicNav.tsx](src/components/landing/PublicNav.tsx)): Mobile hamburger menu for `md` down; Sheet with nav links; `pt-[env(safe-area-inset-top)]` on nav; `aria-label="Main navigation"` and menu trigger `aria-label="Open menu"`.
- **Dialog** ([src/components/ui/dialog.tsx](src/components/ui/dialog.tsx)): `max-h-[90vh] max-h-[90dvh]` and `overflow-y-auto` so long content scrolls; close button `min-h-[44px] min-w-[44px]`.
- **Sheet** ([src/components/ui/sheet.tsx](src/components/ui/sheet.tsx)): `overflow-y-auto` on left/right variants so long content (e.g. dashboard sidebar, filters) scrolls.

**HIGH**
- **Safe-area**: PublicNav top; CookieConsentBanner `pb-[max(1rem,env(safe-area-inset-bottom))]`; CompareBar `bottom-[max(1.5rem,env(safe-area-inset-bottom))]`; FloatingQuickActions `marginBottom: max(var(--cookie-banner-height, 0px), env(safe-area-inset-bottom, 0px))`; DashboardNav `pt-[env(safe-area-inset-top)]`; public layout content `pt-[calc(4rem+env(safe-area-inset-top,0px))]`.
- **Touch targets**: Button `icon` size changed from `h-9 w-9` to `h-11 w-11` (44px) in [src/components/ui/button.tsx](src/components/ui/button.tsx).
- **NotificationCenter** ([src/components/features/notifications/NotificationCenter.tsx](src/components/features/notifications/NotificationCenter.tsx)): Trigger `aria-label="Notifications"`; dropdown `max-w-[min(380px,calc(100vw-2rem))]`.
- **100vh → 100dvh**: DashboardSidebar, AIPlayground, dashboard playground page, LegalPageLayout.

**MEDIUM**
- **Footer newsletter** ([src/components/landing/Footer.tsx](src/components/landing/Footer.tsx)): `inputMode="email"`, `autoComplete="email"`, `text-base md:text-sm` to avoid iOS zoom and improve keyboards.

---

## Verification plan

**Viewports to test**
- 320px (e.g. iPhone SE)
- 375px (e.g. iPhone 14)
- 414px (e.g. iPhone Plus)
- 768px (tablet portrait)
- 1024px (tablet landscape / laptop)

**Checks**

1. **Navigation**
   - Public: At 320–767px, only logo, theme, and hamburger visible; tap hamburger opens Sheet with Browse APIs, Pricing, Docs, Login, Sign Up; tap link closes sheet and navigates.
   - Dashboard: At &lt; lg, hamburger opens left Sheet with sidebar; tap nav item closes and navigates.
   - No horizontal scroll on nav bars at any width.

2. **Forms**
   - Login, signup, contact, footer newsletter: Focus input on iOS Safari – no zoom if input is ≥ 16px (footer uses text-base on mobile).
   - Submit and validation messages visible; buttons remain tappable when keyboard is open (scroll into view).

3. **Modals and sheets**
   - Open a dialog with long content: dialog scrolls inside, does not exceed viewport, close button tappable.
   - Dashboard mobile menu sheet: long sidebar list scrolls inside sheet.
   - Marketplace filters sheet: opens from “Filters”, content scrolls if needed.

4. **Tables**
   - Marketplace compare table, landing Comparison: horizontal scroll with no layout break; optional check that scroll hint is visible on small screens.

5. **Fixed elements**
   - On notched device (or simulator with safe area): Public nav and dashboard header content below status bar; cookie banner and Compare bar above home indicator; FAB above safe area when cookie banner absent.

6. **iOS Safari**
   - 100dvh: Dashboard sidebar and playground fill viewport without double scrollbar when address bar shows/hides.
   - Keyboard: Focused input scrolls into view; no inputs stuck under keyboard.

7. **Touch**
   - Primary and icon buttons (e.g. Sign Up, menu, notifications, dialog close) feel at least 44px; no accidental taps on adjacent controls.

8. **Long pages**
   - Scroll landing, dashboard, marketplace; sticky headers don’t block in-page anchors; scroll-margin-top (globals: 6rem) avoids header overlap.

**Needs confirmation**
- ThemeSwitcher remains 36px (w-9 h-9) by design; verify acceptable or bump to 44px.
- Chart-heavy dashboard pages on low-end devices: lazy-load or simplify if needed.
- Landscape on phone/tablet: quick pass on key flows.
