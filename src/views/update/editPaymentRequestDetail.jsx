import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

import {
  useGetPaymentRequestDetailByIdQuery,
  usePostPaymentRequestDetailMutation,
  useUpdatePaymentRequestDetailMutation,
} from "../../features/paymentRequestDetailSlice";

import { useFetchPaymentRequestQuery } from "../../features/paymentRequest";
import { useFetchBookingQuery } from "../../features/bookingSlice";
import { useFetchChargeQuery } from "../../features/chargeSlice";
import { useFetchCustomerQuery } from "../../features/customerSlice";
import style from "../../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function EditPaymentRequestDetail() {

  const [openPaymentRequest, setOpenPaymentRequest] = useState(false);
  const paymentRequestRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentRequestRef.current && !paymentRequestRef.current.contains(event.target)) {
        setOpenPaymentRequest(false);
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

  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: detail, isLoading: isDetailLoading } =
    useGetPaymentRequestDetailByIdQuery(id);

  const { data: paymentRequests = [] } = useFetchPaymentRequestQuery();
  const { data: bookings = [] } = useFetchBookingQuery();
  const { data: charges = [] } = useFetchChargeQuery();
  const { data: customers = [] } = useFetchCustomerQuery();

  const [updateDetail] = useUpdatePaymentRequestDetailMutation();
  const [addDetail] = usePostPaymentRequestDetailMutation();

  const [formData, setFormData] = useState({
    paymentRequestId: "",
    bookingId: "",
    chargeId: "",
    chargeDesc: "",
    quantity: "",
    amount: "",
  });

  useEffect(() => {
    if (detail) {
      setFormData({
        paymentRequestId: detail.paymentRequestId || "",
        bookingId: detail.bookingId || "",
        chargeId: detail.chargeId || "",
        chargeDesc: detail.chargeDesc || "",
        quantity: detail.quantity || "",
        amount: detail.amount || "",
      });
    }
  }, [detail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateDetail({ id, ...formData }).unwrap();
        toast.success("Updated Successfully.");
      } else {
        await addDetail(formData).unwrap();
        toast.success("Added Successfully.");
      }
      // navigate("/paymentRequest");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save detail");
    }
  };

 const [showLoader, setShowLoader] = useState(true);
   
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
    }, []);
     
    if (showLoader || isDetailLoading) {
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
            <Mosaic color="#374151" size="small" />
        </div>
      );
    }

  return (
    <main className="main-container">
      <Toaster position="top-right" />
      <div className={style.editContainer}>
        <div className={style.flexTitleHeader} style={{marginBottom:"-.25rem"}}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
            <h3 className={style.headerLaber}>Edit Payment Request Detail</h3>
        </div>
        <form onSubmit={handleSubmit} className={style.editForm}>
          {/* Payment Request */}
            <label className={style.editLabel}>Select Payment Request:</label>
            <div className={style.customSelectWrapper} ref={paymentRequestRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenPaymentRequest(!openPaymentRequest)}
              >
                {formData.paymentRequestId
                  ? paymentRequests.find((p) => p.id === formData.paymentRequestId)?.requestNumber
                  : "-- Select Payment Request --"}
                  <span className={style.selectArrow}>▾</span>
              </div>

              {openPaymentRequest && (
                <div className={style.customSelectDropdown}>
                  {paymentRequests.map((p) => (
                    <div
                      key={p.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, paymentRequestId: p.id });
                        setOpenPaymentRequest(false);
                      }}
                    >
                      {p.requestNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>

          <label className={style.editLabel}>Select Booking:</label>
           <div className={style.customSelectWrapper} ref={bookingRef}>
            <div
              className={style.customSelectInput}
              onClick={() => setOpenBooking(!openBooking)}
            >
              {formData.bookingId
                ? bookings.find((b) => b.id === formData.bookingId)
                    ? customers.find((c) => c.id === bookings.find((b) => b.id === formData.bookingId).customerId)?.name
                    : ""
                : "-- Select Booking --"}
                  <span className={style.selectArrow}>▾</span>
            </div>

            {openBooking && (
              <div className={style.customSelectDropdown}>
                {bookings.map((b) => {
                  const customer = customers.find((c) => c.id === b.customerId);
                  return (
                    <div
                      key={b.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, bookingId: b.id });
                        setOpenBooking(false);
                      }}
                    >
                      {customer?.name || "N/A"}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <label className={style.editLabel}>Select Charge:</label>
            <div className={style.customSelectWrapper} ref={chargeRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenCharge(!openCharge)}
              >
                {formData.chargeId
                  ? charges.find((c) => c.id === formData.chargeId)?.name
                  : "-- Select Charge --"}
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

          <label className={style.editLabel}>Charge Description:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Charge Description"
            value={formData.chargeDesc}
            onChange={(e) =>
              setFormData({ ...formData, chargeDesc: e.target.value })
            }
          />

          <label className={style.editLabel}>Quantity:</label>
          <input
            className={style.editInput}
            type="number"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />

          <label className={style.editLabel}>Amount:</label>
          <input
            className={style.editInput}
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            required
          />
            <button type="submit" className={style.editButton}>
              {id ? "Update" : "Submit"}
            </button>
        </form>
      </div>
    </main>
  );
}

export default EditPaymentRequestDetail;
