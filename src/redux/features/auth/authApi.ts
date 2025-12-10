import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    createMember: builder.mutation({
      query: (body) => ({
        url: "/users/create-member",
        method: "POST",
        body,
      }),
    }),
    getAllUser: builder.query({
      query: () => ({
        url: "/users/all",
        method: "GET",
      }),
    }),
  }),
});
export const { useLoginMutation, useCreateMemberMutation, useGetAllUserQuery } =
  authApi;
