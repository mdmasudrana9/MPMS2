import { TAG_TYPES } from "@/src/redux/constants/tagTypes";
import { baseApi } from "../../api/baseApi";

const sprintApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSprint: builder.mutation({
      query: (data) => ({
        url: "/sprint/create-sprint",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Sprints] as any,
    }),

    getAllSprints: builder.query({
      query: (projectId?: string) => ({
        url: projectId ? `/sprint?projectId=${projectId}` : "/sprint",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.Sprints] as any,
    }),

    getSingleSprint: builder.query({
      query: (sprintId: string) => ({
        url: `/sprint/${sprintId}`,
        method: "GET",
      }),
      providesTags: [TAG_TYPES.Sprints] as any,
    }),

    updateSprint: builder.mutation({
      query: ({ sprintId, data }) => ({
        url: `/sprint/${sprintId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Sprints] as any,
    }),

    deleteSprint: builder.mutation({
      query: (sprintId: string) => ({
        url: `/sprint/${sprintId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.Sprints] as any,
    }),
  }),
});

export const {
  useCreateSprintMutation,
  useGetAllSprintsQuery,
  useGetSingleSprintQuery,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
} = sprintApi;
