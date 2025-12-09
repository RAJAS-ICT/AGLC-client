import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Nav from './views/Nav';

// Auth
import Login from './Auth/Login';
import Register from './auth/Register';

// Views
import User from './views/User';
import Company from './views/Company';
import Employee from './views/Employee';
import Customer from './views/Customer';
import Vendor from './views/Vendor';
import Booking from './views/Booking';
import Account from './views/Account';
import SubAccount from './views/SubAccount';
import Department from './views/Department';
import PaymentRequest from './views/PaymentRequest';
import PaymentRequestDetail from './views/PaymentRequestDetail';
import Charge from './views/Charge';


// Edit
import EditUser from './views/update/editUser';
import EditCompany from './views/update/editCompany';
import EditEmployee from './views/update/editEmployee';
import EditCustomer from './views/update/editCustomer';
import EditVendor from './views/update/editVendor';
import EditBooking from './views/update/editBooking';
import EditAccount from './views/update/editAccount';
import EditSubAccount from './views/update/editSubAccount';
import EditDepartment from './views/update/editDepartment';
import EditPaymentRequest from './views/update/editPaymentRequest';
import EditPaymentRequestDetail from './views/update/editPaymentRequestDetail';
import EditCharge from './views/update/editCharge';
import EditProfile from './views/update/editProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/*"
          element={
            <>
              <Nav />
              <Routes>
                {/* Views */}
                <Route path="user" element={<User />} />
                <Route path="company" element={<Company />} />
                <Route path="employee" element={<Employee />} />
                <Route path="customer" element={<Customer />} />
                <Route path="vendor" element={<Vendor />} />
                <Route path="booking" element={<Booking />} />
                <Route path="account" element={<Account />} />
                <Route path="subAccount" element={<SubAccount />} />
                <Route path="department" element={<Department />} />
                <Route path="paymentRequest" element={<PaymentRequest />} />
                <Route path="paymentRequestDetail" element={<PaymentRequestDetail />} />
                <Route path="charge" element={<Charge />} />

                {/* Edit */}
                <Route path="editUser/:id" element={<EditUser />} />
                <Route path="editCompany/:id" element={<EditCompany />} />
                <Route path="editEmployee/:id" element={<EditEmployee />} />
                <Route path="editCustomer/:id" element={<EditCustomer />} />
                <Route path="editVendor/:id" element={<EditVendor />} />
                <Route path="editBooking/:id" element={<EditBooking />} />
                <Route path="editAccount/:id" element={<EditAccount />} />
                <Route path="editSubAccount/:id" element={<EditSubAccount />} />
                <Route path="editDepartment/:id" element={<EditDepartment />} />
                <Route path="editPaymentRequest/:id" element={<EditPaymentRequest />} />
                <Route path="editPaymentRequestDetail/:id" element={<EditPaymentRequestDetail />} />
                <Route path="editCharge/:id" element={<EditCharge />} />
                <Route path="editProfile/:id" element={<EditProfile />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
