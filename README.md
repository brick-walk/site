# Portfolio Website Template

A clean, minimal portfolio website template inspired by professional designer portfolios. Perfect for artists, designers, photographers, and creatives who want to showcase their work.

## Features

- **Responsive Design** - Looks great on desktop, tablet, and mobile
- **Portfolio Grid** - Masonry-style image grid for showcasing work
- **Multiple Pages** - Home, Portfolio, About, Services, Blog, Contact, FAQ
- **Dropdown Navigation** - Organized navigation with dropdown menus
- **Mobile-Friendly Menu** - Hamburger menu for mobile devices
- **Contact Form Ready** - Prepared for integration with form services
- **Lightweight** - Pure HTML, CSS, and JavaScript (no frameworks required)

## Pages Included

| Page | Description |
|------|-------------|
| `index.html` | Homepage with portfolio grid |
| `portfolio.html` | Categorized portfolio gallery |
| `project.html` | Individual project detail page |
| `about.html` | About page with bio, press, and testimonials |
| `services.html` | Services/commissions information |
| `blog.html` | Blog listing page |
| `contact.html` | Contact form |
| `faq.html` | Frequently asked questions |

## Deploying to GitHub Pages

### Option 1: Deploy from Repository Root

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to **Settings** → **Pages**
4. Under "Source", select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**
7. Your site will be live at `https://yourusername.github.io/repository-name/`

### Option 2: Using GitHub Actions

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Push to GitHub
3. Go to **Settings** → **Pages**
4. Under "Source", select **GitHub Actions**

## Customization

### 1. Update Your Information

Search and replace these placeholders throughout all HTML files:
- `YOUR NAME` - Your name
- `DESIGNER` - Your profession/tagline
- `Your Name` - Your name in copyright
- `yourhandle` / `yourpage` / `yourchannel` / `yourprofile` - Your social media handles
- `hello@yourdomain.com` - Your email address
- Update all placeholder images with your own work

### 2. Customize Colors

Edit the CSS variables in `styles.css`:

```css
:root {
  --color-background: #f5f5f0;  /* Page background */
  --color-text: #333333;         /* Main text color */
  --color-text-light: #666666;   /* Secondary text */
  --color-border: #e0e0e0;       /* Borders */
  --color-accent: #1a1a1a;       /* Accent/heading color */
}
```

### 3. Change Fonts

The template uses Google Fonts. To change fonts:
1. Update the Google Fonts link in each HTML file's `<head>`
2. Update the font variables in `styles.css`:

```css
:root {
  --font-heading: 'Your Heading Font', serif;
  --font-body: 'Your Body Font', sans-serif;
}
```

### 4. Add Your Images

Replace the Unsplash placeholder images with your own:
- Place images in an `images/` folder
- Update `src` attributes in HTML files
- Recommended sizes: 600x600px for grid, 1200x800px for features

### 5. Set Up Contact Form

The contact form is configured to work with [Formspree](https://formspree.io/):

1. Create a free Formspree account
2. Create a new form and get your form ID
3. Replace `your-form-id` in `contact.html`:

```html
<form action="https://formspree.io/f/your-form-id" method="POST">
```

Alternative form services:
- [Netlify Forms](https://www.netlify.com/products/forms/)
- [Basin](https://usebasin.com/)
- [Getform](https://getform.io/)

## File Structure

```
portfolio-template/
├── index.html          # Homepage
├── portfolio.html      # Portfolio gallery
├── project.html        # Project detail template
├── about.html          # About page
├── services.html       # Services page
├── blog.html           # Blog listing
├── contact.html        # Contact page
├── faq.html            # FAQ page
├── styles.css          # All styles
├── script.js           # JavaScript functionality
├── README.md           # This file
└── images/             # Your images (create this folder)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This template is free to use for personal and commercial projects. Attribution is appreciated but not required.

---

Made with care for creatives who want a beautiful, simple portfolio.
