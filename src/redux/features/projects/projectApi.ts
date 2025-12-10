import { TAG_TYPES } from "@/src/redux/constants/tagTypes";
import { baseApi } from "../../api/baseApi";

const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProject: builder.mutation({
      query: (data) => ({
        url: "/project/create-project",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Projects] as any, // real-time refetch
    }),

    getAllProjects: builder.query({
      query: () => ({
        url: "/project",
        method: "GET",
      }),
      providesTags: [TAG_TYPES.Projects] as any, // provide cache
    }),

    getSingleProject: builder.query({
      query: (projectId: string) => ({
        url: `/project/${projectId}`,
        method: "GET",
      }),
      providesTags: [TAG_TYPES.Projects] as any,
    }),

    updateProject: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `/project/${projectId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Projects] as any,
    }),

    deleteProject: builder.mutation({
      query: (projectId: string) => ({
        url: `/project/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.Projects] as any,
    }),
  }),
});

// Export hooks
export const {
  useCreateProjectMutation,
  useGetAllProjectsQuery,
  useGetSingleProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
