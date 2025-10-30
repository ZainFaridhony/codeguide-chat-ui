# Security Guidelines for "codeguide-chat-ui"

This document outlines security best practices for the **CodeGuide Starter Kit** ("codeguide-chat-ui"), a Next.js 15 App Router template offering integrated authentication, database management, and AI-powered chat functionality. Follow these guidelines to harden your application across all layers.

---

## 1. Authentication & Access Control

### 1.1 Clerk Integration
- **Secure Defaults**: Clerk is configured by default to enforce strong password policies and email verification. Verify that multi-factor authentication (MFA) is enabled for sensitive or admin accounts.
- **Session Management**:
  - Use Secure, HttpOnly, SameSite=strict cookies for session tokens.
  - Enforce idle and absolute session timeouts via Clerk settings.
  - Implement explicit logout to revoke session tokens server-side.
- **Role-Based Access**:
  - Define user roles (e.g., `user`, `admin`) in Clerk custom claims.
  - Enforce role checks in middleware (`middleware.ts`) and on server endpoints.

### 1.2 Row-Level Security (RLS) with Supabase
- **Policy Enforcement**: Ensure RLS policies in PostgreSQL restrict SELECT/INSERT/UPDATE/DELETE to records where `user_id = auth.uid()`.
- **Least Privilege**: Use a database role with only `SELECT`, `INSERT`, and `UPDATE` privileges on the `messages` table. Avoid superuser or broad access roles.

---

## 2. Input Handling & Processing

### 2.1 Prevent Injection Attacks
- **Parameterized Queries**: Always use the Supabase client’s built-in parameterization. Never interpolate unsanitized user input into raw SQL.
- **ORM/SDK Usage**: Leverage the official Supabase JS SDK for all database interactions to avoid manual query construction.

### 2.2 XSS Mitigation
- **Client-Side Encoding**: When rendering user-supplied text in `ChatWindow.tsx`, wrap content in sanitized components or use React’s default escaping.
- **Content Security Policy (CSP)**:
  ```plaintext
  Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'
  ```
- **Sanitize HTML**: If allowing rich-text input, sanitize with a library like DOMPurify before saving or rendering.

### 2.3 Secure File Uploads
*(If added in future)*:
- Validate file type, size, and mime
- Store outside the webroot or use Supabase Storage with signed URLs
- Scan for malware prior to processing

---

## 3. Data Protection & Privacy

### 3.1 Encryption
- **In Transit**: Enforce HTTPS/TLS 1.2+ for all Next.js routes and API calls. Configure `next.config.js` to redirect HTTP to HTTPS.
- **At Rest**: Rely on Supabase’s built-in encryption at rest. If storing additional PII, consider field-level encryption using AES-256.

### 3.2 Secret Management
- **Environment Variables**: Store only non-sensitive defaults in `.env.example`. Keep real secrets (`NEXT_PUBLIC_SUPABASE_KEY`, `CLERK_API_KEY`, AI service keys) in a vault or CI/CD secrets store, never in Git.
- **Rotate Keys**: Implement a key rotation policy and revoke old credentials promptly.

### 3.3 Logging & Monitoring
- **Mask PII**: In server logs and error responses, avoid logging tokens, passwords, or PII.
- **Error Handling**: Return generic error messages to clients; capture detailed stack traces in a secure log aggregator (e.g., Sentry).

---

## 4. API & Service Security

### 4.1 Secure API Routes
- **Authentication**: Protect `/api/chat/route.ts` and `/api/chat/history` with `requireUser` middleware. Validate JWT claims on each request.
- **Rate Limiting**: Implement rate-limiting middleware (e.g., `express-rate-limit` or Vercel Edge functions) to throttle chat message submissions and brute-force attempts.

### 4.2 CORS Configuration
- Restrict `next.config.js` CORS to your application origin(s) only; disallow wildcard (`*`).

### 4.3 Minimum Data Exposure
- Only return the fields required by the client:
  - For chat history: `{ id, content, role, created_at }`
  - Never expose internal IDs, user tokens, or environment-specific data.

---

## 5. Web Application Security Hygiene

### 5.1 CSRF Protection
- Use `next-auth` style CSRF tokens or Clerk’s built-in anti-CSRF on state-changing endpoints if you accept cookies.

### 5.2 Security Headers
- Add via `next.config.js`'s `headers()` function:
  ```javascript
  {
    key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'
  }
  // X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.
  ```

### 5.3 Secure Cookies
- For any custom cookies: set `Secure`, `HttpOnly`, `SameSite=Strict` attributes.

---

## 6. Infrastructure & Configuration Management

### 6.1 Dev & Prod Parity
- Disable debugging (e.g., `next dev`) and verbose error pages in production (`NODE_ENV=production`).
- Keep Docker images, base OS, and dependencies up-to-date.

### 6.2 Server Hardening
- Only expose necessary ports. Disable SSH or database access from public networks.
- Use network-level firewalls or Vercel’s built-in protections.

### 6.3 TLS Configuration
- Enforce modern cipher suites and disable TLS ≤1.1 on your hosting platform.

---

## 7. Dependency Management

- **Lockfiles**: Commit `package-lock.json` or `yarn.lock` to ensure reproducible builds.
- **Vulnerability Scanning**: Integrate `npm audit`, Snyk, or GitHub Dependabot. Address high/critical CVEs promptly.
- **Minimal Footprint**: Only install shadcn/ui components in use. Remove unused packages to reduce attack surface.

---

## 8. Recommendations for Future Features

1. **Redux & State Isolation**: Secure your Redux store by never storing tokens or secrets in client state. Keep authentication logic on the server.
2. **Infinite Scroll**: Validate pagination cursors server-side and enforce RLS on each batch fetch.
3. **MFA Prompt**: Encourage enabling MFA post-login, especially before high-risk actions.

---

By following these guidelines, you will ensure that **codeguide-chat-ui** adheres to security-by-design principles, implements defense in depth, and maintains robust protection against common web threats.

*Last Updated: 2024-06-xx*