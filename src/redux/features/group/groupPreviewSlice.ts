import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GroupPreviewData {
  mode: 'create' | 'edit';
  name: string;
  description: string;
  category: string;
  visibility: string;
  image?: string;
  coverImage?: string;
  memberCount?: number;
}

interface GroupPreviewState {
  active: boolean;
  data: GroupPreviewData | null;
}

const initialState: GroupPreviewState = {
  active: false,
  data: null,
};

const groupPreviewSlice = createSlice({
  name: 'groupPreview',
  initialState,
  reducers: {
    setGroupPreview: (state, action: PayloadAction<GroupPreviewData>) => {
      state.active = true;
      state.data = action.payload;
    },
    clearGroupPreview: (state) => {
      state.active = false;
      state.data = null;
    },
  },
});

export const { setGroupPreview, clearGroupPreview } = groupPreviewSlice.actions;
export default groupPreviewSlice.reducer;
