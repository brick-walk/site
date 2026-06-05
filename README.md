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
Note: all of these pages are in `src/pages`

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

## TODO

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
