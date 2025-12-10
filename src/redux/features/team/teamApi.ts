import { TAG_TYPES } from "@/src/redux/constants/tagTypes";
import { baseApi } from "../../api/baseApi";

const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTeamMember: builder.mutation({
      query: (data) => ({
        url: "/team/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.TeamMembers] as any,
    }),

    getAllTeamMembers: builder.query({
      query: () => ({
        url: "/team",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.TeamMembers] as any,
    }),

    getSingleTeamMember: builder.query({
      query: (memberId: string) => ({
        url: `/team/${memberId}`,
        method: "GET",
      }),
      providesTags: [TAG_TYPES.TeamMembers] as any,
    }),

    updateTeamMember: builder.mutation({
      query: ({ memberId, data }: { memberId: string; data: any }) => ({
        url: `/team/${memberId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.TeamMembers] as any,
    }),

    deleteTeamMember: builder.mutation({
      query: (memberId: string) => ({
        url: `/team/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.TeamMembers] as any,
    }),
  }),
});

export const {
  useCreateTeamMemberMutation,
  useGetAllTeamMembersQuery,
  useGetSingleTeamMemberQuery,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamApi;
