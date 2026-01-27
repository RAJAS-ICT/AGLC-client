import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const pettyCashLiquidationApi = createApi({
    reducerPath:'pettyCashLiquidationApi',
    baseQuery:fetchBaseQuery({baseUrl:'http://localhost:4000/pettyCashLiquidation', credentials:'include'}),
    tagTypes:['liquidation'],
    endpoints:(builder)=>({
        fetchPettyCashLiquidation:builder.query({
            query:()=>({
                url:'/',
                method:'GET'
            }),
            providesTags:['liquidation']
        }),
        fetchPettyCashLiquidationById:builder.query({
            query:(id)=>({
                url:`/${id}`,
                method:'GET'
            }),
            providesTags:['liquidation']
        }),
        createPettyCashLiquidation:builder.mutation({
            query:(newData)=>({
                url:'/',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['liquidation']
        }),
        updatePettyCashLiquidation:builder.mutation({
            query:({id,...updateData})=>({
                url:`/${id}`,
                method:'PUT',
                body:updateData
            }),
            invalidatesTags:['liquidation']
        }),

        //Pettycash Liquidation Detail Slice
        fetchPettyCashLiquidationDetail: builder.query({
            query: (id) => ({
                url: `/detail/${id}`,
                method: 'GET'
            }),
            providesTags: ['liquidation']
        }),
        createPettyCashLiquidationDetail:builder.mutation({
            query:(newData)=>({
                url:'/detail',
                method:'POST',
                body:newData
            }),
            invalidatesTags:['liquidation']
        })
    })
})


export const {
    useFetchPettyCashLiquidationQuery, 
    useFetchPettyCashLiquidationByIdQuery, 
    useCreatePettyCashLiquidationMutation, 
    useUpdatePettyCashLiquidationMutation,
    useFetchPettyCashLiquidationDetailQuery,
    useCreatePettyCashLiquidationDetailMutation
} = pettyCashLiquidationApi