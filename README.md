# Forme Showcase

A stunning, production-quality website powered entirely by [Forme](https://formecms.com) — the AI-native headless CMS engine. **Every piece of content** on this site is managed through composable content models and fetched via the Forme Delivery API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fformecms%2Fshowcase&env=FORME_DELIVERY_URL,FORME_READ_KEY&envDescription=Forme%20API%20credentials&envLink=https%3A%2F%2Fdocs.forme.build%2Fquickstart)

## What this demonstrates

This showcase app demonstrates Forme's **composable content modeling** at its fullest:

- **12 content models** using all 3 model types (Page, Component, Data) and all 9 field types
- **Composable pages** — a `Page` model references reusable `Component` entries via reference fields
- **Component reuse** — the same `HeroSection` model powers both Home and About heroes with different content
- **Data models** — shared singletons like `SiteSettings`, `NavigationMenu`, and `Author`
- **100% CMS-driven content** — no hardcoded text, headings, or navigation

### Content Architecture

```
Page (page)
├── sections (reference[], many)
│   ├── HeroSection (component)
│   ├── SectionHeader (component)
│   ├── FeatureCard (component) ×6
│   ├── ContentBlock (component)
│   ├── StatCard (component) ×4
│   ├── TestimonialCard (component) ×3
│   └── CallToAction (component)
│
BlogPost (page)
├── author → Author (data)
├── featuredImage → Asset
│
SiteSettings (data) — site name, tagline, social links
NavigationMenu (data) — header and footer links
Author (data) — name, role, bio, avatar
```

## Quick Start

### 1. Set up Forme

If you don't have a Forme instance yet, set one up locally:

```bash
# Clone the content-engine repo
git clone https://github.com/formecms/content-engine && cd content-engine

# Start services and seed
docker compose up -d
pnpm install && pnpm db:migrate && pnpm seed
# Save the Secret Key and Read Key from output!

# Start the APIs
pnpm --filter @content-engine/management dev   # Port 3001
pnpm --filter @content-engine/delivery dev     # Port 3002
```

### 2. Seed showcase content

```bash
cd examples/nextjs
cp .env.example .env.local
# Edit .env.local with your keys from step 1

# Install dependencies
pnpm install

# Seed all content models and entries
FORME_MANAGEMENT_URL=http://localhost:3001 \
FORME_SECRET_KEY=ce_secret_... \
pnpm seed

# To re-seed (deletes seed entries + _seed_ assets, then re-creates):
pnpm seed -- --reset
# Note: if upgrading from an older seed version, a few orphaned
# images (without the _seed_ prefix) may remain. These are harmless
# and can be deleted manually from the Forme admin UI.
```

### 3. Run the app

```bash
pnpm dev
# Open http://localhost:3000
```

## Pages

| Page      | URL            | Content Model                                               |
| --------- | -------------- | ----------------------------------------------------------- |
| Home      | `/`            | `Page` (slug: "home") with 16 section references            |
| About     | `/about`       | `Page` (slug: "about") with 4 section references            |
| Blog      | `/blog`        | Lists all `BlogPost` entries                                |
| Blog Post | `/blog/[slug]` | Individual `BlogPost` with author, rich text, related posts |

## Tech Stack

- **Next.js 15** — App Router, Server Components, ISR
- **@formecms/sdk** — Typed Forme client (from npm)
- **Tailwind CSS** — Deep Reef design system
- **react-markdown** — Rich text rendering from Markdown
- **Instrument Serif + Inter** — Display + body typography

## Environment Variables

| Variable               | Description                                      | Required  |
| ---------------------- | ------------------------------------------------ | --------- |
| `FORME_DELIVERY_URL`   | Delivery API URL (e.g., `http://localhost:3002`) | Yes       |
| `FORME_READ_KEY`       | Read Key (starts with `ce_read_`)                | Yes       |
| `FORME_MANAGEMENT_URL` | Management API URL (for seed script only)        | Seed only |
| `FORME_SECRET_KEY`     | Secret Key (for seed script only)                | Seed only |

## Content Models

All 12 models, covering every Forme field type:

| Model           | Type      | Key Fields                                                                                                          |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| SiteSettings    | data      | siteName, tagline, copyrightYear (number), socialLinks (json)                                                       |
| NavigationMenu  | data      | location (enum), items (json)                                                                                       |
| Author          | data      | name (localized), role, bio, avatar (asset)                                                                         |
| HeroSection     | component | headline (localized), ctaText, style (enum), backgroundImage (asset)                                                |
| SectionHeader   | component | title (localized), subtitle, sortOrder (number)                                                                     |
| FeatureCard     | component | title (localized), description, iconName, sortOrder (number)                                                        |
| ContentBlock    | component | title, body (richText), image (asset), imagePosition (enum), showBackground (boolean)                               |
| StatCard        | component | value, label (localized), suffix, sortOrder (number)                                                                |
| TestimonialCard | component | quote (localized), personName, personRole, avatar (asset)                                                           |
| CallToAction    | component | headline (localized), buttonText, buttonLink, style (enum)                                                          |
| Page            | page      | title (localized), slug (unique), seoTitle, sections (reference[], many)                                            |
| BlogPost        | page      | title (localized), slug (unique), body (richText), author (reference), publishedDate (dateTime), featured (boolean) |

## Design System

This app uses the **Deep Reef** design system:

- **Colors:** Ocean navy (#0A1628), Sand neutrals (#FAFAF7), Reef teal (#0EA5B8)
- **Fonts:** Instrument Serif (headlines), Inter (body)
- **Patterns:** Glassmorphic hero, bento grids, scroll-reveal animations, spring easing

## License

MIT
