import React, { useState, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useCreateBookingMutation, useFetchBookingQuery } from '../features/bookingSlice';
import { useNavigate } from 'react-router-dom';
import style from '../views/css/page.module.css';
import {useFetchCustomerQuery} from '../features/customerSlice'
import { Mosaic } from "react-loading-indicators";

function Booking() {
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

  const navigate = useNavigate();
  const { data, isError, error, isLoading } = useFetchBookingQuery();
  const bookings = data ?? [];

  const [formData, setFormData] = useState({
    customerId: '',
    remarks: '',
  });

  const [addBooking] = useCreateBookingMutation();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const filteredBookings = bookings.filter((b) =>
    b.bookingNumber?.toString().toLowerCase().includes(search.toLowerCase()) ||
    b.customerId?.toString().toLowerCase().includes(search.toLowerCase()) ||
    b.remarks?.toLowerCase().includes(search.toLowerCase()) 
    
);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage(prev => prev + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addBooking(formData).unwrap();
      toast.success(response.message || 'Booking Added!');
      setFormData({ customerId: '', remarks: '' });
      setShowModal(false);
      navigate(`/editBooking/${response.data.id}`);
    } catch (err) {
      console.log(err);
      const message = err?.data?.message || err?.error || 'Action failed!';
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

    if (isError) return <p>Error: {error?.message || 'Something went wrong'}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" reverseOrder={false} />
        <div className={style.ListContainer}>
          {/* Header */}
          <div className={style.pageHeaderContainer}>
            <div className={style.flexTitleHeader}>
              <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
                      <h3 className={style.headerLaber}>Booking</h3>
              </div>
              <div className={style.flexHeader}>
                <input
                  className={style.searchBox}
                  type="text"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search..."
                />
                <button className={style.addBtn} onClick={() => setShowModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                </button>
              </div>
            </div>

            {/* Modal */}
            {showModal && (
              <div className={style.modalOverlay}>
                <div className={style.modal}>
                  <div className={style.modalHeader}>
                    <h3>Add Booking</h3>
                    <button className={style.closeButton} onClick={() => setShowModal(false)}>
                      <svg
                        className={style.closeBtn}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="m11.25 4.75-6.5 6.5m0-6.5 6.5 6.5"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className={style.formContainer}>
                  <div className={style.customSelectWrapper} ref={customerRef}>
                  <div
                    className={style.customSelectInput}
                    onClick={() => setOpenCustomer(!openCustomer)}
                  >
                    {formData.customerId
                      ? activeCustomers.find((c) => c.id === formData.customerId)?.name
                      : "Select Customer"}
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

                {/* <input
                  className={style.disableBookingId}
                  disabled
                  type="number"
                  value={formData.customerId}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  placeholder="Customer ID"
                  required
                /> */}
                 
                <textarea name="" id=""
                  type="text"
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Remarks"
                >
                </textarea>
                
                <div className={style.modalActions}>
                  <button type="button" className={style.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={style.submitButton}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Booking Table */}
        <table>
          <thead>
            <tr className={style.headBookingTable}>
              <th>Booking Number</th>
              <th>Customer Name</th>
              <th>Remarks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No bookings found</td>
              </tr>
            ) : (
              currentBookings.map(booking => (
                <tr className={style.bodyBookingTable} key={booking.id}>
                  <td>{booking.bookingNumber}</td>
                  <td>
                    {customers.find(c => c.id === booking.customerId)?.name || 'N/A'}
                  </td>
                  <td>{booking.remarks}</td>
                  <td>
                    <button className={style.editBtn} onClick={() => navigate(`/editBooking/${booking.id}`)}>
                       <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
                  {/* Pagination */}
          {totalPages > 1 && (
            <div className={style.paginationContainer}>
              <button className={style.pageButton} onClick={handlePrevious} disabled={currentPage === 1}>
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`${style.pageButton} ${currentPage === i + 1 ? style.activePage : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className={style.pageButton} onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
      </div>
    </main>
  );
}

export default Booking;
