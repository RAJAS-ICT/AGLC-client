import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const agentApi = createApi({
    reducerPath:'agentApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/agents', credentials:'include'}),
    tagTypes:['agents'],
    endpoints:(builder)=>({
        fetchAgent:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['agents']
        }),
        getAgentById:builder.query({
            query:(id)=>({
                url:`/${id}`,
                method:'GET'
            }),
            providesTags:['agents']
        }),
        createAgent:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['agents']
        }),
        updateAgent:builder.mutation({
            query:({id, ...updateData})=>({
                url:`${id}`,
                method:'PUT',
                body:updateData
            }),
            invalidatesTags:['agents']
        })
    })
})


export const {useFetchAgentQuery, useGetAgentByIdQuery, useCreateAgentMutation, useUpdateAgentMutation} = agentApi