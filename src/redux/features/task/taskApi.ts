import { TAG_TYPES } from "@/src/redux/constants/tagTypes";
import { baseApi } from "../../api/baseApi";

const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (data) => ({
        url: "/task/create-task",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Tasks] as any,
    }),

    getAllTasks: builder.query({
      query: (params?: { projectId?: string; sprintId?: string }) => {
        const queryString = params
          ? `?${new URLSearchParams(params as any).toString()}`
          : "";
        return {
          url: `/task${queryString}`,
          method: "GET",
        };
      },
      providesTags: [TAG_TYPES.Tasks] as any,
    }),

    getSingleTask: builder.query({
      query: (taskId: string) => ({
        url: `/task/${taskId}`,
        method: "GET",
      }),
      providesTags: [TAG_TYPES.Tasks] as any,
    }),

    updateTask: builder.mutation({
      query: ({ taskId, data }: { taskId: string; data: any }) => ({
        url: `/task/${taskId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [TAG_TYPES.Tasks] as any,
    }),

    deleteTask: builder.mutation({
      query: (taskId: string) => ({
        url: `/task/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAG_TYPES.Tasks] as any,
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetSingleTaskQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
