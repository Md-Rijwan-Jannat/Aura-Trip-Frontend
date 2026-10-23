import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatUiState {
  open: boolean;
  activeChatId: string | null;
}

const initialState: ChatUiState = {
  open: false,
  activeChatId: null,
};

const chatUiSlice = createSlice({
  name: 'chatUi',
  initialState,
  reducers: {
    setChatPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
      if (!action.payload) state.activeChatId = null;
    },
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (action.payload) state.open = true;
    },
    closeChatPanel: (state) => {
      state.open = false;
      state.activeChatId = null;
    },
    // Drop a stale restored conversation (persisted id no longer exists)
    // while keeping the messenger panel itself open.
    clearActiveChatId: (state) => {
      state.activeChatId = null;
    },
  },
});

export const {
  setChatPanelOpen,
  setActiveChatId,
  closeChatPanel,
  clearActiveChatId,
} = chatUiSlice.actions;
export default chatUiSlice.reducer;
