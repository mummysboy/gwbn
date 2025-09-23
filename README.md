# Golden West Business News - AI-Powered Publishing Platform

A mobile-first AI-powered publishing platform built with Next.js, TypeScript, and Tailwind CSS. This project enables voice-to-text publishing with AI enhancement for professional journalism using local processing - no external API keys or environment variables required!

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Cloud**: [AWS](https://aws.amazon.com/) ready
- **Deployment**: Vercel/AWS Amplify compatible

## 📱 Mobile-First Features

- Responsive design optimized for mobile devices
- Touch-friendly interface components
- Progressive Web App (PWA) capabilities
- Mobile navigation with slide-out menu
- Optimized performance for mobile networks
- Dark mode support

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- AWS account (for cloud features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mummysboy/gwbn.git
cd gwbn
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Optional: Set up environment variables (not required!):
```bash
cp env.example .env.local
```

The application works without any environment variables! All features use local processing.
Environment variables are only needed for optional AWS integrations.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with mobile-first utilities
│   ├── layout.tsx         # Root layout with mobile optimizations
│   └── page.tsx           # Homepage with mobile-first design
├── components/            # Reusable components
│   ├── ui/               # UI components (Button, etc.)
│   ├── layout/           # Layout components (Container)
│   └── navigation/       # Navigation components (MobileNav)
└── lib/                  # Utility functions and configurations
    ├── aws-config.ts     # AWS configuration utilities
    └── utils.ts          # General utility functions
```

## 🎨 Design System

The project includes a comprehensive design system optimized for mobile:

- **Color Palette**: Custom CSS variables for consistent theming
- **Typography**: Inter font with mobile-optimized sizing
- **Spacing**: Mobile-first spacing scale
- **Components**: Touch-friendly button sizes and interactions
- **Responsive Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

## ☁️ AWS Integration

The project is configured for AWS services:

- **Configuration**: Centralized AWS config in `src/lib/aws-config.ts`
- **Environment Variables**: Secure credential management
- **Local Processing**: 
  - Voice-to-text transcription (local processing)
  - AI article generation (local processing)
  - No external API dependencies
  - Works offline

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### AWS Amplify

1. Install AWS CLI and configure credentials
2. Run: `npm run build`
3. Deploy to AWS Amplify:
```bash
amplify init
amplify add hosting
amplify publish
```

## 📱 Mobile Optimization

- **Viewport Configuration**: Optimized for mobile devices
- **Touch Targets**: Minimum 44px touch targets
- **Performance**: Optimized images and lazy loading
- **PWA Ready**: Service worker and manifest configuration
- **Responsive Images**: Next.js Image component with mobile optimization

## 🎯 Development Guidelines

### Mobile-First Approach
- Design for mobile first, then enhance for larger screens
- Use mobile-friendly touch targets (minimum 44px)
- Test on real devices and various screen sizes
- Optimize for mobile performance

### Code Standards
- Use TypeScript for type safety
- Follow Next.js best practices
- Implement proper error boundaries
- Use semantic HTML for accessibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples in the components

---

Built with ❤️ for Golden West Business News using Next.js, TypeScript, Tailwind CSS, and AWS
# Deployment trigger - Tue Sep 23 16:36:02 PDT 2025
# Deployment trigger
