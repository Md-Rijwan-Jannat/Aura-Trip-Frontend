import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "../store";

const development = process.env.NEXT_PUBLIC_WORKSPACE;
const localUrl = process.env.NEXT_PUBLIC_BASE_API;
const liveUrl = process.env.NEXT_PUBLIC_LIVE_API;

const baseQuery = fetchBaseQuery({
  baseUrl: `${development === "development" ? localUrl : liveUrl}`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("authorization", `${token}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: [
    "posts",
    "users",
    "user",
    "comments",
    "reacts",
    "payment",
    "messages",
    "chats",
    "stories",
    "userStories",
    "reviews",
    "groups",
    "shorts",
    "notifications",
    "Music",
  ],
  endpoints: (builder) => ({}),
});
