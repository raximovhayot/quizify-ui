# Documentation Index

Welcome to the Quizify UI documentation hub. This guide helps you navigate all available documentation based on your role and needs.

## 🎯 Navigation by Role

### 👨‍💻 For Developers

#### Getting Started
Start here if you're new to the project:

1. **[Main README](../README.md)** - Project overview, quick start, and tech stack
2. **[Frontend AI Agent Guide](./FRONTEND-AI-AGENT-GUIDE.md)** - Complete technical reference (essential read!)
3. **[Frontend Rebuild Plan](./FRONTEND-REBUILD-PLAN.md)** - Architecture optimization guide

#### Building Features
When implementing new features:

1. Review the **[Frontend AI Agent Guide](./FRONTEND-AI-AGENT-GUIDE.md)** for:
   - API endpoint specifications (60+ endpoints documented)
   - TypeScript interfaces and data models
   - Authentication patterns
   - State management patterns
   - Code examples

2. Follow the patterns in **[Frontend Rebuild Plan](./FRONTEND-REBUILD-PLAN.md)** for:
   - Folder structure organization
   - API client setup
   - WebSocket integration
   - TanStack Query hooks
   - Component architecture

#### Working with UI Components

- **[UI Primitives Cookbook](./ui-primitives-cookbook.md)** - Guide to shadcn/ui components
- **[Shared UI Components](../src/components/shared/ui/README.md)** - Custom component library
- **[Form Components](../src/components/shared/form/README.md)** - Reusable form controls
- **[Question Editor Guide](../src/features/instructor/quiz/components/QUESTION_EDITOR_GUIDE.md)** - Quiz question editing system

### 🤖 For AI Agents (GitHub Copilot, Cursor, etc.)

**Start Here**: **[Frontend AI Agent Guide](./FRONTEND-AI-AGENT-GUIDE.md)**

This comprehensive 2,300+ line document is specifically designed for AI agents to understand the entire system. It includes:

#### Complete System Reference
- Backend API architecture and all endpoints
- Authentication flows (Phone OTP + JWT)
- Role-based access control (RBAC)
- WebSocket real-time features
- Complete data models and TypeScript interfaces

#### Production Patterns
- API client with automatic token refresh
- Error handling with 20+ backend error codes
- State management (Zustand + TanStack Query)
- Security best practices (XSS prevention, validation)
- Testing strategies (Unit, Integration, E2E)

#### 800+ Lines of Code Examples
- Complete sign-up flow with OTP
- Quiz-taking with WebSocket auto-submit
- File upload with progress
- Next.js specific patterns:
  - Middleware for authentication
  - API routes (BFF pattern)
  - Server and Client Components
  - Layouts with auth

### 🏗️ For System Architects

**Primary Resource**: **[Frontend Rebuild Plan](./FRONTEND-REBUILD-PLAN.md)**

Comprehensive rebuild strategy with:

- **Technology Stack Recommendations**
  - What to keep, add, or replace
  - Rationale for each decision

- **7-Phase Implementation Plan**
  - Phase 1: Project setup & infrastructure
  - Phase 2: Core setup (TypeScript, ESLint, etc.)
  - Phase 3: API layer (simplified from 700 to 50 lines)
  - Phase 4: WebSocket integration
  - Phase 5: Authentication with NextAuth v5
  - Phase 6: Key component examples
  - Phase 7: Migration checklist

- **3-Week Timeline**
  - Week 1: Infrastructure
  - Week 2: Core features migration
  - Week 3: Polish & testing

## 📚 Documentation Structure

### Core Documentation

| Document | Purpose | Target Audience | Lines |
|----------|---------|----------------|-------|
| [FRONTEND-AI-AGENT-GUIDE.md](./FRONTEND-AI-AGENT-GUIDE.md) | Complete technical reference | AI Agents, Developers | 2,302 |
| [FRONTEND-REBUILD-PLAN.md](./FRONTEND-REBUILD-PLAN.md) | Architecture optimization plan | Architects, Lead Devs | 1,058 |
| [ui-primitives-cookbook.md](./ui-primitives-cookbook.md) | UI component guide | Frontend Devs | 400+ |

### Component Documentation

| Location | Description |
|----------|-------------|
| [/src/components/shared/ui/README.md](../src/components/shared/ui/README.md) | Shared UI component library |
| [/src/components/shared/form/README.md](../src/components/shared/form/README.md) | Reusable form components |
| [/src/features/instructor/quiz/components/QUESTION_EDITOR_GUIDE.md](../src/features/instructor/quiz/components/QUESTION_EDITOR_GUIDE.md) | Question editor system |

## 🚀 Quick Reference

### Common Tasks

#### Starting a New Feature

1. Check [API documentation](./FRONTEND-AI-AGENT-GUIDE.md#api-architecture) for available endpoints
2. Review [data models](./FRONTEND-AI-AGENT-GUIDE.md#data-models--dtos) for TypeScript interfaces
3. Follow [folder structure](./FRONTEND-REBUILD-PLAN.md#13-project-structure) conventions
4. Use [code examples](./FRONTEND-AI-AGENT-GUIDE.md#code-examples) as templates

#### Implementing Authentication

1. Review [Auth flows](./FRONTEND-AI-AGENT-GUIDE.md#authentication--authorization) in AI Agent Guide
2. See [NextAuth setup](./FRONTEND-REBUILD-PLAN.md#phase-5-authentication-with-nextauth) in Rebuild Plan
3. Check middleware patterns for route protection

#### Adding WebSocket Features

1. Read [WebSocket architecture](./FRONTEND-AI-AGENT-GUIDE.md#real-time-features-websocket)
2. Follow [WebSocket implementation](./FRONTEND-REBUILD-PLAN.md#phase-4-websocket-integration)
3. Use provided hooks and service examples

#### Building UI Components

1. Check [UI Primitives Cookbook](./ui-primitives-cookbook.md) for shadcn/ui
2. Review [Shared Components](../src/components/shared/ui/README.md)
3. Follow [UI/UX Guidelines](./FRONTEND-AI-AGENT-GUIDE.md#uiux-guidelines)

### Key Concepts

#### Quiz System Hierarchy

```
Quiz (Template)
  ↓ creates
Assignment (Scheduled Quiz)
  ↓ generates
Attempt (Student Session)
```

- **Quiz**: Reusable template with questions
- **Assignment**: Quiz instance with timeframe and students
- **Attempt**: Individual student's quiz session

#### API Structure

```
/api/v1/{role}/{resource}/{action}
```

**Roles**: `instructor`, `student`, `auth`, `account`

Examples:
- `/api/v1/instructor/quizzes/create`
- `/api/v1/student/attempts/submit`
- `/api/v1/auth/sign-up`

#### Authentication Flow

```
1. Phone OTP Sign-Up → 2. OTP Verification → 3. JWT Tokens
4. Access Token (15 min) + Refresh Token (7 days)
5. Auto-refresh via Axios interceptors
```

## 📖 Detailed Documentation

### Frontend AI Agent Guide (2,302 lines)

**[Read Full Document →](./FRONTEND-AI-AGENT-GUIDE.md)**

#### Table of Contents
1. Introduction
2. System Overview
3. API Architecture (60+ endpoints)
4. Authentication & Authorization
5. Data Models & DTOs (35+ TypeScript interfaces)
6. Frontend Architecture Recommendations
7. UI/UX Guidelines
8. Component Structure
9. State Management
10. Real-Time Features (WebSocket)
11. Error Handling
12. Security Best Practices
13. Code Examples (800+ lines)
14. Testing Strategy

**Key Highlights**:
- Complete API endpoint catalog with request/response DTOs
- Authentication flows: Phone OTP + JWT with token refresh
- RBAC implementation for INSTRUCTOR and STUDENT roles
- WebSocket integration via SockJS/STOMP
- Production-ready code examples for all major features
- Next.js 14+ specific patterns and optimizations

### Frontend Rebuild Plan (1,058 lines)

**[Read Full Document →](./FRONTEND-REBUILD-PLAN.md)**

#### Table of Contents
1. Overview & Executive Summary
2. Technology Stack (keep, add, remove)
3. Phase 1: Project Setup & Core Infrastructure
4. Phase 2: Core Setup (configs, types)
5. Phase 3: API Layer Implementation
6. Phase 4: WebSocket Integration
7. Phase 5: Authentication with NextAuth
8. Phase 6: Key Component Examples
9. Phase 7: Migration Checklist (3-week timeline)

**Key Highlights**:
- 90% reduction in API client code (700 → 50 lines)
- Complete Next.js 15 App Router folder structure
- Zustand for client state + TanStack Query for server state
- Full WebSocket service implementation
- NextAuth v5 configuration with middleware
- Detailed migration strategy from existing codebase

### UI Primitives Cookbook (400+ lines)

**[Read Full Document →](./ui-primitives-cookbook.md)**

Guide to using shadcn/ui components in the Quizify project, including:
- Component installation and usage
- Customization patterns
- Common use cases
- Accessibility considerations

## 🔍 Finding Information

### By Feature

| Feature | Documentation |
|---------|--------------|
| Authentication | [AI Agent Guide - Section 4](./FRONTEND-AI-AGENT-GUIDE.md#authentication--authorization) |
| Quiz Management | [AI Agent Guide - Quiz API](./FRONTEND-AI-AGENT-GUIDE.md#quiz-endpoints) |
| Assignments | [AI Agent Guide - Assignment API](./FRONTEND-AI-AGENT-GUIDE.md#assignment-endpoints) |
| Quiz Taking | [AI Agent Guide - Attempt API](./FRONTEND-AI-AGENT-GUIDE.md#attempt-endpoints) |
| Real-time Updates | [AI Agent Guide - WebSocket](./FRONTEND-AI-AGENT-GUIDE.md#real-time-features-websocket) |
| File Uploads | [AI Agent Guide - File API](./FRONTEND-AI-AGENT-GUIDE.md#file-endpoints) |
| State Management | [Rebuild Plan - Phase 3-4](./FRONTEND-REBUILD-PLAN.md#phase-3-api-layer-implementation) |
| Testing | [AI Agent Guide - Section 14](./FRONTEND-AI-AGENT-GUIDE.md#testing-strategy) |
| Security | [AI Agent Guide - Section 12](./FRONTEND-AI-AGENT-GUIDE.md#security-best-practices) |

### By Technology

| Technology | Documentation |
|------------|--------------|
| Next.js | [AI Agent Guide - Section 6.1](./FRONTEND-AI-AGENT-GUIDE.md#option-1-nextjs-highly-recommended) |
| TypeScript | [AI Agent Guide - Section 5](./FRONTEND-AI-AGENT-GUIDE.md#data-models--dtos) |
| TanStack Query | [Rebuild Plan - Phase 3](./FRONTEND-REBUILD-PLAN.md#phase-3-api-layer-implementation) |
| Zustand | [Rebuild Plan - Section 2](./FRONTEND-REBUILD-PLAN.md#add-) |
| WebSocket | [AI Agent Guide - Section 10](./FRONTEND-AI-AGENT-GUIDE.md#real-time-features-websocket) |
| shadcn/ui | [UI Primitives Cookbook](./ui-primitives-cookbook.md) |
| NextAuth | [Rebuild Plan - Phase 5](./FRONTEND-REBUILD-PLAN.md#phase-5-authentication-with-nextauth) |

## 🎓 Learning Path

### Path 1: New Developer (First Week)

**Day 1-2**: Understand the System
- [ ] Read [Main README](../README.md)
- [ ] Review [System Overview](./FRONTEND-AI-AGENT-GUIDE.md#system-overview)
- [ ] Study [Business Flows](./FRONTEND-AI-AGENT-GUIDE.md#business-flows)
- [ ] Understand [Key Concepts](./FRONTEND-AI-AGENT-GUIDE.md#key-concepts)

**Day 3-4**: Learn the Architecture
- [ ] Study [API Architecture](./FRONTEND-AI-AGENT-GUIDE.md#api-architecture)
- [ ] Review [Authentication](./FRONTEND-AI-AGENT-GUIDE.md#authentication--authorization)
- [ ] Understand [Data Models](./FRONTEND-AI-AGENT-GUIDE.md#data-models--dtos)
- [ ] Explore [Folder Structure](./FRONTEND-REBUILD-PLAN.md#13-project-structure)

**Day 5**: Setup & First Task
- [ ] Follow [Getting Started](../README.md#getting-started)
- [ ] Review [Code Examples](./FRONTEND-AI-AGENT-GUIDE.md#code-examples)
- [ ] Pick a small task from backlog
- [ ] Ask questions!

### Path 2: AI Agent Integration

**Step 1**: Load Context
- Feed the **[Frontend AI Agent Guide](./FRONTEND-AI-AGENT-GUIDE.md)** to your AI agent
- This provides complete system understanding

**Step 2**: Specify Task
- Use task templates from the guide
- Reference specific sections for context

**Step 3**: Generate Code
- AI will use documented patterns
- Code will follow established conventions
- TypeScript interfaces are pre-defined

**Step 4**: Review & Refine
- Check against [Security Best Practices](./FRONTEND-AI-AGENT-GUIDE.md#security-best-practices)
- Verify [Testing Strategy](./FRONTEND-AI-AGENT-GUIDE.md#testing-strategy)
- Run linting and type checking

### Path 3: Feature Development

**Planning Phase**
1. Review [API documentation](./FRONTEND-AI-AGENT-GUIDE.md#api-architecture) for available endpoints
2. Check [data models](./FRONTEND-AI-AGENT-GUIDE.md#data-models--dtos) for types
3. Design component structure using [UI guidelines](./FRONTEND-AI-AGENT-GUIDE.md#uiux-guidelines)

**Implementation Phase**
1. Create folder structure following [conventions](./FRONTEND-REBUILD-PLAN.md#13-project-structure)
2. Implement API service using [patterns](./FRONTEND-REBUILD-PLAN.md#phase-3-api-layer-implementation)
3. Add TanStack Query hooks for [data fetching](./FRONTEND-AI-AGENT-GUIDE.md#code-examples)
4. Build UI components with [shadcn/ui](./ui-primitives-cookbook.md)

**Testing Phase**
1. Write unit tests following [testing guide](./FRONTEND-AI-AGENT-GUIDE.md#testing-strategy)
2. Add integration tests for API calls
3. Ensure accessibility (a11y) standards

## 💡 Best Practices

### Code Organization
- Follow feature-based module structure
- Keep components small and focused
- Use TypeScript interfaces from docs
- Leverage custom hooks for logic reuse

### State Management
- Server state → TanStack Query
- Client state → Zustand stores
- Form state → React Hook Form
- URL state → Next.js routing

### Error Handling
- Use error service from [AI Agent Guide](./FRONTEND-AI-AGENT-GUIDE.md#error-handling)
- Map backend error codes to user messages
- Implement proper error boundaries
- Log errors for debugging

### Security
- Sanitize user input (DOMPurify)
- Validate with Zod schemas
- Use HTTPS in production
- Implement CSRF protection
- Regular dependency updates

## 🤝 Contributing

When contributing to documentation:

1. Keep it up-to-date with code changes
2. Use clear, concise language
3. Include code examples
4. Follow existing formatting
5. Update this index when adding new docs

## 📞 Getting Help

Can't find what you're looking for?

1. **Search the docs**: Use Ctrl+F in the guide documents
2. **Check examples**: [Code Examples section](./FRONTEND-AI-AGENT-GUIDE.md#code-examples)
3. **Review patterns**: [Rebuild Plan examples](./FRONTEND-REBUILD-PLAN.md#phase-6-key-components-examples)
4. **Ask the team**: Create a GitHub issue or discussion

---

**Documentation Version**: 1.0  
**Last Updated**: November 2025  
**Maintained by**: Quizify Development Team
