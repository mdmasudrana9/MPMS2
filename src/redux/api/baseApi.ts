/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  DefinitionType,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setUser } from "../features/auth/authSlice";
import { toast } from "sonner";
import { TAG_TYPES } from "@/src/redux/constants/tagTypes";

const BaseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:5000/api/v1",
  baseUrl: "https://mpms-server.vercel.app/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token; // Assuming you have a token in your auth slice
    if (token) {
      headers.set("authorization", `${token}`);
    }
    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  let result = await BaseQuery(args, api, extraOptions);
  if (result?.error?.status === 404) {
    toast.error((result?.error?.data as { message: string })?.message);
  }
  if (result?.error?.status === 401) {
    const res = await fetch(
      "https://mpms-server.vercel.app/api/v1/auth/refresh-token",
      {
        method: "POST",
        credentials: "include",
      }
    );
    // const res = await fetch("http://localhost:5000/api/v1/auth/refresh-token", {
    //   method: "POST",
    //   credentials: "include",
    // });
    const data = await res.json();
    if (data?.data.accessToken) {
      const user = (api.getState() as RootState).auth.user;
      api.dispatch(setUser({ user, token: data?.data.accessToken }));
      result = await BaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  //console.log(result);
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    TAG_TYPES.Projects,
    TAG_TYPES.Users,
    TAG_TYPES.Tasks,
    TAG_TYPES.Teams,
    TAG_TYPES.Comments,
    TAG_TYPES.Sprints,
    TAG_TYPES.TeamMembers,
  ],
  endpoints: () => ({}),
});
