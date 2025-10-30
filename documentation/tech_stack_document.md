# Tech Stack Document for CodeGuide Starter Kit

This document explains the technology choices behind the **codeguide-chat-ui** repository (also called the CodeGuide Starter Kit). It’s written in everyday language so anyone—technical or not—can understand why each tool or library was chosen and how it fits into the project.

## Frontend Technologies

These are the tools that power what users see and interact with in their browser:

- **Next.js 15 (App Router)**  
  A React framework that handles routing, server-side rendering, and static site generation. It makes pages load fast and lets us mix server and client code easily.

- **React**  
  The core library for building the user interface. We write reusable components (buttons, text areas, chat windows) with React.

- **TypeScript (strict mode)**  
  A JavaScript superset that adds type checking. It helps catch errors early and makes code easier to understand and maintain.

- **Tailwind CSS v4**  
  A utility-first styling framework. Instead of writing custom CSS, we use predefined classes (e.g., `flex`, `p-4`) to build responsive, consistent designs quickly.

- **shadcn/ui**  
  A collection of pre-built, customizable React components (buttons, scroll areas, toasts). We copy them into the project for full control and consistent styling.

- **next-themes**  
  A small library to handle light/dark mode toggling. It automatically detects the user’s system preference and lets them switch themes.

- **Redux Toolkit**  
  (Optional extension) A modern approach to managing global state in React. We plan to use it to track chat messages, loading states, typing indicators, and errors in one central place.

- **react-intersection-observer**  
  (Optional extension) A library to detect when elements (like the top of the chat list) scroll into view. We’ll use it to trigger loading older messages.

- **Toast Component**  
  From **shadcn/ui**, used to show dismissible notifications (for errors or important messages).

## Backend Technologies

These tools power the server-side logic, data storage, and AI integrations:

- **Next.js API Routes**  
  Serverless functions built into Next.js under `/src/app/api`. They handle incoming chat messages, fetch history, and stream AI responses.

- **Vercel AI SDK**  
  A library that simplifies talking to AI models. It supports streaming responses and works with multiple providers (OpenAI and Anthropic Claude).

- **Supabase**  
  An open-source backend that gives us a PostgreSQL database, authentication helpers, and real-time capabilities. We use it to store and retrieve chat messages.

- **Row-Level Security (RLS)**  
  A PostgreSQL feature configured in Supabase. It ensures each user only sees their own messages by tying records to specific user IDs.

- **Clerk Middleware**  
  A piece of code that runs before every protected route. It checks if the user is signed in and blocks access if they’re not.

## Infrastructure and Deployment

How the project is hosted, versioned, and kept consistent across developers:

- **Vercel**  
  The hosting platform for Next.js. It automatically deploys every push to the main branch and provides preview URLs for pull requests.

- **Git & GitHub**  
  Version control system and repository hosting. We use branches and pull requests to review changes and maintain a clear history.

- **.devcontainer (Docker)**  
  A predefined development container for Visual Studio Code. It ensures every developer has the same Node.js version, environment variables, and toolchain.

- **CI/CD Pipelines**  
  Built into Vercel (and optionally GitHub Actions). They run tests (if added) and deploy the site automatically when code is merged.

## Third-Party Integrations

External services that add specialized functionality:

- **Clerk**  
  Handles user sign-up, sign-in, session management, and profile data out of the box. No need to roll your own authentication.

- **Supabase**  
  Manages our database and real-time subscriptions. Also supplements authentication and storage features.

- **OpenAI & Anthropic Claude**  
  AI model providers. Through the Vercel AI SDK, we can switch between different AI engines for chat responses.

- **Vercel AI SDK**  
  The bridge between our frontend/backend and the AI providers. It offers hooks like `useChat` to simplify streaming chats.

## Security and Performance Considerations

Steps we’ve taken to keep data safe and the app running smoothly:

- **Authentication & Authorization**  
  - Clerk enforces secure user sessions.  
  - Supabase RLS ensures users only access their own data.

- **Secure API Endpoints**  
  All chat and history routes are wrapped with Clerk middleware. Unauthenticated requests are blocked.

- **Streaming Responses**  
  The AI chat endpoint streams tokens as they arrive, giving users instant “AI is typing…” feedback.

- **Type Safety**  
  TypeScript in strict mode reduces runtime errors by catching issues at compile time.

- **Optimized Styling**  
  Tailwind CSS generates only the styles we use, keeping CSS output small and pages fast.

- **Caching & Edge Functions**  
  (Optional) Next.js supports edge caching for static assets and serverless functions, which can further speed up response times.

## Conclusion and Overall Tech Stack Summary

In building the CodeGuide Starter Kit, we chose tools that prioritize:

- **Speed of Development:** Next.js, shadcn/ui, and Tailwind CSS let us scaffold features quickly.
- **Security:** Clerk and Supabase RLS protect user data end to end.
- **Scalability:** Serverless functions on Vercel and a managed PostgreSQL database can grow with demand.
- **Flexibility:** The Vercel AI SDK supports multiple AI providers, and Redux Toolkit (if used) offers predictable state management.

This combination gives you a modern, secure, and highly customizable foundation for creating AI-powered chat applications—complete with authentication, persistent conversation history, and a polished user experience.