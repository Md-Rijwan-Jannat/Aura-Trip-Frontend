import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface INotification {
  _id: string;
  recipient: string;
  actor?: {
    _id: string;
    name: string;
    image?: string;
  } | null;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  groupId?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isOpen: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
};

const notificationSlice = createSlice({
  name: "appNotifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<INotification[]>) {
      state.notifications = action.payload;
    },
    addNotification(state, action: PayloadAction<INotification>) {
      // Add to the beginning (newest first)
      state.notifications.unshift(action.payload);
      if (!action.payload.readAt) {
        state.unreadCount += 1;
      }
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n._id === action.payload);

      if (notification && !notification.readAt) {
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.notifications.forEach((n) => {
        if (!n.readAt) {
          n.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n._id === action.payload);

      if (notification && !notification.readAt) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    toggleNotificationDropdown(state) {
      state.isOpen = !state.isOpen;
    },
    closeNotificationDropdown(state) {
      state.isOpen = false;
    },
    openNotificationDropdown(state) {
      state.isOpen = true;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllRead,
  removeNotification,
  setUnreadCount,
  toggleNotificationDropdown,
  closeNotificationDropdown,
  openNotificationDropdown,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.appNotifications.notifications;
export const selectUnreadCount = (state: RootState) => state.appNotifications.unreadCount;
export const selectIsNotificationOpen = (state: RootState) => state.appNotifications.isOpen;

export default notificationSlice.reducer;
