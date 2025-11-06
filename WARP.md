# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Electric Oracle Spirituals is a single-page e-commerce website for spiritual products and services. The entire application is a self-contained HTML file with inline CSS and JavaScript, using CDN-hosted external libraries.

## Architecture

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (no build process)
- **Styling**: Inline CSS with CSS Grid and Flexbox layouts
- **Icons**: Font Awesome 6.4.0 (CDN)
- **Payment Processing**: Paystack (inline.js)
- **Authentication**: Firebase Auth (Compat SDK 10.12.2)
- **Form Handling**: Formspree (for contact/inquiry/booking forms)

### Key Integration Points

1. **Firebase Authentication**
   - Configuration in lines 1578-1586 of index.html
   - Login gate enforced on page load (lines 1664-1669)
   - Users must sign in or create an account to access the site
   - Auth state persists using `LOCAL` persistence

2. **Paystack Payment Flow**
   - Public key: `pk_live_fcc8145dac2870df5237596bc9371a9811489ea0` (line 1383)
   - Product prices mapped in `productPriceMap` object (lines 1385-1417)
   - "Buy Now" buttons dynamically created (lines 1425-1459)
   - Checkout modal collects customer info before payment (lines 1462-1543)
   - Payment amounts converted to kobo (smallest currency unit)
   - Successful payments trigger email notifications via Formspree

3. **Formspree Form Endpoints**
   - Booking form: `https://formspree.io/f/xovkvnle` (line 1167)
   - Contact form: `https://formspree.io/f/xrbybaao` (line 1213)
   - Inquiry form: `https://formspree.io/f/xanpnddg` (line 1301)
   - Payment notifications reuse contact form endpoint (line 1548)

## Development Workflow

### Local Development
```powershell
# Serve the site locally
python -m http.server 8000
# Or use any static file server
```

Then open `http://localhost:8000` in your browser.

### Testing Payment Integration
- Use Paystack test keys for development
- Test card: 4084 0840 8408 4081 (CVV: 408, Expiry: any future date)
- Replace `pk_live_*` with `pk_test_*` key in line 1383 when testing

### Firebase Configuration
- Firebase config object at lines 1578-1585
- **IMPORTANT**: Never commit the `.env.txt` file. It contains the Firebase API key
- The API key is also hardcoded in index.html (line 1579) and should be managed via environment variables in production

## Code Structure

### Product Cards
- Products defined in HTML (lines 601-1152)
- Each card has: image, title, description, price, "Inquire" button
- "Buy Now" buttons added dynamically via JavaScript (line 1425)

### Modal System
Three modals handle user interactions:
1. **Inquiry Modal** (`#inquiryModal`): Product inquiries → Formspree
2. **Checkout Modal** (`#checkoutModal`): Payment info collection → Paystack
3. **Login Modal** (`#loginModal`): Firebase authentication

### JavaScript Organization (lines 1381-1850)
- Lines 1382-1423: Paystack configuration and utilities
- Lines 1425-1459: Dynamic "Buy Now" button generation
- Lines 1461-1543: Checkout modal and payment handling
- Lines 1545-1575: Payment notification via email
- Lines 1577-1669: Firebase Auth setup and login gate
- Lines 1671-1773: DOMContentLoaded handlers, mobile menu, inquiry modal
- Lines 1775-1838: Booking form with payment integration
- Lines 1840-1849: Form email handlers

## Common Tasks

### Adding a New Product
1. Copy an existing product card HTML block (e.g., lines 602-616)
2. Update product image, name, description, and price
3. Add product to `productPriceMap` object (around line 1385) if enabling "Buy Now"
4. Ensure button has correct `data-product` and `data-price` attributes

### Modifying Payment Configuration
- Update Paystack public key at line 1383
- Modify `productPriceMap` for product prices (lines 1385-1417)
- Payment amounts must be in Naira (kobo conversion handled by `formatKobo()`)

### Updating Firebase Settings
- Modify `firebaseConfig` object (lines 1578-1585)
- Ensure `.env.txt` is in `.gitignore`
- Consider moving sensitive keys to environment variables for production deployment

### Changing Form Endpoints
- Booking: line 1167
- Contact: line 1213
- Inquiry: line 1301
- Update Formspree form IDs in each `action` attribute

## Deployment

### Pre-Deployment Checklist
1. Verify Firebase config points to production project
2. Ensure Paystack key is set to `pk_live_*` (not test key)
3. Test all form submissions reach correct email
4. Confirm all external CDN resources are accessible
5. Validate payment flow end-to-end

### Static Hosting
This is a static site (single HTML file). Deploy to:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Any CDN or web server

No build step required—just upload `index.html`.

## Security Considerations

### API Keys
- Firebase API key is public-facing (acceptable for Firebase Auth)
- Paystack public key is safe to expose
- **CRITICAL**: Never commit `.env.txt` file
- For production, use environment variables and server-side key injection

### Payment Security
- All transactions processed by Paystack (PCI-compliant)
- Never store card details in this application
- Payment amounts validated server-side by Paystack

### Authentication
- Firebase handles password hashing and security
- Auth persistence set to LOCAL (survives browser refreshes)
- Login gate prevents unauthorized access to site content

## Contact and Form Configuration

All forms route to owner's email via Formspree:
- **Email**: electricoraclespiritual@gmail.com
- **Phone**: +2348060537893
- **Location**: NNEWI ANAMBRA, NIGERIA

Social media links (lines 1241-1256):
- Instagram: electric_spiritual_store
- Facebook, TikTok, YouTube, WhatsApp links included

## Notes
- No package.json or dependencies—pure static HTML
- All styling is inline in `<style>` tag (lines 9-552)
- JavaScript is inline in `<script>` tag (lines 1381-1850)
- Responsive design breakpoints at 768px and 480px (lines 496-551)
