import { configureStore } from '@reduxjs/toolkit'
import { userApi } from '../features/userSlice'
import { companyApi } from '../features/companySlice' 
import { employeeApi} from '../features/employeeSlice'
import { vendorApi } from '../features/vendorSlice'
import { customerApi } from '../features/customerSlice'
import { bookingApi } from '../features/bookingSlice'
import { accountApi } from '../features/accountTitleSlice'
import { subAccountApi } from '../features/subAccountTitleSlice'
import { departmentApi } from '../features/departmentSlice'
import { paymentRequestApi } from '../features/paymentRequest'
import { paymentRequestDetailApi } from '../features/paymentRequestDetailSlice'
import { chargeSlice } from '../features/chargeSlice'
import { pettyCashApi } from '../features/pettyCashReleaseSlice'
import { affiliateApi } from '../features/affiliateSlice'
import { localGovernmentAgencyApi } from '../features/localGovernmentAgencySlice'
import { bankApi } from '../features/bankSlice'
import { agentApi } from '../features/agentSlice'
import { journalEntryApi } from '../features/journalEntrySlice'
import { pettyCashLiquidationApi } from '../features/pettyCashLiquidationSlice';


const store = configureStore({
    reducer: {
        [userApi.reducerPath]: userApi.reducer,
        [companyApi.reducerPath]: companyApi.reducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [customerApi.reducerPath]: customerApi.reducer,
        [vendorApi.reducerPath]: vendorApi.reducer,
        [bookingApi.reducerPath]: bookingApi.reducer,
        [subAccountApi.reducerPath]: subAccountApi.reducer,
        [accountApi.reducerPath]: accountApi.reducer,
        [departmentApi.reducerPath]: departmentApi.reducer,
        [paymentRequestApi.reducerPath]: paymentRequestApi.reducer,
        [paymentRequestDetailApi.reducerPath]: paymentRequestDetailApi.reducer,
        [chargeSlice.reducerPath]: chargeSlice.reducer,
        [pettyCashApi.reducerPath]: pettyCashApi.reducer,
        [affiliateApi.reducerPath]: affiliateApi.reducer,
        [localGovernmentAgencyApi.reducerPath]: localGovernmentAgencyApi.reducer,
        [bankApi.reducerPath]: bankApi.reducer,
        [agentApi.reducerPath]: agentApi.reducer,
        [journalEntryApi.reducerPath]: journalEntryApi.reducer,
        [pettyCashLiquidationApi.reducerPath]: pettyCashLiquidationApi.reducer


    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            userApi.middleware,
            companyApi.middleware,
            employeeApi.middleware,
            customerApi.middleware,
            vendorApi.middleware,
            bookingApi.middleware,
            accountApi.middleware,
            subAccountApi.middleware,
            departmentApi.middleware,
            paymentRequestApi.middleware,
            paymentRequestDetailApi.middleware,
            chargeSlice.middleware,
            pettyCashApi.middleware,
            affiliateApi.middleware,
            localGovernmentAgencyApi.middleware,
            bankApi.middleware,
            agentApi.middleware,
            journalEntryApi.middleware,
            pettyCashLiquidationApi.middleware
        )
})

export default store
