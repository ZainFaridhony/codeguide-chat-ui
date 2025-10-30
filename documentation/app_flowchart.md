flowchart TD
    Start[Start] --> AppLayout[Application Layout]
    AppLayout --> ClerkProv[Clerk Provider]
    AppLayout --> ThemeProv[Theme Provider]
    ClerkProv --> ChatPage[Chat Page]
    ThemeProv --> ChatPage
    ChatPage --> AuthCheck{Authenticated}
    AuthCheck -->|No| SignIn[Sign In Page]
    AuthCheck -->|Yes| ChatWindow[Chat Window]
    ChatWindow --> UserInput[User Inputs Message]
    UserInput --> DispatchSend[Dispatch sendMessage Thunk]
    DispatchSend --> ChatAPI[Chat API Route]
    ChatAPI --> AIProc[Vercel AI SDK]
    AIProc --> AIResp[AI Model Response Streaming]
    AIResp --> UpdateState[Update Redux State]
    UpdateState --> ChatWindow
    DispatchSend --> StoreMsg[Store Message in Supabase]
    ChatWindow --> ScrollArea[Scroll Area]
    ScrollArea --> CheckScroll{Scrolled to Top}
    CheckScroll -->|Yes| DispatchFetch[Dispatch fetchOlderMessages Thunk]
    DispatchFetch --> HistoryAPI[History API Route]
    HistoryAPI --> SupabaseFetch[Fetch Messages from Supabase]
    SupabaseFetch --> UpdateState
    ChatWindow --> ThemeToggle[Theme Toggle]