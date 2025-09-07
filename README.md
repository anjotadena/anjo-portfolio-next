# Anjo Tadena Portfolio

A modern, responsive portfolio website built with Next.js 15, React 19, and TypeScript. Features a clean design with smooth animations, blog integration via Hashnode GraphQL API, and comprehensive security headers.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue)

## Features

- **Modern Stack**: Next.js 15 with App Router and React 19
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Blog Integration**: Fetches blog posts from Hashnode via GraphQL API
- **Security**: Comprehensive Content Security Policy (CSP) headers
- **Performance**: Optimized images, fonts, and bundle splitting
- **Smooth Animations**: Custom typing effects and transitions
- **SEO Optimized**: Proper meta tags and structured data
- **Contact Form**: Integrated contact form with validation

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19.1.1
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: FontAwesome 6.7.1, React Icons 5.3.0
- **Animations**: Custom typing effects, smooth transitions
- **Forms**: React Hook Form with validation

### Backend Integration
- **GraphQL**: GraphQL Request for Hashnode API
- **Blog Platform**: Hashnode CMS integration
- **Contact**: Form handling with validation

### Development
- **Language**: TypeScript 5
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind plugin
- **Build Tool**: Next.js built-in bundler

## 📦 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anjotadena/anjo-portfolio-next.git
   cd anjo-portfolio-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── public/                 # Static assets
│   ├── assets/
│   │   ├── img/           # Images
│   │   └── tools/         # Technology icons
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── projects/
│   │   ├── resume/
│   │   └── layout.tsx     # Root layout
│   ├── assets/            # CSS and images
│   ├── components/        # Reusable components
│   │   ├── icons/
│   │   ├── layout/
│   │   └── ui/
│   ├── constants/         # App constants
│   ├── context/           # React contexts
│   ├── helpers/           # Utility functions
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── middleware.ts          # Next.js middleware
└── next.config.ts         # Next.js configuration
```

## Security Features

### Content Security Policy (CSP)
The application implements comprehensive CSP headers that:
- **Development**: Allows `unsafe-inline` and `unsafe-eval` for development tools and HMR
- **Production**: Strict CSP with specific allowlists for external resources
- **External Resources**: Allows GraphQL API calls to Hashnode and Vercel analytics

### Security Headers
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **X-XSS-Protection**: Enables XSS filtering

## Styling & UI

### Design System
- **Color Palette**: Custom Tailwind color scheme
- **Typography**: Google Fonts (REM font family)
- **Components**: Reusable UI components with consistent styling
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Support for system preference detection

### Animation Features
- **Typing Effect**: Custom typing animation for dynamic text
- **Smooth Scrolling**: CSS scroll-behavior with Next.js compatibility
- **Page Transitions**: Smooth transitions between routes
- **Loading States**: Custom loading indicators

## Blog Integration

The portfolio integrates with Hashnode for blog content:
- **GraphQL API**: Fetches posts from Hashnode's public API
- **Static Generation**: Pre-renders blog listing at build time
- **SEO Optimized**: Proper meta tags for blog posts
- **Responsive Cards**: Mobile-friendly blog post cards

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with zero configuration

### Manual Deployment
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

### Environment Variables
No environment variables are required for basic functionality. The Hashnode integration uses public APIs.

## 🔧 Configuration Files

- **`next.config.ts`**: Next.js configuration with security headers and webpack customization
- **`tailwind.config.ts`**: Tailwind CSS configuration with custom theme
- **`middleware.ts`**: Security headers and request handling
- **`vercel.json`**: Vercel deployment configuration (optional)

## Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Font Optimization**: Automatic font loading and display swap
- **Bundle Splitting**: Automatic code splitting and tree shaking
- **Static Generation**: Pre-renders pages at build time where possible
- **Package Optimization**: Optimized imports for React Icons and other packages

## Troubleshooting

### Common Issues

**CSP Violations in Production**
- The application includes comprehensive CSP headers that may need adjustment based on your deployment platform
- Check browser console for specific CSP violations
- Refer to `next.config.ts` and `middleware.ts` for CSP configuration

**Hydration Warnings**
- Browser extensions may cause hydration mismatches
- The application includes hydration error suppression for common browser extension attributes

**Port Conflicts**
- Development server defaults to port 3000
- Use `PORT=3001 npm run dev` to specify a different port

## License

Copyright © 2025 Anjo Tadena. All rights reserved.

## Contributing

This is a personal portfolio project, but suggestions and feedback are welcome through issues.

---

Built with by [Anjo Tadena](https://github.com/anjotadena)
