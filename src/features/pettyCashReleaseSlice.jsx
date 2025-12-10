import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const pettyCashApi = createApi({
    reducerPath:'pettyCashApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/pettyCashRelease', credentials:'include'}),
    tagTypes:['pettyCash'],
    endpoints:(builder)=>({
        getPettyCash:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['pettyCash']
        }),
        createPettyCash:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['pettyCash']
        })
    })
})

export const {useGetPettyCashQuery, useCreatePettyCashMutation} = pettyCashApi