# Forme Showcase

A stunning website powered entirely by [Forme](https://formecms.com), the AI-native headless CMS engine. **Every piece of content** is managed through composable content models and fetched via the Forme Delivery API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fformecms%2Fshowcase&env=FORME_DELIVERY_URL,FORME_READ_KEY&envDescription=Forme%20API%20credentials&envLink=https%3A%2F%2Fformecms.com)

## What this demonstrates

- **12 content models** using all 3 model types (Page, Component, Data) and all 9 field types
- **Composable pages** built from reusable components via reference fields
- **100% CMS-driven content** including navigation, pages, blog posts, and images
- **Deep Reef design system** with glassmorphic hero, scroll animations, and editorial typography

### Content Architecture

```
Page (page)
├── header → NavigationMenu (data)
├── footer → NavigationMenu (data)
├── sections (reference[], many)
│   ├── HeroSection (component)
│   ├── SectionHeader (component)
│   ├── FeatureCard (component) x6
│   ├── ContentBlock (component)
│   ├── StatCard (component) x4
│   ├── TestimonialCard (component) x3
│   └── CallToAction (component)

BlogPost (page)
├── author → Author (data)
├── featuredImage → Asset

SiteSettings (data), NavigationMenu (data), Author (data)
```

## Quick Start

### 1. Get a Forme workspace

**Option A: Forme Cloud (recommended)**

Sign up at [formecms.com](https://formecms.com) and get your API keys.

**Option B: Run locally**

```bash
git clone https://github.com/formecms/content-engine && cd content-engine
docker compose up -d
pnpm install && pnpm db:migrate && pnpm seed
# Save the Secret Key and Read Key from output!
pnpm --filter @content-engine/management dev   # Port 3001
pnpm --filter @content-engine/delivery dev     # Port 3002
```

### 2. Clone and set up

```bash
git clone https://github.com/formecms/showcase && cd showcase
cp .env.example .env.local
# Edit .env.local with your Forme API keys
pnpm install
```

### 3. Seed content

The seed script creates all 12 content models, uploads images, and publishes entries:

```bash
FORME_MANAGEMENT_URL=http://localhost:3001 \
FORME_SECRET_KEY=ce_secret_... \
pnpm seed
```

To re-seed from scratch:

```bash
pnpm seed -- --reset
```

### 4. Run the app

```bash
pnpm dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

Click the **Deploy with Vercel** button above, or:

```bash
pnpm build   # Verify the build works
# Then connect to Vercel and set FORME_DELIVERY_URL + FORME_READ_KEY as env vars
```

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Composable page with hero, features, stats, testimonials, CTA |
| About | `/about` | Same Page model, different content |
| Stories | `/blog` | Blog listing with CMS-driven hero |
| Story | `/blog/[slug]` | Full article with author, rich text, related posts |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FORME_DELIVERY_URL` | Delivery API URL | Yes |
| `FORME_READ_KEY` | Read Key (starts with `ce_read_`) | Yes |
| `FORME_MANAGEMENT_URL` | Management API URL | Seed only |
| `FORME_SECRET_KEY` | Secret Key (starts with `ce_secret_`) | Seed only |

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Components, ISR)
- [@formecms/sdk](https://www.npmjs.com/package/@formecms/sdk) (Typed Forme client)
- [Tailwind CSS](https://tailwindcss.com/) (Deep Reef design system)
- [react-markdown](https://github.com/remarkjs/react-markdown) (Rich text rendering)

## Content Models

All 12 models covering every Forme field type:

| Model | Type | Key Fields |
|-------|------|------------|
| SiteSettings | data | siteName, tagline, copyrightYear (number), socialLinks (json) |
| NavigationMenu | data | location (enum), items (json) |
| Author | data | name (localized), role, bio, avatar (asset) |
| HeroSection | component | title (localized), subtitle, ctaText, style (enum), backgroundImage (asset) |
| SectionHeader | component | title (localized), subtitle, sortOrder (number) |
| FeatureCard | component | title (localized), description, iconName, sortOrder (number) |
| ContentBlock | component | title, body (richText), image (asset), imagePosition (enum), showBackground (boolean) |
| StatCard | component | value, label (localized), suffix, sortOrder (number) |
| TestimonialCard | component | quote (localized), personName, personRole, avatar (asset) |
| CallToAction | component | title (localized), description, buttonText, buttonLink, style (enum) |
| Page | page | title (localized), slug (unique), seoTitle, header (ref), footer (ref), sections (ref[], many) |
| BlogPost | page | title (localized), slug (unique), body (richText), author (ref), publishedDate (dateTime), featured (boolean) |

## License

MIT
