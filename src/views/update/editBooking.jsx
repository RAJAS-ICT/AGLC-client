import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { useFetchBookingByIdQuery, useUpdateBookingMutation } from '../../features/bookingSlice';
import style from '../css/page.module.css'
import {useFetchCustomerQuery} from '../../features/customerSlice'
import { Mosaic } from "react-loading-indicators";

function EditBooking() {
const [openCustomer, setOpenCustomer] = useState(false);
const customerRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (customerRef.current && !customerRef.current.contains(event.target)) {
      setOpenCustomer(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: bookingData, isLoading, isError, error } = useFetchBookingByIdQuery(id);
  const [updateBooking] = useUpdateBookingMutation();

  const [formData, setFormData] = useState({
    customerId: '',
    remarks: '',
  });

  useEffect(() => {
    if (bookingData) {
      setFormData({
        customerId: bookingData.customerId || '',
        remarks: bookingData.remarks || '',
      });
    }
  }, [bookingData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateBooking({ id, ...formData }).unwrap();
      toast.success(response.message || 'Booking updated successfully!');
      // navigate('/booking');
    } catch (err) {
      console.error(err);
      const message = err?.data?.message || err?.error || 'Update failed!';
      toast.error(message);
    }
  };
  
    const { data: customers = [] } = useFetchCustomerQuery();
    const activeCustomers = customers.filter(c => c.isActive);

 const [showLoader, setShowLoader] = useState(true);
   
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
    }, []);
     
    if (showLoader || isLoading) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            zIndex: 9999,
          }}
          >
            <Mosaic color="#0D254C" size="small" />
        </div>
      );
    }

  if (isError) {
    const status = error?.status;

 if (status === 401) {
      return (
        <div className={style.unauthorizedWrapper}>
          <p className={style.error1}>401</p>
          <p className={style.error2}>Page Not Found.</p>
          <Link to={'/login'}>
            <button className={style.errorLogin}>
             Unauthorized. Please log in to proceed.
            </button>
          </Link>
        </div>
      );
    }

    return <p>Error: {error?.data?.message || 'Something went wrong'}</p>;
  }

  return (
    <main className='main-container'>
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editBooking}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
            <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
            </svg>
              <h3 className={style.headerLaber}>Update Booking</h3>
              </div>
              <p className={style.headerSubtitle}>Transactions / Bookings</p>
            </div>
          <form onSubmit={handleUpdate} className={style.editFormCustomer}>
          {/* <label className={style.editLabel}>Customer ID: </label>
          <input
            disabled
            className={style.editInputBookingId}
            type="number"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            placeholder="Customer ID"
            required
          /> */}
          <label className={style.editLabel}>Customer: </label>
            <div className={style.customSelectWrapper} ref={customerRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenCustomer(!openCustomer)}
              >
                {formData.customerId
                  ? activeCustomers.find((c) => c.id === formData.customerId)?.name
                  : "-- Select Customer --"}
                    <span className={style.selectArrow}>▾</span>
              </div>

              {openCustomer && (
                <div className={style.customSelectDropdown}>
                  {activeCustomers
                  .filter((c) => c.id !== formData.customerId)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, customerId: c.id });
                        setOpenCustomer(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

          <label className={style.editLabel}>Remarks: </label>
          <textarea name="" id="" style={{marginBottom:"1rem"}}
            type="text"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Remarks"
          >
          </textarea>
          <button className={style.editButton} type="submit">Update</button>
        </form>
      </div>
    </main>
  );
}

export default EditBooking;
