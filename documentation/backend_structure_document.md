# Backend Structure Document

## 1. Backend Architecture

This backend is built around a modern serverless and edge-friendly design, powered by Next.js 15’s App Router. It uses well-established patterns and frameworks to ensure it can grow smoothly, stay easy to maintain, and perform well under load.

- **Framework & Design Patterns**
  - Next.js 15 with App Router for file-based routing and seamless server/client components.
  - Serverless functions (API routes) for backend logic, minimizing operational overhead.
  - Component-driven architecture: UI logic in React components, data access in API routes, and shared utilities in a `lib` folder.

- **Scalability**
  - Serverless functions auto-scale with traffic, so adding more users doesn’t require manual server provisioning.
  - Supabase (hosted PostgreSQL) handles database scaling under the hood.

- **Maintainability**
  - TypeScript in strict mode provides clear contracts and catches errors early.
  - Shadcn/ui components are copied into the codebase, giving full control over styling and behavior without external dependencies.
  - .devcontainer ensures every developer works in the same environment.

- **Performance**
  - Edge caching and CDN distribution via the hosting provider (e.g., Vercel) reduce latency.
  - Streaming responses for AI chat deliver data as it’s generated, improving perceived performance.

## 2. Database Management

The project relies on Supabase, an open-source Firebase alternative, which provides:

- **Database Type**: SQL (PostgreSQL).
- **Auth & Real-Time**: Built-in authentication (linked to Clerk) and real-time subscriptions.
- **Row-Level Security (RLS)**: Ensures each user only sees their own data. Policies tie records to the authenticated Clerk user ID.
- **Data Access**:
  - Client-side: Supabase client configured in `src/lib/supabase.ts` for direct queries.
  - Server-side: `createSupabaseServerClient` in API routes to perform secure, server-only queries.
- **Backup & Maintenance**:
  - Supabase-managed daily backups and point-in-time recovery.
  - Database health monitored via Supabase dashboard.

## 3. Database Schema

Below is the primary table for storing chat messages. It is implemented in PostgreSQL.

```sql
-- Table: messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'openai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-Level Security Policy
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_messages ON public.messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_own_messages ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```  

*Notes:*  
- `role` distinguishes whether the message came from the user or the AI.  
- `model` records which AI model was used (e.g., `openai`, `anthropic-claude`).  
- Clerk’s `auth.uid()` function ties rows to the authenticated user.

## 4. API Design and Endpoints

The backend exposes RESTful API routes under `/src/app/api`:

- **`POST /api/chat`** (`/src/app/api/chat/route.ts`)
  - Purpose: Send a new user message to the AI model and stream the assistant’s response.
  - Flow:
    1. Extract user session via Clerk middleware.
    2. Accept `{ content, model }` in the request body.
    3. Call the Vercel AI SDK (OpenAI or Anthropic) to generate a response.
    4. Stream the assistant’s reply chunks back to the client.
    5. Insert both user and assistant messages into Supabase for history.

- **`GET /api/chat/history`** (to be created)
  - Purpose: Fetch paginated chat messages for infinite scroll.
  - Query Parameters: `?limit=20&before={timestamp_or_id}`
  - Flow:
    1. Validate user via server-side Supabase client.
    2. Query `messages` table with `user_id = auth.uid()`, ordered by `created_at DESC`, applying pagination.
    3. Return an array of messages.

Each endpoint uses standard HTTP status codes (200, 400, 401, 500) and JSON payloads. Error handling returns clear messages and codes for the frontend to display via toast notifications.

## 5. Hosting Solutions

- **Frontend & API (Next.js)**
  - Recommended: Vercel (first-party support for Next.js), offering serverless functions, automatic scaling, and global CDN.
  - Benefits:
    - Zero-administration: deployments triggered by Git pushes.
    - Edge caching for static assets and incremental static regeneration.
    - Predictable pricing with a generous free tier.

- **Database & Auth (Supabase)**
  - Hosted by Supabase on managed PostgreSQL clusters.
  - Benefits:
    - Automated backups and updates.
    - Built-in real-time features.
    - Row-Level Security for data isolation.

## 6. Infrastructure Components

- **Load Balancer & Serverless Platform**
  - Vercel’s platform automatically distributes traffic across edge locations.

- **Content Delivery Network (CDN)**
  - Static assets (JS, CSS, images) served from edge caches around the globe.

- **Caching Mechanisms**
  - ISR (Incremental Static Regeneration) for pages that can be statically generated.
  - Edge caching headers configured via Next.js for API routes where appropriate.

- **Real-Time Subscriptions**
  - Supabase real-time for live updates (e.g., if you later hook into message streams).

## 7. Security Measures

- **Authentication**
  - Clerk protects routes via middleware in `src/middleware.ts`.
  - Only authenticated users can call chat or history endpoints.

- **Authorization**
  - Supabase RLS ensures users access only their own messages.

- **Data Encryption**
  - TLS for all in-transit data (Next.js ↔ Supabase ↔ AI Providers).
  - Supabase-managed encryption at rest for the database.

- **API Security**
  - Rate limiting (can be added via Vercel edge functions or middleware).
  - Input validation on all endpoints to prevent injection attacks.

- **Compliance**
  - GDPR-ready: data isolation per user, easy data deletion via Supabase API.

## 8. Monitoring and Maintenance

- **Logging & Error Tracking**
  - Vercel Analytics for request metrics (latency, error rates).
  - Optional: integrate Sentry or LogRocket for application-level error monitoring.

- **Database Health**
  - Supabase dashboard provides query performance insights and alerts.

- **Alerts & Notifications**
  - Set up email or Slack alerts on error thresholds or downtime via Vercel and Supabase.

- **Dependency Management**
  - Automated updates with tools like Renovate or Dependabot.
  - Regular audits of npm dependencies.

- **Maintenance Strategies**
  - Scheduled reviews of RLS policies and database indexes.
  - Routine performance profiling of slow API calls.

## 9. Conclusion and Overall Backend Summary

This backend is designed to provide a secure, scalable, and maintainable foundation for an AI-powered chat application. By combining Next.js serverless functions, Supabase’s managed PostgreSQL with strong RLS, Clerk authentication, and the Vercel AI SDK, we achieve:

- **Seamless User Experience:** Fast, streaming AI responses with polished UI components.
- **Secure Data Handling:** Per-user message isolation and encryption throughout.
- **Operational Simplicity:** Serverless deployment, automated scaling, and managed database services.

Unique to this setup is the tight integration of RLS policies with Clerk user identities, ensuring that data privacy is enforced at the database level. The use of streaming AI responses via the Vercel AI SDK also delivers a chat experience on par with leading conversational agents. Overall, this backend structure aligns perfectly with the goal of building a sophisticated, production-ready chat UI starter kit.