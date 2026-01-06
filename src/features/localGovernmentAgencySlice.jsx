import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const localGovernmentAgencyApi = createApi({
    reducerPath:'localGovernmentAgecyApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/localGovernmentAgency', credentials:'include'}),
    tagTypes:['localGovernmentAgency'],
    endpoints:(builder)=>({
        fetchLocalGovernmentAgency:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['localGovernmentAgency']
        }),
        createLocalGovernmentAgency:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['localGovernmentAgency']
        }),
        updateLocalGovernmentAgency:builder.mutation({
            query:({id, updateData})=>({
                url:`/${id}`,
                method:'PUT',
                body:updateData
            }),
            invalidatesTags:['localGovernmentAgency']
        })
    })
})

export const {
    useFetchLocalGovernmentAgencyQuery,
    useCreateLocalGovernmentAgencyMutation,
    useUpdateLocalGovernmentAgencyMutation
} = localGovernmentAgencyApi