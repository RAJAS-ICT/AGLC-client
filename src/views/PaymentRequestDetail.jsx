import React, { useState, useRef, useEffect  } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useGetPaymentRequestDetailQuery,
  usePostPaymentRequestDetailMutation,
} from "../features/paymentRequestDetailSlice";

import { useFetchPaymentRequestQuery } from "../features/paymentRequest";
import { useFetchBookingQuery } from "../features/bookingSlice";
import { useFetchChargeQuery } from "../features/chargeSlice";

import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function PaymentRequestDetail() {

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [openBooking, setOpenBooking] = useState(false);
  const bookingRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bookingRef.current && !bookingRef.current.contains(event.target)) {
        setOpenBooking(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [openCharge, setOpenCharge] = useState(false);
  const chargeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chargeRef.current && !chargeRef.current.contains(event.target)) {
        setOpenCharge(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: details = [], isLoading, isError, error } =
    useGetPaymentRequestDetailQuery();
    const navigate =  useNavigate()

  const { data: paymentRequests = [] } = useFetchPaymentRequestQuery();
  const { data: bookings = [] } = useFetchBookingQuery();
  const { data: charges = [] } = useFetchChargeQuery();

  const [addDetail] = usePostPaymentRequestDetailMutation();

  const [formData, setFormData] = useState({
    paymentRequestId: "",
    bookingId: "",
    chargeId: "",
    chargeDesc: "",
    quantity: "",
    amount: "",
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const filteredDetails = details.filter((d) => {
    const request = paymentRequests.find((p) => p.id === d.paymentRequestId);
    return (
      d.chargeDesc?.toLowerCase().includes(search.toLowerCase()) ||
      d.amount?.toString().includes(search) ||
      d.quantity?.toString().includes(search) ||
      request?.remarks?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const currentData = filteredDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (p) => setCurrentPage(p);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevious = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addDetail(formData).unwrap();
      toast.success("Payment Request Detail added!");

      setFormData({
        paymentRequestId: "",
        bookingId: "",
        chargeId: "",
        chargeDesc: "",
        quantity: "",
        amount: "",
      });

      setShowModal(false);
      navigate(`/editPaymentRequestDetail/${response.data.id}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add detail");
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
            <Mosaic color="#ca8a04" size="small" />
        </div>
      );
    }

  if (isError) return <p>Error: {error?.message || "Something went wrong"}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" />
        <div className={style.ListContainer}>
        
          {/* Header */}
          <div className={style.pageHeaderContainer}>
            <div className={style.flexTitleHeader}>
              <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
              <h3 className={style.headerLaber}>Payment Request Detail</h3>
          </div>
            <div className={style.flexHeader}>
              <input
                className={style.searchBox}
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            <button className={style.addBtn} onClick={() => setShowModal(true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                <path
                  fill="currentColor"
                  d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"
                />
              </svg>
            </button>
          </div>
        </div>

        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Payment Request Detail</h3>
                <button
                  className={style.closeButton}
                  onClick={() => setShowModal(false)}
                >
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
                <div className={style.customSelectWrapper} ref={wrapperRef}>
                  <div
                    className={style.customSelectInput}
                    onClick={() => setOpen(!open)}
                  >
                    {formData.paymentRequestId
                      ? paymentRequests.find((p) => p.id === formData.paymentRequestId)?.requestNumber
                      : "Select Payment Request"}
                    <span className={style.selectArrow}>▾</span>
                  </div>
                  {open && (
                    <div className={style.customSelectDropdown}>
                      {paymentRequests.map((p) => (
                        <div
                          key={p.id}
                          className={style.customSelectOption}
                          onClick={() => {
                            setFormData({ ...formData, paymentRequestId: p.id });
                            setOpen(false);
                          }}
                        >
                          {p.requestNumber}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={style.customSelectWrapper} ref={bookingRef}>
                  <div
                    className={style.customSelectInput}
                    onClick={() => setOpenBooking(!openBooking)}
                  >
                    {formData.bookingId
                      ? bookings.find((b) => b.id === formData.bookingId)?.bookingNumber
                      : "Select Booking"}
                    <span className={style.selectArrow}>▾</span>
                  </div>
                  {openBooking && (
                    <div className={style.customSelectDropdown}>
                      {bookings.map((b) => (
                        <div
                          key={b.id}
                          className={style.customSelectOption}
                          onClick={() => {
                            setFormData({ ...formData, bookingId: b.id });
                            setOpenBooking(false);
                          }}
                        >
                          {b.bookingNumber}
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className={style.customSelectWrapper} ref={chargeRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenCharge(!openCharge)}
                >
                  {formData.chargeId
                    ? charges.find((c) => c.id === formData.chargeId)?.name
                    : "Select Charge"}
                      <span className={style.selectArrow}>▾</span>
                </div>

                {openCharge && (
                  <div className={style.customSelectDropdown}>
                    {charges.map((c) => (
                      <div
                        key={c.id}
                        className={style.customSelectOption}
                        onClick={() => {
                          setFormData({ ...formData, chargeId: c.id });
                          setOpenCharge(false);
                        }}
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <input
                  type="text"
                  placeholder="Charge Description"
                  value={formData.chargeDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, chargeDesc: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />

                <div className={style.modalActions}>
                  <button
                    type="button"
                    className={style.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className={style.submitButton}>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table>
          <thead>
            <tr className={style.headTablePaymentDetail}>
              <th>Payment Request</th>
              <th>Booking ID</th>
              <th>Charge</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            ) : (
              currentData.map((d) => {
                const booking = bookings.find((b) => b.id === d.bookingId);
               

                return (
                  <tr key={d.id} className={style.bodyTablePaymentDetail}>
                    <td>
                      {
                        paymentRequests.find(
                          (p) => p.id === d.paymentRequestId
                        )?.requestNumber
                      }
                    </td>
                    <td>{booking?.bookingNumber}</td>
                    <td>
                      {charges.find((c) => c.id === d.chargeId)?.name}
                    </td>
                    <td>{d.chargeDesc}</td>
                    <td>{d.quantity}</td>
                    <td>{d.amount}</td>
                    <td>
                     <button className={style.editBtn} onClick={() => navigate(`/editPaymentRequestDetail/${d.id}`)}>
                        <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                      Manage
                     </button>
                   </td>                   
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
          {totalPages > 1 && (
            <div className={style.paginationContainer}>
              <button
                className={style.pageButton}
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`${style.pageButton} ${
                    currentPage === i + 1 ? style.activePage : ""
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className={style.pageButton}
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
      </div>
    </main>
  );
}

export default PaymentRequestDetail;
