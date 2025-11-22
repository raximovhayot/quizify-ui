# Quizify UI

Modern, production-ready frontend for the Quizify quiz management platform built with Next.js 15, TypeScript, and React 19.

## 🚀 Overview

Quizify is a comprehensive quiz management platform designed for educational settings, enabling instructors to create, manage, and analyze quizzes while providing students with an intuitive interface to take tests and track their progress.

### Key Features

- **Role-Based Access**: Separate dashboards for instructors and students
- **Real-Time Updates**: WebSocket integration for live quiz notifications
- **Modern Stack**: Next.js 15 App Router, React 19, TypeScript, TanStack Query
- **Type-Safe**: End-to-end type safety with TypeScript and Zod validation
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and shadcn/ui
- **Internationalization**: Multi-language support (English, Russian, Uzbek)
- **Production-Ready**: Comprehensive testing, error handling, and security measures

## 📚 Documentation

### For Developers

- **[Frontend AI Agent Guide](./docs/FRONTEND-AI-AGENT-GUIDE.md)** - Complete technical reference for AI agents (GitHub Copilot) to build production-ready frontend
  - 60+ API endpoint specifications
  - TypeScript interfaces and data models
  - Authentication flows (Phone OTP + JWT)
  - WebSocket integration patterns
  - 800+ lines of production code examples
  - Testing strategies and best practices

- **[Frontend Rebuild Plan](./docs/FRONTEND-REBUILD-PLAN.md)** - Comprehensive 7-phase migration strategy for optimizing the existing codebase
  - Complete folder structure for Next.js 15
  - Simplified API client (90% less code)
  - State management with Zustand + TanStack Query
  - WebSocket service implementation
  - 3-week migration timeline with detailed checklists

- **[Documentation Index](./docs/README.md)** - Central hub for all documentation with navigation paths

### Quick Links

- [UI Primitives Cookbook](./docs/ui-primitives-cookbook.md)
- [Component Documentation](./src/components/shared/ui/README.md)
- [Form Components](./src/components/shared/form/README.md)
- [Question Editor Guide](./src/features/instructor/quiz/components/QUESTION_EDITOR_GUIDE.md)

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui

### State & Data

- **Server State**: TanStack Query v5 (React Query)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: next-intl

### UI Components

- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Rich Text**: Tiptap (with math support via KaTeX)
- **Math Input**: MathLive
- **Charts**: Recharts
- **Notifications**: Sonner
- **Animations**: Framer Motion

### Developer Tools

- **Testing**: React Testing Library + Playwright
- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Build Tool**: Turbopack

## 🏁 Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/raximovhayot/quizify-ui.git
cd quizify-ui

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# WebSocket (optional for real-time features)
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:ts          # TypeScript type checking
npm run typecheck        # Type check without emitting
npm run pretty           # Format code with Prettier

# Testing
Run Playwright E2E tests and local component testing with React Testing Library.

npm run e2e              # Run Playwright E2E tests

# Internationalization
npm run i18n:check       # Check i18n message files
```

### Project Structure

```
quizify-ui/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public-only)/      # Public routes (sign-in, sign-up)
│   │   ├── instructor/         # Instructor dashboard
│   │   └── student/            # Student dashboard
│   ├── components/             # Shared components
│   │   ├── shared/             # Reusable UI components
│   │   └── providers/          # React context providers
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication
│   │   ├── instructor/         # Instructor features
│   │   ├── student/            # Student features
│   │   └── profile/            # User profile
│   ├── lib/                    # Utilities and helpers
│   ├── i18n/                   # Internationalization
│   └── types/                  # TypeScript type definitions
├── docs/                       # Documentation
├── public/                     # Static assets
└── scripts/                    # Build and utility scripts
```

## 🎯 User Workflows

### Instructor Flow

1. **Sign Up/Sign In** → Phone OTP verification
2. **Create Quiz** → Add questions with multiple types (MCQ, True/False, Fill-in-blank, Essay)
3. **Create Assignment** → Schedule quiz with start/end times
4. **Register Students** → Invite students to assignment
5. **Monitor Progress** → View real-time attempt notifications
6. **Analytics** → Detailed performance insights

### Student Flow

1. **Sign Up/Sign In** → Phone OTP verification
2. **Join Assignment** → Via access code or invitation
3. **Take Quiz** → Timed quiz session with auto-submit
4. **View Results** → Immediate feedback and scores
5. **Track Performance** → Historical data and analytics

## 🔒 Security

- **Authentication**: JWT with automatic token refresh
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schemas for all forms
- **XSS Prevention**: Content sanitization with DOMPurify
- **CSRF Protection**: NextAuth built-in protection
- **Secure Headers**: Next.js security headers configuration

## 🌐 API Integration

The frontend connects to the Quizify backend REST API:

- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer tokens
- **Path Structure**: `/api/v1/{role}/{resource}/{action}`
- **Real-Time**: WebSocket (STOMP protocol) for live updates

See [Frontend AI Agent Guide](./docs/FRONTEND-AI-AGENT-GUIDE.md) for complete API documentation.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

## 📞 Support

For questions, issues, or support:

- GitHub Issues: [Report a bug](https://github.com/raximovhayot/quizify-ui/issues)
- Documentation: [Frontend AI Agent Guide](./docs/FRONTEND-AI-AGENT-GUIDE.md)

---

**Built with ❤️ for modern education**
