# Frontend Guideline Document

This document outlines the architecture, design principles, styling, and technologies used in the **codeguide-chat-ui** Next.js starter kit. It serves as a clear guide for anyone to understand and extend the frontend setup, even without deep technical background.

## 1. Frontend Architecture

### Overview
- **Framework**: Next.js 15 (App Router) enables server and client components, file-based routing, and built-in optimizations.  
- **Language**: TypeScript in strict mode for better type safety and fewer runtime errors.  
- **UI Library**: shadcn/ui (New York style) for headless, fully customizable components.  
- **Styling**: Tailwind CSS v4 with CSS custom properties for dynamic theming.  
- **Authentication**: Clerk for sign-in, sign-out, and route protection.  
- **Database**: Supabase (PostgreSQL) with Row-Level Security (RLS) tied to Clerk user IDs.  
- **AI Chat Integration**: Vercel AI SDK with streaming responses from OpenAI or Anthropic Claude.  
- **Theming**: next-themes for light/dark mode switching based on system preferences.  
- **Environment**: .devcontainer for a consistent Docker-based development setup.

### Scalability, Maintainability & Performance
- **Scalability**: Modular folder structure (`/src/app`, `/src/components`, `/src/lib`), component-driven UI, and separation between server/client logic allow the project to grow without clutter.  
- **Maintainability**: Type safety, reusable UI components, and clear conventions (e.g., copy shadcn/ui components into the project) make it easy to onboard new developers and add features.  
- **Performance**: Next.js automatic code splitting, streaming server responses, and Tailwind’s utility classes minimize CSS bundle size. Built-in image and asset optimizations further improve load times.

## 2. Design Principles

### Key Principles
1. **Usability**: Simple and predictable interactions—clear buttons, consistent form controls, and visible loading states (e.g., “AI is typing…”).  
2. **Accessibility (a11y)**: Semantic HTML, keyboard-navigable components, and support for screen readers through proper ARIA attributes.  
3. **Responsiveness**: Mobile-first design using Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`) to adapt layouts seamlessly across devices.  
4. **Consistency**: Unified color palette, typography, and spacing across all components.  

### Application of Principles
- Buttons and textareas include focus and hover states for clarity.  
- Toast notifications announce important messages without blocking content.  
- Form inputs have associated labels, and color contrast meets WCAG AA standards.  
- Layout components use flexbox and grid utilities to rearrange content for mobile, tablet, and desktop.

## 3. Styling and Theming

### Styling Approach
- **Methodology**: Utility-first CSS with Tailwind v4—no separate BEM or SMACSS layers.  
- **Customization**: Tailwind config overrides (colors, font sizes, breakpoints) and CSS custom properties for theme switches.  
- **Component Styles**: Copy shadcn/ui component files into `/src/components/ui/` and extend them with additional Tailwind classes.

### Theming
- **Library**: next-themes detects system preference and allows manual toggle.  
- **Implementation**: Wrap the app in `ThemeProvider` in `layout.tsx`. Use `data-theme` attributes or Tailwind’s `dark:` variant to apply dark mode styles.

### Design Style & Color Palette
- **Style**: Modern flat design with subtle depth—minimal shadows, clear edges, and vibrant accents.  
- **Font**: Inter (sans-serif) for readability and a clean, contemporary look.  

Light Mode Palette  
• Primary: #3B82F6 (blue-500)  
• Secondary: #6B7280 (gray-500)  
• Accent: #10B981 (emerald-500)  
• Background: #FFFFFF  
• Surface: #F3F4F6 (gray-100)  
• Text Primary: #111827 (gray-900)  
• Text Secondary: #4B5563 (gray-600)  

Dark Mode Palette  
• Primary: #60A5FA (blue-400)  
• Secondary: #9CA3AF (gray-400)  
• Accent: #34D399 (emerald-400)  
• Background: #1F2937 (gray-800)  
• Surface: #374151 (gray-700)  
• Text Primary: #F9FAFB (gray-50)  
• Text Secondary: #D1D5DB (gray-300)

## 4. Component Structure

### Organization
- `/src/components/ui/`: Base UI primitives (Button, Textarea, ScrollArea, Toast).  
- `/src/components/chat/`: Chat-specific components like `ChatWindow.tsx` and `ChatInput.tsx`.  
- `/src/lib/`: Helpers and client configs (e.g., `supabase.ts`).  
- `/src/app/`: Next.js routes, layouts, and page entry points.

### Reusability and Maintainability
- Components are self-contained: own styles and props.  
- Use Prop drilling sparingly; prefer Context or Redux for shared state.  
- Favor composition over inheritance: build complex UIs by composing smaller pieces.

## 5. State Management

### Approach
- **Library**: Redux Toolkit for global state (optional initial setup) alongside React Query or local hook state for data fetching.  
- **Pattern**: Create a `chat` slice to handle:
  • messages (array)  
  • isLoading (boolean)  
  • isTyping (boolean)  
  • error (string|null)

### Data Flow
1. User types message → dispatch `sendMessage` thunk.  
2. Thunk calls `/api/chat/route` and streams response via Vercel AI SDK.  
3. On each stream chunk, dispatch action to append partial AI message.  
4. Errors caught in thunk update `error` state and trigger Toast.
5. `fetchOlderMessages` thunk loads paginated history and prepends to messages array.

## 6. Routing and Navigation

- **Library**: Next.js App Router (`/src/app`).  
- **Public vs. Protected**: `middleware.ts` uses Clerk to guard protected routes (chat pages).  
- **Structure**: Layout in `layout.tsx` wraps all pages. Nested folders define nested layouts.  
- **Navigation**: Link between pages with `<Link>` from `next/link`. Use dynamic routes under `/app/profile/[id]` if needed.

## 7. Performance Optimization

- **Code Splitting**: Next.js automatically splits pages; use `next/dynamic` for large, non-critical components.  
- **Lazy Loading**: Images via `next/image` with `loading="lazy"`.  
- **Asset Optimization**: Tree-shake Tailwind by purging unused classes. Minify CSS/JS in production.  
- **Streaming**: Vercel AI SDK streams partial responses, reducing time-to-first-byte for chat replies.  
- **Memoization**: Use `React.memo` and `useCallback` for stable props in list items.

## 8. Testing and Quality Assurance

### Unit & Integration Tests
- **Frameworks**: Jest with React Testing Library for React components and Redux slices.  
- **Coverage**: Test critical UI interactions (typing, sending, receiving messages, error states).  

### End-to-End (E2E)
- **Tool**: Cypress for full user journeys: sign-in, send message, infinite scroll history.  
- **CI Integration**: Run tests on every pull request via GitHub Actions or similar.

### Linting & Formatting
- **ESLint** with Next.js and TypeScript plugins.  
- **Prettier** for consistent code style.  
- **Commit Hooks**: Husky + lint-staged to auto-run linters before commits.

## 9. Conclusion and Summary

This guideline presents a complete picture of the **codeguide-chat-ui** frontend:  
- **Architecture** built on Next.js, TypeScript, and modular components ensures scalability.  
- **Design principles** guarantee usability, accessibility, and a responsive experience.  
- **Styling** uses Tailwind CSS with a modern flat look and a clear color palette for light and dark modes.  
- **Component-driven** structure and **Redux Toolkit** for state management enable clear data flow and maintainability.  
- **Routing** and **middleware** protect user data, while **performance** optimizations keep the app snappy.  
- **Testing** practices ensure reliability during development and deployment.

By following these guidelines, developers can confidently build, extend, and maintain a polished AI chat application on a solid frontend foundation.