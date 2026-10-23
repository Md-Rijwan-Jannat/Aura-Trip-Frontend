import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { baseApi } from './api/baseApi';
import authReducer from './features/auth/authSlice';
import notificationReducer from './features/message/notificationSlice';
import chatUiReducer from './features/message/chatUiSlice';
import groupPreviewReducer from './features/group/groupPreviewSlice';

// Fallback storage if localStorage is not available
const createNoopStorage = () => ({
  getItem(_key: string) {
    return Promise.resolve(null);
  },
  setItem(_key: string, _value: any) {
    return Promise.resolve();
  },
  removeItem(_key: string) {
    return Promise.resolve();
  },
});

// Use localStorage in the browser
const persistAuthConfig = {
  key: 'auth',
  storage: typeof window !== 'undefined' ? storage : createNoopStorage(),
};

const persistNotificationConfig = {
  key: 'notifications',
  storage: typeof window !== 'undefined' ? storage : createNoopStorage(),
};

// Messenger open state + the conversation you were in: survive a reload so
// the inbox comes back exactly as you left it.
const persistChatUiConfig = {
  key: 'chatUi',
  storage: typeof window !== 'undefined' ? storage : createNoopStorage(),
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);
const persistedNotificationReducer = persistReducer(
  persistNotificationConfig,
  notificationReducer
);
const persistedChatUiReducer = persistReducer(persistChatUiConfig, chatUiReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notifications: persistedNotificationReducer,
    groupPreview: groupPreviewReducer,
    chatUi: persistedChatUiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

// Types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistor for persisted store
export const persistor = persistStore(store);
