import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'


export const journalEntryApi = createApi({
    reducerPath:'journalEntryApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/journalEntry', credentials:'include'}),
    tagTypes:['journalEntry'],
    endpoints:(builder)=>({
        fetchJournalEntry:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['journalEntry']
        }),
        fetchJournalEntryById:builder.query({
            query:(id)=>({
                url:`/${id}`,
                method:'GET'
            }),
            providesTags:['journalEntry']
        }),
        createJournalEntry:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['journalEntry']
        }),
        updateJournalEntry:builder.mutation({
            query:({id,...updateData})=>({
                url:`/${id}`,
                method:'PUT',
                body:updateData
            }),
            invalidatesTags:['journalEntry']
        })
    })
})

export const {useFetchJournalEntryQuery, useFetchJournalEntryByIdQuery, useCreateJournalEntryMutation, useUpdateJournalEntryMutation } = journalEntryApi