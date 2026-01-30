import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useCreateBookingMutation, useFetchBookingQuery } from '../features/bookingSlice';
import { useNavigate, Link } from 'react-router-dom';
import style from '../views/css/page.module.css';
import {useFetchCustomerQuery} from '../features/customerSlice'
import { Mosaic } from "react-loading-indicators";

function Booking() {
const [openCustomer, setOpenCustomer] = useState(false);
const customerRef = useRef(null);

const { data: customers = [] } = useFetchCustomerQuery();
const activeCustomers = customers.filter(c => c.isActive);

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
  const itemsPerPage = 7;
  const [showModal, setShowModal] = useState(false);

const getCustomerName = (id) => {
  const customer = customers.find(c => c.id === id);
  return customer?.name?.toLowerCase() || "";
};
const filteredBookings = bookings.filter((b) => {
  const query = search.toLowerCase();

  return (
    b.bookingNumber?.toLowerCase().includes(query) ||
    getCustomerName(b.customerId).includes(query) ||
    b.remarks?.toLowerCase().includes(query)
  );
});


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
      toast.success(response.message || 'Created Successfully.');
      setFormData({ customerId: '', remarks: '' });
      setShowModal(false);
      navigate(`/editBooking/${response.data.id}`);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

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
    <main className="main-container">
        <div className={style.ListContainer}>
          {/* Header */}
          <div className={style.pageHeaderContainer}>
            <div className={style.flexTitleHeader}>
             <div className={style.flexheaderTitle}>
              <svg className={style.svgManageVendors} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.669 2.282c.218-.043.443-.043.662 0c.251.048.479.167.691.277l.053.028l8.27 4.28a.75.75 0 0 1 .405.666v7.898c0 .283.002.583-.093.862a1.8 1.8 0 0 1-.395.652c-.205.214-.473.351-.723.48l-.063.033l-8.131 4.208a.75.75 0 0 1-.69 0l-8.131-4.208l-.063-.033c-.25-.129-.518-.266-.723-.48a1.8 1.8 0 0 1-.395-.652c-.095-.28-.094-.58-.093-.863V7.533a.75.75 0 0 1 .405-.666l8.269-4.28l.053-.027c.213-.111.44-.23.692-.278m.226 1.496a7 7 0 0 0-.282.141L4.668 7.514l2.827 1.384l7.356-3.703l-2.465-1.276a7 7 0 0 0-.282-.141l-.058-.024m4.45 2.292l-7.31 3.68L12 11.102l7.332-3.588zm-5.246 13.72v-7.36l-3-1.469v1a.75.75 0 0 1-1.5 0v-1.734l-3-1.468v6.624c0 .187 0 .294.005.375l.009.078a.3.3 0 0 0 .057.095c.005.004.021.017.064.042c.068.042.163.09.328.176zm.645-15.988l.06-.024z" />
                </svg>
              <h3 className={style.headerLaber}>Booking</h3>
              </div>
              <p className={style.headerSubtitle}>View and manage bookings.</p>
            </div>
              <div className={style.flexHeader}>
                <div className={style.SrchContainer}>
                    <input
                      type="text"
                      className={style.inputSrch}
                      required
                      placeholder="Type to search..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                    />

                    <div className={style.icon}>
                    <svg style={{color:'#3a3a3a'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                        <path d="m21 21l-4.34-4.34" />
                        <circle cx="11" cy="11" r="8" />
                      </g>
                    </svg>
                    </div>
                  </div>
                <button className={style.addBtn} onClick={() => setShowModal(true)} title="Add Booking">
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
                  <label className={style.modalLabel}>Customer: </label>
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
                <label className={style.modalLabel}>Remarks: </label>
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
