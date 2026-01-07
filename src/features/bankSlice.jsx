import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const bankApi = createApi({
    reducerPath:'bankApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/banks', credentials:'include'}),
    tagTypes:['banks'],
    endpoints:(builder)=>({
        fetchBank:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['banks']
        }),
        createBank:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['banks']
        }),
        updateBank:builder.mutation({
            query:({id, updateData})=>({
                url: `${id}`,
                method:'PUT',
                body:updateData
            }),
            invalidatesTags:['banks']
        })
    })
})

export const {useFetchBankQuery, useCreateBankMutation, useUpdateBankMutation} = bankApi