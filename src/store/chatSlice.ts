import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  oldestMessageId: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  hasMoreMessages: true,
  oldestMessageId: null,
};

// Async thunk for sending messages
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const jsonData = JSON.parse(line.slice(2));
                if (jsonData.content) {
                  accumulatedContent += jsonData.content;
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      return accumulatedContent;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

// Async thunk for fetching older messages (infinite scroll)
export const fetchOlderMessages = createAsyncThunk(
  'chat/fetchOlderMessages',
  async (params: { oldestMessageId: string | null; limit: number }, { rejectWithValue }) => {
    try {
      // This would typically call an API endpoint to get older messages
      // For now, we'll simulate this with empty data
      // In a real implementation, you'd have an endpoint like /api/chat/history
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch older messages');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      const newMessage: Message = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: action.payload,
        role: 'user',
        timestamp: Date.now(),
      };
      state.messages.push(newMessage);
    },
    addAssistantMessage: (state, action: PayloadAction<string>) => {
      const newMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: action.payload,
        role: 'assistant',
        timestamp: Date.now(),
      };
      state.messages.push(newMessage);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isTyping = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        if (action.payload) {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: action.payload,
            role: 'assistant',
            timestamp: Date.now(),
          };
          state.messages.push(assistantMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isTyping = false;
        state.error = action.payload as string || 'Failed to send message';
      })
      // fetch older messages
      .addCase(fetchOlderMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.length === 0) {
          state.hasMoreMessages = false;
        } else {
          // Add older messages to the beginning of the array
          state.messages = [...action.payload, ...state.messages];
          if (action.payload.length > 0) {
            state.oldestMessageId = action.payload[0].id;
          }
        }
      })
      .addCase(fetchOlderMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch older messages';
      });
  },
});

export const { clearError, addUserMessage, addAssistantMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;