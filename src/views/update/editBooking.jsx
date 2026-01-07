import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
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
          <p className={style.error2}>Unauthorized Error</p>
          <p className={style.error3}>
            The resource requested could not be found on this server.
          </p>
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
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654" />
              </svg>
              <h3 className={style.headerLaber}>Edit Booking</h3>
              </div>
              <p className={style.headerSubtitle}>Transactions / Edit Bookings</p>
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
