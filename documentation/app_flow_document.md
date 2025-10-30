# App Flow Document for CodeGuide Starter Kit

## Onboarding and Sign-In/Sign-Up
When a new user navigates to the CodeGuide Starter Kit application, they arrive at the landing page served by Next.js. The layout displays a clean sign-in interface powered by Clerk. The user can create an account by choosing one of the available methods: they may enter their email and set a password, or they may select a supported social login option. After submitting their credentials, Clerk handles verification and redirects the user back to the chat interface.

If the user forgets their password, they simply click the “Forgot Password” link on the sign-in form. Clerk then guides them through a self-service flow where they receive an email with a reset link. Once they reset their password, they use their new credentials to log in. At any time, the user can sign out by opening the user menu in the top navigation and selecting “Sign Out,” which clears their session and returns them to the landing page.

## Main Dashboard or Home Page
Upon successful authentication, the user lands on the main chat page. This page blends a header and a chat interface. The header shows the application name, a dark mode toggle, and a user menu with profile and sign-out options. Below the header, the chat area dominates the screen. It consists of a scrollable message list that displays past exchanges and a chat input field anchored at the bottom. The dark or light theme applied matches the user’s system preference or manual choice, ensuring a consistent look and feel.

Users navigate between major sections by using the header controls. Clicking the user avatar opens the Clerk-managed profile page in a new tab, where they can update personal information. Toggling the theme switch immediately updates the appearance without a page reload. When the user signs out, they are redirected back to the landing page.

## Detailed Feature Flows and Page Transitions
When a user types a message into the chat input, they press the send button or hit Enter. This action triggers a client API call to `/api/chat`, where the Vercel AI SDK’s streaming endpoint processes the prompt. As soon as the request is dispatched, the input field disables to prevent duplicate submissions, and a spinner indicates that a response is on the way. On the server, Clerk middleware confirms the user’s identity, and the request is passed to the AI model (OpenAI or Anthropic Claude) based on configuration.

As the AI generates text, the client receives partial responses and appends them live to the bottom of the message list. This creates a smooth “AI is typing” experience. Once the model finishes, the input field re-enables, and the user can continue the conversation.

If the user scrolls upwards toward earlier messages, an intersection observer detects when the scroll position reaches the top threshold. This automatically fires a request to a custom history endpoint, `/api/chat/history`, which uses Supabase with Row-Level Security to fetch the next batch of older messages. These are prepended to the chat list, preserving scroll position so the user can keep reading without interruption.

## Settings and Account Management
To adjust personal settings, the user clicks their avatar in the header. This opens the Clerk dashboard in a new browser tab, where they can change their profile details, update passwords, or manage connected social accounts. All profile updates through Clerk are immediately reflected when they return to the chat page.

The dark mode toggle in the header lets the user switch between light and dark themes. This preference is stored locally, so on their next visit the application will automatically select their chosen theme. After making adjustments, the user can simply close the settings tab and continue chatting without any additional navigation.

If the application extends into paid tiers or subscriptions in the future, a billing page would be accessible from the user menu. There, users could update payment methods, view invoices, or cancel subscriptions. After managing billing, they would click “Back to Chat” to return to the main interface.

## Error States and Alternate Paths
If the user submits an empty message, client-side validation prevents the API call and briefly highlights the input field in red. Should the AI endpoint return an error—such as missing API key or rate limiting—the client catches the HTTP error code and displays a dismissible toast notification describing the issue. The toast includes a retry button that replays the last request.

In the event of network failure, the message list displays an inline banner indicating a lost connection and prompts the user to check their internet link. Once connectivity is restored, the banner disappears and the user may retry sending messages.

If Clerk detects an expired session or an unauthorized request reaches a protected API route, the middleware will redirect the user to the sign-in page. Upon reauthentication, the user is returned to the chat interface with their session restored.

## Conclusion and Overall App Journey
A new user arrives at the CodeGuide Starter Kit, signs up or logs in through Clerk, and reaches the chat interface with a friendly header and dark mode switch. They send messages and watch AI responses stream live, with older history loading automatically as they scroll up. If they need to adjust their profile or theme, the user menu and toggle control make it effortless. Errors are communicated through clear toast messages or banners, and lost sessions prompt a return to sign-in. Throughout this flow, the integration of Clerk for authentication, Supabase for secure message storage, and the Vercel AI SDK for streaming AI responses work together to deliver a seamless chat experience from first visit to everyday use.