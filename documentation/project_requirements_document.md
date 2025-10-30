# Project Requirements Document (PRD)

## 1. Project Overview
This project, based on the **CodeGuide Starter Kit** (repository: `codeguide-chat-ui`), aims to deliver a robust foundation for building modern AI-driven chat applications. It brings together secure user authentication, reliable database management, and an interactive AI chat interface—complete with streaming responses and polished UI components—so developers can quickly spin up a ChatGPT-/Claude-/Gemini-style experience without reinventing the wheel.

At its core, this starter kit solves the problem of wiring up end-to-end functionality (auth → data storage → AI chat) in a cohesive, production-ready codebase. Success will be measured by how easily a developer can register users, persist and retrieve chat history, and engage with multiple AI models—all styled with a consistent design system and performant UX. Key objectives include secure per-user message isolation, smooth infinite scroll of past chats, real-time AI typing indicators, and turn-key theming (light/dark).  

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1):**
- User registration, sign-in, sign-out flows via **Clerk** (including protected routes with middleware).
- Chat message storage and retrieval in **Supabase** with Row-Level Security (RLS) tied to Clerk user IDs.
- AI-powered chat endpoint (`/api/chat/route.ts`) using **Vercel AI SDK** supporting OpenAI and Anthropic Claude.
- Refactored UI components: `ChatWindow.tsx` and `ChatInput.tsx`, built with **shadcn/ui** + **Tailwind CSS v4**.
- Infinite scroll for older messages via a paginated Supabase API endpoint and a client-side intersection observer.
- Global state management using **Redux Toolkit** (chat slice for messages, loading, typing, errors).
- Streaming response support ("AI is typing…") with real-time UI updates.
- Error handling and dismissible toast notifications for API failures.
- Theming (light/dark) with **next-themes**, auto-detecting system preferences.
- Local development consistency via a preconfigured **.devcontainer**.

**Out-of-Scope (Phase 1):**
- Third-party payment or subscription management.
- Admin dashboards or user management beyond basic auth.
- Voice or multimedia chat (audio/video).
- Analytics dashboards or usage reporting.
- Multi-language UI localization.
- Automated end-to-end testing suite (unit tests can be added later).

## 3. User Flow

A new user lands on the public home page and clicks **Sign Up** (or **Sign In** if returning). They complete the Clerk-hosted registration form (email/password or SSO), then are redirected to the main **Chat Dashboard**. Upon arrival, the user sees a full-width chat panel: at the top is the header with theme toggle and sign-out button, a scrollable message area in the center, and an input bar fixed at the bottom with a multiline text field and Send button.

When the user types a message and presses **Send**, the UI immediately adds their message to the chat history and shows a spinner or "AI is typing…" indicator while calling the `/api/chat/route.ts` endpoint. The AI response streams back word by word, updating the message bubble in real time. As the user scrolls up, an intersection observer triggers `fetchOlderMessages()` to load previous chat entries seamlessly. Any errors (network/API) surface as a dismissible toast at the bottom corner. The user can toggle between light and dark modes at any time, with their preference saved locally.

## 4. Core Features
- **Authentication & Authorization**: Secure signup/sign-in with Clerk; middleware-protected API routes.
- **Chat API Endpoint**: `/api/chat/route.ts` using Vercel AI SDK; supports streaming, multiple models.
- **Chat UI Components**: `ChatWindow.tsx`, `ChatInput.tsx`, message bubble styling (user vs. AI) via Tailwind + shadcn/ui.
- **State Management**: Redux Toolkit slice for chat state (messages[], isLoading, isTyping, error).
- **Infinite Scroll**: Paginated `/api/chat/history` endpoint; react-intersection-observer triggers fetchOlderMessages thunk.
- **Database & RLS**: Supabase PostgreSQL with Row-Level Security ensuring users only see their own messages.
- **Theming**: next-themes handling light/dark mode, system preference detection, and manual toggle.
- **Error Handling & Notifications**: API error codes mapped to Redux error state; shadcn/ui Toast for dismissible alerts.
- **Streaming Responses**: Real-time AI reply streaming with incremental render in the chat window.
- **Developer Environment**: .devcontainer with Docker, TypeScript strict mode, and recommended VS Code settings.

## 5. Tech Stack & Tools
- **Frontend Framework**: Next.js 15 (App Router) with React server & client components.
- **Language**: TypeScript (strict mode enabled).
- **Styling**: Tailwind CSS v4, CSS custom properties for theming.
- **UI Components**: shadcn/ui (headless, copy-into-project model).
- **Auth**: Clerk for user management and session middleware.
- **Database**: Supabase (PostgreSQL) with RLS policies.
- **AI SDK**: Vercel AI SDK (`@vercel/ai`) enabling chat streaming.
- **State Management**: Redux Toolkit with Thunks.
- **Theming**: next-themes for light/dark mode support.
- **Infinite Scroll**: react-intersection-observer or custom IntersectionObserver API.
- **Dev Environment**: Docker .devcontainer, VS Code settings, ESLint, Prettier.

## 6. Non-Functional Requirements
- **Performance**: Initial page load under 1s (cold). Chat response streaming latency under 500ms per chunk.
- **Scalability**: Supabase + Vercel should handle thousands of concurrent users; RLS ensures secure multi-tenancy.
- **Security**: All API routes require valid Clerk session; Supabase policies enforce user-level message isolation.
- **Compliance**: Data stored in PostgreSQL must comply with GDPR (user data erase on request).
- **Availability**: 99.9% uptime SLA; fallback UI if API is unreachable.
- **Usability**: Accessible via keyboard; responsive design for mobile & desktop; ARIA labels on interactive elements.
- **Maintainability**: Strict TypeScript, modular components, and clear folder structure to speed up future enhancements.

## 7. Constraints & Assumptions
- **Dependencies**: Requires Clerk and Supabase accounts with proper environment variables set (`NEXT_PUBLIC_…`, `SUPABASE_SERVICE_ROLE_KEY`).
- **AI Models**: Assumes availability of OpenAI/Claude API keys; rate limits must be monitored.
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge); no IE11 support.
- **Network**: Assumes stable internet; will not support offline chat.
- **Environment**: Developers use Docker-enabled workstations for the provided .devcontainer.

## 8. Known Issues & Potential Pitfalls
- **API Rate Limits**: OpenAI/Claude calls may hit quotas; implement exponential backoff and clear user messaging on 429 errors.
- **RLS Configuration**: Misconfigured Supabase policies can lock out legitimate users; use test policies first.
- **Streaming Failures**: Network interruptions mid-stream may leave partial messages; implement retry logic or fallback fetching full response.
- **Redux Overhead**: Introducing Redux may complicate the existing `useChat` hook logic; carefully migrate state in phases.
- **Theme Flash**: Brief flash of incorrect theme on load; mitigate by server-side rendering theme preference through a `<script>` snippet.


---
*End of PRD. All key details have been defined such that an AI or developer can proceed to create subsequent technical specifications without ambiguity.*