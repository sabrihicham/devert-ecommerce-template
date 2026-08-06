# Home Page Rebuild Plan for the Ecommerce Template

## 1. Overview

The goal is to rebuild the current **Home** page and transform it from a simple product grid into a modern, professional, fast, and fully responsive ecommerce storefront using:

- Next.js 16
- React 19
- Tailwind CSS
- shadcn/ui
- Radix UI
- Supabase
- Drizzle ORM
- Embla Carousel
- Lucide Icons

The proposed visual direction follows a:

> Modern Premium Commerce

style that is clean, commercial, reusable, and easy to customize for different store types.

---

## 2. Redesign Objectives

The new page should achieve the following:

- Communicate the store type within the first 3 seconds.
- Highlight important products and promotions.
- Make categories easy to discover.
- Build trust before purchase.
- Improve the mobile shopping experience.
- Improve conversion rates.
- Maintain excellent performance.
- Support light and dark modes.
- Support RTL and Arabic.
- Make page sections manageable from an admin dashboard later.
- Build a reusable design system for the rest of the store.

---

## 3. Design Direction

### General Style

- Modern and minimal design.
- Comfortable whitespace.
- Large, clear product imagery.
- Limited and consistent color palette.
- Cards with subtle borders.
- Soft shadows.
- Calm hover interactions.
- Clear typography.
- Minimal text inside banners.
- Strong focus on products and purchasing.

### Core Rules

- Use only one primary accent color.
- Avoid heavy gradients.
- Avoid strong shadows.
- Avoid overcrowding the page.
- Do not display every product on the homepage.
- Do not turn the entire page into a Client Component.

---

# 4. Home Page Structure

## 4.1 Announcement Bar

A small bar at the top of the site that displays a short commercial message.

Examples:

- Free delivery for orders above 8,000 DZD.
- Easy returns within 7 days.
- Get 10% off with code WELCOME10.
- Delivery available across all provinces.

### Requirements

- Simple design.
- Compact height.
- Dismissible.
- Optional link support.
- No fast or distracting slider.

---

## 4.2 Header

### Desktop

Includes:

- Logo.
- Category navigation.
- Offers link.
- Search field.
- Account.
- Wishlist.
- Cart.
- Cart item count badge.

### Mobile

Includes:

- Menu button.
- Logo.
- Search.
- Cart.
- Side navigation using Sheet.

### Behavior

When scrolling:

- The header becomes sticky.
- It uses a semi-transparent background.
- It applies `backdrop-blur`.
- A subtle border or shadow appears.

### Recommended shadcn Components

- Navigation Menu
- Sheet
- Command
- Dropdown Menu
- Button
- Badge
- Separator
- Dialog

---

## 4.3 Hero Section

A main two-column section.

### Text Content

- Small badge.
- Strong main headline.
- Short supporting description.
- Primary button.
- Secondary button.
- Compact trust indicators.

### Image Area

- Product image or product collection.
- Simple background.
- Optional discount badge.
- Floating price card.
- Limited decorative elements.
- Separate mobile image when necessary.

### Example

**Headline:**

> Carefully selected products to improve your daily performance

**Description:**

> Discover the latest products with trusted quality, competitive prices, and fast delivery.

**Buttons:**

- Shop Now
- Explore Collection

---

## 4.4 Trust Features

A store benefits bar.

### Suggested Benefits

- Fast delivery.
- Secure payment.
- Direct support.
- Easy returns.

### Each Item Includes

- Icon.
- Title.
- Short description.

### Responsive Layout

- Desktop: four columns.
- Mobile: 2×2 grid.

---

## 4.5 Shop by Category

A category discovery section.

### Recommended Design

Use large image cards instead of small circles or icon-only categories.

Each card includes:

- Category image.
- Category name.
- Product count.
- Link or arrow.
- Subtle zoom effect on hover.

### Layout

A Bento Grid can be used:

```text
┌──────────────────────┬──────────┬──────────┐
│                      │ Category │ Category │
│   Main Category      ├──────────┼──────────┤
│                      │ Category │ Category │
└──────────────────────┴──────────┴──────────┘
```

### Required Data

- Name
- Slug
- Image
- Description
- Product count
- isFeatured
- displayOrder

---

## 4.6 Featured Products

Display only important products.

### Suggested Tabs

- Best Sellers.
- New Arrivals.
- Special Offers.

### Product Count

- 8 products per group.
- View All button.

### shadcn Components

- Tabs
- Card
- Badge
- Button
- Tooltip
- Skeleton

---

## 4.7 Product Card

The product card is the most important UI component.

### Card Content

- Fixed-ratio image.
- New or discount badge.
- Wishlist button.
- Quick View button.
- Product name.
- Category or brand.
- Rating.
- Review count.
- Current price.
- Previous price.
- Add to Cart button.

### Supported States

- New product.
- Discounted product.
- Out of stock.
- Low stock.
- Product without a discount.
- Product with variants.
- Product with multiple images.

### Mobile Experience

- Reduce secondary information.
- Use a compact cart button.
- Do not rely only on hover interactions.
- Ensure touch interactions work well.

---

## 4.8 Promotional Bento Grid

A promotional section displayed as a Bento layout.

### Structure

- One main banner.
- Two smaller banners.
- Optional coupon card.

```text
┌─────────────────────────────┬───────────────┐
│                             │ Weekend Sale  │
│      Summer Collection      ├───────────────┤
│                             │ New Arrivals  │
└─────────────────────────────┴───────────────┘
```

### Each Banner Includes

- Title.
- Short description.
- Image.
- Button or link.
- Start and end dates.
- Mobile image version.

---

## 4.9 Best Sellers

A dedicated section for best-selling products.

### Desktop

- Carousel showing 4 products.

### Tablet

- 2 or 3 products.

### Mobile

- One full card with part of the next card visible.

### Technology

Use the existing Embla Carousel package instead of adding another carousel library.

---

## 4.10 Limited Offer

A limited-time promotion section for one product or bundle.

### Content

- Product image.
- Offer title.
- Description.
- Current price.
- Previous price.
- Discount percentage.
- Optional countdown.
- Stock progress bar.
- Purchase button.

### Note

The countdown must be connected to a real expiration date from the database. It should not reset artificially.

---

## 4.11 Social Proof

Two types of content can be combined:

### Customer Reviews

- Name.
- Image.
- Rating.
- Short review.
- Purchased product.

### Store Statistics

- Number of orders.
- Average rating.
- Number of customers.
- Number of supported provinces.

Only real numbers should be displayed.

---

## 4.12 Recently Viewed

A section showing products previously viewed by the user.

### Storage

- `localStorage` for guests.
- Database storage for signed-in users.

### Behavior

- Hidden when no browsing history exists.
- Displays 4 to 8 products.
- Updated after visiting a product page.

---

## 4.13 Newsletter

A simple subscription section.

### Content

- Title.
- Description.
- Email field.
- Subscribe button.
- Short privacy note.

### Technology

- shadcn Form.
- Zod validation.
- Server Action.
- Sonner notifications.

---

## 4.14 Footer

### Sections

- Logo and short description.
- Store links.
- Customer service.
- Policies.
- Account links.
- Social media.
- Payment methods.
- Copyright.

### Mobile

Use Accordion to reduce page height.

---

# 5. Final Page Order

```text
Announcement Bar
Header
Hero
Trust Features
Categories
Featured Products
Promotional Bento
Best Sellers
Limited Offer
Testimonials / Store Stats
Recently Viewed
Newsletter
Footer
```

User journey:

```text
Capture attention
→ Build trust
→ Browse categories
→ Discover products
→ View promotions
→ Confirm store credibility
→ Purchase or subscribe
```

---

# 6. Design System

## 6.1 Colors

Use shadcn CSS variables:

```css
--background;
--foreground;
--card;
--card-foreground;
--primary;
--primary-foreground;
--secondary;
--secondary-foreground;
--muted;
--muted-foreground;
--accent;
--accent-foreground;
--border;
--input;
--ring;
--destructive;
```

### General Recommendation

- Background: warm white or very light gray.
- Foreground: dark charcoal.
- Primary: brand color.
- Muted: calm gray.
- Discount: red, used sparingly.
- Success: green.
- Border: light gray.

---

## 6.2 Typography

### Arabic

- IBM Plex Sans Arabic
- Alexandria
- Tajawal
- Noto Kufi Arabic

### English

- Geist
- Inter
- Manrope

### Recommendation

- Geist for English.
- IBM Plex Sans Arabic for Arabic.

---

## 6.3 Sizing

```text
Container: max-w-7xl
Desktop section spacing: 88px to 120px
Mobile section spacing: 56px to 72px
Card radius: 16px to 24px
Button height: 44px to 48px
Header height: 72px to 80px
Product image ratio: 4/5 or 1/1
```

---

## 6.4 Shadows and Borders

Use:

```css
border border-border/60
shadow-sm
hover:shadow-md
```

Avoid:

- Large shadows.
- Dark borders.
- Excessive glow effects.

---

## 6.5 Animations

Recommended interactions:

- Subtle image scaling.
- Border or shadow transitions.
- Light fade effects.
- Simple Sheet slide animation.
- Durations between 200ms and 500ms.

Respect:

```css
prefers-reduced-motion
```

---

# 7. Required shadcn Components

Initialize shadcn:

```bash
npx shadcn@latest init
```

Add the required components:

```bash
npx shadcn@latest add \
button badge card input separator \
sheet navigation-menu dropdown-menu \
command dialog tabs accordion \
tooltip skeleton carousel form
```

Add Lucide:

```bash
npm install lucide-react
```

Prefer Lucide over mixing multiple icon libraries in the storefront.

---

# 8. Recommended Architecture

```text
src/
├── app/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
│
├── components/
│   ├── home/
│   │   ├── announcement-bar.tsx
│   │   ├── hero-section.tsx
│   │   ├── trust-features.tsx
│   │   ├── category-grid.tsx
│   │   ├── featured-products.tsx
│   │   ├── promo-bento.tsx
│   │   ├── best-sellers.tsx
│   │   ├── limited-offer.tsx
│   │   ├── testimonials.tsx
│   │   ├── store-stats.tsx
│   │   ├── recently-viewed.tsx
│   │   └── newsletter.tsx
│   │
│   ├── product/
│   │   ├── product-card.tsx
│   │   ├── product-card-skeleton.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-price.tsx
│   │   ├── product-rating.tsx
│   │   ├── product-badges.tsx
│   │   └── quick-view-dialog.tsx
│   │
│   ├── layout/
│   │   ├── store-header.tsx
│   │   ├── mobile-navigation.tsx
│   │   ├── cart-sheet.tsx
│   │   ├── search-dialog.tsx
│   │   └── store-footer.tsx
│   │
│   └── ui/
│
├── config/
│   ├── store.ts
│   ├── navigation.ts
│   └── home.ts
│
├── lib/
│   ├── queries/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   └── home.ts
│   ├── actions/
│   │   ├── cart.ts
│   │   ├── wishlist.ts
│   │   └── newsletter.ts
│   └── utils.ts
│
├── hooks/
│   ├── use-cart.ts
│   ├── use-wishlist.ts
│   └── use-recently-viewed.ts
│
└── types/
    └── commerce.ts
```

---

# 9. page.tsx Responsibility

`page.tsx` should only compose page sections.

```tsx
import { Suspense } from "react";

import { HeroSection } from "@/components/home/hero-section";
import { TrustFeatures } from "@/components/home/trust-features";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PromoBento } from "@/components/home/promo-bento";
import { BestSellers } from "@/components/home/best-sellers";
import { LimitedOffer } from "@/components/home/limited-offer";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { ProductsSectionSkeleton } from "@/components/product/product-card-skeleton";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustFeatures />

      <Suspense fallback={<ProductsSectionSkeleton />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<ProductsSectionSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      <PromoBento />

      <Suspense fallback={<ProductsSectionSkeleton />}>
        <BestSellers />
      </Suspense>

      <LimitedOffer />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
```

---

# 10. Home Page Configuration

Hero content and section visibility should be manageable later.

```ts
type HomePageConfig = {
  hero: {
    enabled: boolean;
    eyebrow?: string;
    title: string;
    description: string;
    image: string;
    mobileImage?: string;
    primaryAction: {
      label: string;
      href: string;
    };
    secondaryAction?: {
      label: string;
      href: string;
    };
  };

  sections: {
    categories: boolean;
    featuredProducts: boolean;
    bestSellers: boolean;
    promotions: boolean;
    limitedOffer: boolean;
    testimonials: boolean;
    storeStats: boolean;
    recentlyViewed: boolean;
    newsletter: boolean;
  };
};
```

---

# 11. Database Changes

## Product

Recommended fields:

```text
isFeatured
isBestSeller
isNewArrival
compareAtPrice
discountPercentage
averageRating
reviewCount
soldCount
stock
status
publishedAt
```

## Category

```text
name
slug
image
mobileImage
description
isFeatured
displayOrder
```

## Banner

```text
title
description
image
mobileImage
href
buttonLabel
position
isActive
startsAt
endsAt
displayOrder
```

## Testimonial

```text
name
content
rating
avatar
productId
isPublished
displayOrder
```

## Newsletter Subscriber

```text
email
status
createdAt
confirmedAt
```

---

# 12. Server Components and Client Components

## Server Components

Use them by default for:

- Hero.
- Categories.
- Product sections.
- Promo banners.
- Testimonials.
- Store stats.
- Footer.
- Newsletter wrapper.

## Client Components

Use only where required:

- Carousel controls.
- Wishlist.
- Add to Cart.
- Quick View.
- Cart Sheet.
- Mobile Sheet.
- Search Dialog.
- Interactive Tabs.
- Recently Viewed.
- Countdown.
- Newsletter form.

---

# 13. Data Fetching Strategy

Do not load all products at once on the homepage.

### Recommended Queries

```text
Featured products: 8
Best sellers: 8
New arrivals: 8
Discounted products: 8
Featured categories: 6
Testimonials: 3
Banners: 3 or 4
```

### Rules

- Select only required fields.
- Avoid `select *`.
- Filter published products only.
- Filter by stock when required.
- Sort results in the database.
- Add indexes for frequently filtered fields.

---

# 14. Images and Performance

Use `next/image`.

```tsx
<Image
  src={product.image}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

### Rules

- Use `priority` only for the Hero image.
- Lazy-load all other images.
- Use WebP or AVIF.
- Define width and height or aspect ratio.
- Use blur placeholders when available.
- Provide mobile-specific banner images.
- Do not load desktop-only images on mobile.

---

# 15. Loading and Error States

## Loading

Create dedicated skeletons for each section:

- Hero Skeleton.
- Category Skeleton.
- Product Card Skeleton.
- Product Section Skeleton.
- Testimonials Skeleton.

## Empty States

- No products.
- No categories.
- No promotions.
- No search results.
- Empty cart.
- Empty wishlist.

## Error States

- Page-level Error Boundary.
- Retry button.
- Clear user-facing message.
- Log errors without exposing sensitive information.

---

# 16. Responsive Design

## Mobile First

### Mobile

- Vertical Hero.
- Two-column product grid.
- Images optimized for smaller screens.
- Footer using Accordion.
- Bento cards stacked vertically.
- Swipeable carousel.
- Touch-friendly button height.
- No hover-only actions.
- Optional sticky cart or Add to Cart action.

### Tablet

- Two- or three-column product grid.
- Two-column Hero when space allows.
- Three-column category layout.

### Desktop

- Wide container.
- Four-column product grid.
- Two-column Hero.
- Mega menu.
- Asymmetric Bento layout.
- Hover quick actions.

---

# 17. Arabic and RTL Support

### Requirements

- Use `dir="rtl"` for Arabic.
- Flip arrows and directional controls.
- Test Sheet, Dropdown, and Carousel in RTL.
- Use a suitable Arabic font.
- Avoid `left` and `right` when logical properties can be used:
  - `start`
  - `end`
  - `ms`
  - `me`
- Test numbers and currencies.
- Support Algerian dinar.

Example:

```ts
new Intl.NumberFormat("ar-DZ", {
  style: "currency",
  currency: "DZD",
}).format(price);
```

---

# 18. SEO

## Home Metadata

- Title.
- Description.
- Open Graph image.
- Twitter card.
- Canonical URL.
- Robots.

## Structured Data

Add:

- Organization.
- WebSite.
- SearchAction.
- Product when appropriate.
- BreadcrumbList on internal pages.

## Content

- Only one H1.
- H2 headings for sections.
- Alt text for all images.
- Clear internal links.
- Do not place important text only inside images.

---

# 19. Accessibility

### Requirements

- Keyboard navigation.
- Clear focus states.
- Labels for icon-only buttons.
- Sufficient contrast.
- Alt text.
- ARIA where needed.
- Respect reduced motion.
- Every Dialog must have a clear close action.
- Touch targets should be approximately 44px or larger.
- Announce cart updates to screen readers.

---

# 20. Shopping Experience Improvements

Recommended features:

- Quick Add.
- Wishlist.
- Quick View.
- Mini Cart using Sheet.
- Instant search.
- Search suggestions.
- Recently Viewed.
- Product recommendations.
- Toast after adding a product.
- Sticky mobile purchase button.
- Province and municipality selection.
- Cash on delivery.
- Dynamic shipping cost.
- Stock status.
- Estimated delivery time.

---

# 21. Analytics

Add events such as:

```text
view_home
view_promotion
select_category
view_product
add_to_cart
add_to_wishlist
open_quick_view
search
begin_checkout
newsletter_signup
```

Possible tools:

- Vercel Analytics.
- Google Analytics.
- Custom events.

Do not send sensitive personal information.

---

# 22. Implementation Plan

## Phase 1: Foundation

- Initialize shadcn.
- Configure CSS variables.
- Configure fonts.
- Configure Dark Mode.
- Create Container and Section primitives.
- Standardize Button and Card styles.
- Standardize icons.
- Configure RTL support.

### Deliverable

A reusable core design system.

---

## Phase 2: Layout

- Rebuild Header.
- Build mobile navigation.
- Build Search Dialog.
- Build Cart Sheet.
- Rebuild Footer.
- Add Announcement Bar.

### Deliverable

A complete responsive layout shell.

---

## Phase 3: Core Home

- Build Hero.
- Build Trust Features.
- Build Categories.
- Rebuild Product Card.
- Build Featured Products.
- Create Skeletons.

### Deliverable

A strong first version of the homepage.

---

## Phase 4: Merchandising

- Build Promo Bento.
- Build Best Sellers.
- Build New Arrivals.
- Build Limited Offer.
- Add Quick View.
- Add Wishlist.

### Deliverable

Improved product and promotion discovery.

---

## Phase 5: Conversion

- Testimonials.
- Store Stats.
- Newsletter.
- Recently Viewed.
- Product Recommendations.
- Improve Add to Cart feedback.

### Deliverable

Higher trust and conversion potential.

---

## Phase 6: Optimization

- Optimize images.
- Optimize queries.
- Add caching.
- Improve SEO.
- Add Structured Data.
- Test accessibility.
- Test RTL.
- Run Lighthouse.
- Test Core Web Vitals.

### Deliverable

A production-ready homepage.

---

# 23. Priority Order

Implement in this order:

1. Product Card.
2. Design Tokens.
3. Header.
4. Mobile Navigation.
5. Hero.
6. Categories.
7. Featured Products.
8. Promo Bento.
9. Footer.
10. Best Sellers.
11. Search.
12. Mini Cart.
13. Wishlist.
14. Quick View.
15. Recently Viewed.
16. Newsletter.
17. Testimonials.
18. Performance and SEO.

Product Card quality is the highest priority because it affects every store page.

---

# 24. Acceptance Criteria

## Desktop

- No obvious layout shift.
- Sticky header works correctly.
- Hero is clear and uncluttered.
- Four product cards per row.
- Consistent spacing across sections.
- Sharp, optimized imagery.
- Calm hover states.

## Mobile

- No horizontal overflow.
- Two-column product grid.
- Menu and Cart work with touch.
- Text does not overflow.
- Images are optimized for mobile.
- Footer Accordion works.
- Buttons are easy to tap.

## Performance

Target:

```text
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 95+
```

## Code Quality

- No TypeScript errors.
- No critical ESLint errors.
- No oversized components.
- No duplicate queries.
- No unnecessary Client Components.
- Clear naming.
- Typed props.
- Loading, Empty, and Error states implemented.

---

# 25. Pre-Launch Checklist

## UI

- [ ] Header
- [ ] Mobile menu
- [ ] Hero
- [ ] Trust features
- [ ] Categories
- [ ] Featured products
- [ ] Product cards
- [ ] Promo Bento
- [ ] Best sellers
- [ ] Limited offer
- [ ] Testimonials
- [ ] Recently viewed
- [ ] Newsletter
- [ ] Footer

## Functionality

- [ ] Search
- [ ] Add to Cart
- [ ] Remove from Cart
- [ ] Update quantity
- [ ] Wishlist
- [ ] Quick View
- [ ] Category navigation
- [ ] Newsletter subscription
- [ ] Product links
- [ ] Promotion links

## Responsive

- [ ] 320px
- [ ] 375px
- [ ] 430px
- [ ] 768px
- [ ] 1024px
- [ ] 1280px
- [ ] 1440px

## Quality

- [ ] Typecheck
- [ ] Lint
- [ ] Build
- [ ] Accessibility
- [ ] SEO
- [ ] Lighthouse
- [ ] RTL
- [ ] Dark Mode
- [ ] Empty states
- [ ] Error states

---

# 26. Target Final Result

After implementing this plan, the homepage should be:

- Professional and suitable for sale as a template.
- Fast and responsive.
- Easy to customize.
- Suitable for the Algerian market and other markets.
- Compatible with Arabic and RTL.
- Built with reusable shadcn components.
- Ready for future admin management of homepage sections.
- Consistent with Product, Category, Cart, and Checkout pages.
