import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const affiliateApi = createApi({
    reducerPath:'affiliateApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/affiliates', credentials:'include'}),
    tagTypes:['affiliate'],
    endpoints:(builder)=>({
        fetchAffiliate:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['affiliate']
        }),
        createAffiliate:builder.mutation({
            query:(newAffiliate)=>({
                url:'/',
                method:'POST',
                body:newAffiliate
            }),
            invalidatesTags:['affiliate']
        }),
        updateAffiliate:builder.mutation({
            query:({id,...updateData})=>({
                url:`/${id}`,
                method:'PUT',
                body:updateData
            })
        })
    })
})


export const {useFetchAffiliateQuery,useCreateAffiliateMutation, useUpdateAffiliateMutation} = affiliateApi