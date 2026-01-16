# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a landing page (LP) for "hitokiwa", a foreign worker recruitment service specializing in the construction industry in Japan. The site targets construction companies looking to hire foreign workers with specific technical skills (特定技能) and technical intern trainees (技能実習生).

## Tech Stack

- **Frontend**: Static HTML/CSS/JavaScript (no frameworks)
- **Backend**: Vercel Serverless Functions (Node.js 18.x)
- **Email Service**: Resend API for contact form submissions
- **Deployment**: Vercel
- **No build process required** - pure static files

## Development

### Local Development

Open `index.html` directly in a browser for frontend development. For testing the contact form API, deploy to Vercel or use Vercel CLI:

```bash
vercel dev
```

### Deployment

Push to the main branch to trigger automatic Vercel deployment, or use:

```bash
vercel --prod
```

### Environment Variables (Vercel)

- `RESEND_API_KEY` - Required for contact form email delivery

## Architecture

### File Structure

- `index.html` - Single-page application with all sections
- `css/style.css` - Main stylesheet with CSS variables in `:root`
- `css/card-flip.css` - Optional card flip animation styles (not currently used)
- `js/main.js` - All client-side interactivity
- `api/contact.js` - Vercel serverless function for form submission

### Page Sections (in order)

1. Hero - Talent cards gallery, brand name, stats, CTA buttons
2. Cases (導入事例) - Customer testimonials
3. Features (特徴) - Three feature cards with images
4. Zero Cost Banner - Promotional banner
5. Jobs (職種) - Available job types grid with floating animation
6. Flow (流れ) - 4-step recruitment process
7. FAQ - Accordion-style Q&A
8. Contact - Form with validation

### CSS Architecture

- CSS variables defined in `:root` for colors, spacing, and fonts
- Responsive breakpoints: 1200px, 1024px, 992px, 768px, 576px
- Animation classes: `.animate-on-scroll`, `.fade-up`, `.slide-left`, `.slide-right`, `.blur-reveal`
- Mobile menu toggles via `.active` class

### JavaScript Features

- Hamburger menu toggle
- Smooth scroll for anchor links
- Intersection Observer for scroll animations (triggers once at 15% visibility)
- 3D tilt effect on job cards (desktop only)
- FAQ accordion
- Contact form validation and async submission

### Contact Form API

The serverless function at `api/contact.js` receives POST requests with JSON body containing: `company`, `name`, `email`, `phone`, `inquiry_type`, `contact_method`, `preferred_time`, `message`. Emails are sent via Resend API.

## Customization Notes

- **Colors**: Modify CSS variables in `:root` (e.g., `--primary-color: #0066cc`)
- **Images**: All images are in `/images` directory, referenced via relative paths
- **Fonts**: Google Fonts (Inter, Noto Sans JP, Outfit) loaded via CDN
- **Form recipient**: Change email in `api/contact.js` line 39

## WordPress Integration

This LP is designed for potential WordPress embedding. When integrating:
1. Update asset paths to use WordPress template directory functions
2. Copy CSS/JS/images to theme directory
3. Embed HTML content in a page template or custom HTML blocks
