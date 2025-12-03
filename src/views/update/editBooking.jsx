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

  const { data: bookingData, isLoading, isError } = useFetchBookingByIdQuery(id);
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
            <Mosaic color="#007bff" size="small" />
        </div>
      );
    }

  if (isError) return <p>Error loading booking data!</p>;

  return (
    <main className='main-container'>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="edit-container">
        <div className={style.flexTitleHeader} style={{marginBottom:"1.25rem"}}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
            <h3 className={style.headerLaber}>Edit Booking</h3>
        </div>
          <form onSubmit={handleUpdate} className={style.editFormBooking}>
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
                  {activeCustomers.map((c) => (
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
