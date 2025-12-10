import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import {
  useFetchPaymentRequestByIdQuery,
  useUpdatePaymentRequestMutation,
} from "../../features/paymentRequest";
import { useFetchVendorQuery } from "../../features/vendorSlice";
import { useFetchDepartmentQuery } from "../../features/departmentSlice";
import { useFetchBookingQuery } from "../../features/bookingSlice";
import { useFetchChargeQuery } from "../../features/chargeSlice";
import {
  usePostPaymentRequestDetailMutation,
  useGetPaymentRequestDetailsByRequestIdQuery
} from "../../features/paymentRequestDetailSlice";
import {useGetPaymentRequestDetailByIdQuery} from '../../features/paymentRequestDetailSlice'
import { useDeletePaymentRequestMutation} from "../../features/paymentRequest";
import { useDeleteAllDetailsMutation } from "../../features/paymentRequest";

import style from "../css/page.module.css";
import jsPDF from "jspdf";
import { Mosaic } from "react-loading-indicators";

function EditPaymentRequest() {

  const [localDetails, setLocalDetails] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(localDetails.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDetails = localDetails.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: paymentRequest, isLoading, isError, error } = useFetchPaymentRequestByIdQuery(id);

  const { data: vendors = [], isLoading: loadingVendors  } = useFetchVendorQuery();
  const { data: departments = [], isLoading: loadingDepartments  } = useFetchDepartmentQuery();
  const [updatePaymentRequest , { isLoading: isUpdating }] = useUpdatePaymentRequestMutation();

  const { data: paymentRequestDetails = [], isLoading: loadingDetails } = useGetPaymentRequestDetailsByRequestIdQuery(id);

  const { data: bookings = [] } = useFetchBookingQuery();
  const { data: charges = [] } = useFetchChargeQuery();
  const [postDetail] = usePostPaymentRequestDetailMutation();
  const { data: detail } = useGetPaymentRequestDetailByIdQuery(id);

useEffect(() => {
  if (detail) {
    setDetailForm({
      paymentRequestId: detail.paymentRequestId || id,
      bookingId: detail.bookingId || "",
      chargeId: detail.chargeId || "",
      chargeDesc: detail.chargeDesc || "",
      quantity: detail.quantity || "",
      amount: detail.amount || "",
    });
  }
}, [detail, id]);

  const [formData, setFormData] = useState({
    vendorId: "",
    departmentId: "",
    chargeTo: "",
    requestType: "",
    remarks: "",
    dateNeeded: "",
    requestNumber: "",
    status: "Canceled"
  });

  useEffect(() => {
    if (paymentRequest) {
      setFormData({
        vendorId: paymentRequest.vendorId || "",
        departmentId: paymentRequest.departmentId || paymentRequest.costCenterId || "",
        chargeTo: paymentRequest.chargeTo || "",
        requestType: paymentRequest.requestType || "",
        remarks: paymentRequest.remarks || "",
        status: paymentRequest.status || "",
        dateNeeded: paymentRequest.dateNeeded
          ? new Date(paymentRequest.dateNeeded).toISOString().slice(0, 10)
          : "",
        requestNumber: paymentRequest.requestNumber || "",
      });
    }
  }, [paymentRequest]);

  const [openVendor, setOpenVendor] = useState(false);
  const vendorRef = useRef(null);
  const [openDepartment, setOpenDepartment] = useState(false);
  const departmentRef = useRef(null);
  const [openRequestType, setOpenRequestType] = useState(false);
  const requestTypeRef = useRef(null);
  const requestTypeOptions = ["Check", "Manager's Check", "Petty Cash"];

  const [showModal, setShowModal] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openCharge, setOpenCharge] = useState(false);
  const bookingRef = useRef();
  const chargeRef = useRef();

  const [detailForm, setDetailForm] = useState({
    paymentRequestId: id,
    bookingId: "",
    chargeId: "",
    chargeDesc: "",
    quantity: "",
    amount: "",
  });
  const [isPostingDetail, setIsPostingDetail] = useState(false);
  // const [localDetails, setLocalDetails] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) setOpenVendor(false);
      if (departmentRef.current && !departmentRef.current.contains(event.target)) setOpenDepartment(false);
      if (requestTypeRef.current && !requestTypeRef.current.contains(event.target)) setOpenRequestType(false);
      if (bookingRef.current && !bookingRef.current.contains(event.target)) setOpenBooking(false);
      if (chargeRef.current && !chargeRef.current.contains(event.target)) setOpenCharge(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!paymentRequestDetails || !paymentRequestDetails.length) return;

    setLocalDetails(prev => {
      const newDetails = paymentRequestDetails.map(d => ({
        id: d.id,
        paymentRequestId: d.paymentRequestId,
        bookingId: d.booking?.id || "",
        chargeId: d.charge?.id || "",
        chargeDesc: d.chargeDesc,
        quantity: d.quantity,
        amount: d.amount,
        poNumber: d.poNumber || "",
        bookingNumber: d.booking?.bookingNumber || "",
        chargeName: d.charge?.name || "",
      }));
      const isSame = JSON.stringify(prev) === JSON.stringify(newDetails);
      return isSame ? prev : newDetails;
    });
  }, [paymentRequestDetails]);

  const handleSubmitMain = async (e) => {
    e.preventDefault();
    try {
      await updatePaymentRequest({
        id,
        vendorId: Number(formData.vendorId),
        departmentId: Number(formData.departmentId),
        chargeTo: formData.chargeTo,
        requestType: formData.requestType,
        requestNumber: formData.requestNumber,
        remarks: formData.remarks,
        status: formData.status,
        dateNeeded: formData.dateNeeded,
      }).unwrap();

      toast.success("Updated successfully!");
      // navigate("/paymentRequest");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update Payment Request.");
    }
  };

  const handleRequestTypeChange = (type) => {
    let prefix = "";
    if (type === "Check") prefix = "CR";
    else if (type === "Manager's Check") prefix = "MCR";
    else if (type === "Petty Cash") prefix = "PCR";

    const year = new Date().getFullYear();
    const currentNumber = formData.requestNumber || "";
    const newRequestNumber = currentNumber.startsWith(prefix) ? currentNumber : `${prefix}${year}`;

    setFormData({ ...formData, requestType: type, requestNumber: newRequestNumber });
  };

const handleSubmitDetail = async (e) => {
  e.preventDefault();
  setIsPostingDetail(true);

  try {
    const payload = {
      ...detailForm,
      bookingId: detailForm.bookingId ? Number(detailForm.bookingId) : null,
      chargeId: detailForm.chargeId ? Number(detailForm.chargeId) : null,
      quantity: detailForm.quantity ? Number(detailForm.quantity) : 0,
      amount: detailForm.amount ? Number(detailForm.amount) : 0,
    };

    const savedDetail = await postDetail(payload).unwrap();

    setLocalDetails(prev => [
      ...prev,
      {
        ...savedDetail.data,
        bookingNumber: savedDetail.data.booking?.bookingNumber || "",
        chargeName: savedDetail.data.charge?.name || "",
      }
    ]);
    toast.success("Added successfully");
  } catch (error) {
    toast.error("Error saving detail");
    console.log(error);
  } finally {
    setDetailForm({
      paymentRequestId: id,
      bookingId: "",
      chargeId: "",
      chargeDesc: "",
      quantity: "",
      amount: "",
    });
    setShowModal(false);
    setIsPostingDetail(false);
  }
};

function numberToWords(amount) {
  if (!amount) return "";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  function convert(num) {
    if (num === 0) return "";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      let t = Math.floor(num / 10);
      let o = num % 10;
      return tens[t] + (o ? " " + ones[o] : "");
    }
    if (num < 1000) {
      let h = Math.floor(num / 100);
      let rest = num % 100;
      return ones[h] + " Hundred" + (rest ? " " + convert(rest) : "");
    }
    if (num < 1000000) {
      let th = Math.floor(num / 1000);
      let rest = num % 1000;
      return convert(th) + " Thousand" + (rest ? " " + convert(rest) : "");
    }
    return num.toString();
  }

  if (typeof amount === "string") amount = parseFloat(amount);

  let pesos = Math.floor(amount);
  let centavos = Math.round((amount - pesos) * 100);

  let words = convert(pesos) + " Pesos";

  if (centavos > 0) {
    words += " And " + convert(centavos) + " Centavos";
  }

  return words + " Only";
}

const generatePDF = () => {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;
  const boxW = 520;

  // HEADER
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ACESTAR GLOBAL LOGISTICS CORP", pageWidth / 2, y, { align: "center" });

  const text = "ACESTAR GLOBAL LOGISTICS CORP";
  const textWidth = doc.getTextWidth(text);
  const startX = (pageWidth - textWidth) / 2;
  doc.setLineWidth(1);
  doc.line(startX, y + 3, startX + textWidth, y + 3);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Head Office", pageWidth / 2, y + 16, { align: "center" });

  y += 60;

  const bookingIdToShow = localDetails.length > 0 ? localDetails[0].bookingNumber : "";
  const leftMargin = 40; 
  const rightMargin = 52; 

if ((departmentType || "").toLowerCase() === "operation" && bookingIdToShow) {

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    doc.text(`Check Request Payment `, leftMargin, y);

    const rightText = `Request Number: ${bookingIdToShow}`;
    const rightTextWidth = doc.getTextWidth(rightText);
    doc.text(
      rightText,
      doc.internal.pageSize.getWidth() - rightMargin - rightTextWidth,
      y
    );

    y += 10;
  }

  // PAYEE BOX
  const boxH = 95;
  doc.rect(margin, y, boxW, boxH);

  let leftY = y + 18;

  doc.setFont("helvetica", "normal");
  doc.text("Payee:", margin + 10, leftY);

  doc.setFont("helvetica", "bold");
  doc.text(activeVendors.find(v => v.id === formData.vendorId)?.name || "", margin + 50, leftY);

  doc.setFont("helvetica", "normal");
  leftY += 18;
  doc.text(`Charge To:  ${formData.chargeTo}`, margin + 10, leftY);
  leftY += 18;
  doc.text(`Cost Center:  ${activeDepartments.find(d => d.id === formData.departmentId)?.name || ""}`, margin + 10, leftY);
  leftY += 18;
  doc.text(`Remarks:  ${formData.remarks}`, margin + 10, leftY);

  doc.text(`Date Needed: ${formData.dateNeeded}`, margin + boxW - 180, y + 18);

  y += boxH + 20;

  // TABLE HEADER
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, boxW, 22);
  doc.text("Description of Item / Service Rendered", margin + 8, y + 15);
  doc.text("Amount (Php)", margin + 260, y + 15);
  doc.text("P.O Number", margin + 400, y + 15);

  y += 22;

 // TABLE BODY
  doc.setFont("helvetica", "normal");
  let totalAmount = 0;

  localDetails.forEach((detail) => {
    const chargeName = charges.find((c) => c.id === detail.chargeId)?.name || "";
    const quantity = Number(detail.quantity) || 0;
    const amount = Number(detail.amount) || 0;
    const total = quantity * amount; 

    doc.rect(margin, y, boxW, 22);
    doc.line(margin + 250, y, margin + 250, y + 22);
    doc.line(margin + 380, y, margin + 380, y + 22);

    doc.text(chargeName, margin + 8, y + 15);
    doc.text(total.toLocaleString(), margin + 260, y + 15); 
    doc.text(detail.poNumber || "", margin + 400, y + 15);

    totalAmount += total; 
    y += 22;
  });

  const words = numberToWords(totalAmount);
  const padding = 10;
  const leftColWidth = 250 - padding * 2;
  const lineHeight = 14;

  const lines = doc.splitTextToSize(words, leftColWidth);

  const rowHeight = Math.max(lines.length * lineHeight, 22);

  doc.rect(margin, y, boxW, rowHeight);
  doc.line(margin + 250, y, margin + 250, y + rowHeight);
  doc.line(margin + 380, y, margin + 380, y + rowHeight);

  const textBlockHeight = lines.length * lineHeight;
  const startY = y + (rowHeight - textBlockHeight) / 2 + lineHeight * 0.75;
  lines.forEach((line, i) => {
    doc.text(line, margin + padding, startY + i * lineHeight);
  });

  doc.text(totalAmount.toLocaleString(), margin + 260, y + 15);

  y += rowHeight + 50;

  // SIGNATURES
  const colW = boxW / 3;

  doc.setFont("helvetica", "normal");
  doc.text("____________________", margin, y);            
  doc.text("____________________", margin + colW, y);    
  doc.text("____________________", margin + colW * 2, y);

  y += 18; 

  doc.setFont("helvetica", "bold");
  doc.text("Requested by:", margin, y);
  doc.text("Validated by:", margin + colW, y);
  doc.text("Received by:", margin + colW * 2, y);

  y += 18; 
          
  const roleMiddle = margin + colW;      
  const roleRight = margin + colW * 2;  

  doc.text("Department Head", roleMiddle, y);
  doc.text("Accounting Department", roleRight, y);

  doc.save(`PaymentRequest_${formData.requestNumber || "id"}.pdf`);

};

  const [deletePaymentRequest] = useDeletePaymentRequestMutation();
  const handleDelete = async (id) => {
    try {
      await deletePaymentRequest(id).unwrap();
      setLocalDetails(prev => prev.filter(d => d.id !== id));
      toast.success("Deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed.");
    }
  };
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  
  const activeVendors = vendors.filter((v) => v.isActive);
  const activeDepartments = departments.filter((d) => d.isActive);

  const departmentType = formData.departmentId
    ? activeDepartments.find((d) => d.id === formData.departmentId)?.type || ""
    : "";

  // department change when click
  const [departmentModal, setDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const handleDepartmentClick = (dept) => {
    const hasBookingData = localDetails.length > 0;
    if (hasBookingData) {
      setSelectedDepartment(dept);
      setDepartmentModal(true);
    } else {
      setFormData({ ...formData, departmentId: dept.id });
    }
  };

  const [deleteAllDetails] = useDeleteAllDetailsMutation();

  const confirmDepartmentChange = async () => {
    if (!selectedDepartment) return;

    try {
      if (localDetails.length > 0) {
        await deleteAllDetails(id).unwrap();
        setLocalDetails([]);
      }
      setFormData({ ...formData, departmentId: selectedDepartment.id });
    } catch (error) {
      console.log(error);
      toast.error("Failed to clear existing details.");
    } finally {
      setDepartmentModal(false);
      setSelectedDepartment(null);
    }
  };

  const cancelDepartmentChange = () => {
    setDepartmentModal(false);
    setSelectedDepartment(null);
  };

  const chargeToOptions = ["AGLC", "Employee", "Subcon", "Client"];
  const [openChargeTo, setOpenChargeTo] = useState(false);
  const chargeToRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chargeToRef.current && !chargeToRef.current.contains(event.target)) {
        setOpenChargeTo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

   const [showLoader, setShowLoader] = useState(true);
     
    useEffect(() => {
      const timer = setTimeout(() => setShowLoader(false), 1000);
      return () => clearTimeout(timer);
      }, []);
       
    if (showLoader || isLoading || loadingVendors || loadingDepartments || loadingDetails) {
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

  if (isError) return <p>Error: {error?.message || "Something went wrong"}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editContainer}>
        <div className={style.flexTitleHeaderPayReq}>
          <div style={{
            display:"flex",
            alignItems:"center",
            gap:".75rem",
          }}>
              <svg
              className={style.svgTitleHeader}
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"
              />
            </svg>
            <h3 className={style.headerLaber}>Edit Payment Request</h3>
          </div>
            <div className={style.flexPdfBtn}>
              <button className={style.addBtnPayReq} onClick={() => {
                setDetailForm({
                  paymentRequestId: id,
                  bookingId: "",
                  chargeId: "",
                  chargeDesc: "",
                  quantity: "",
                  amount: "",
                });
                setShowModal(true);
              }}>
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
              <button className={style.pdfBtn} onClick={generatePDF}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="m18 21l4-4l-1.4-1.4l-1.6 1.6v-4.175h-2V17.2l-1.6-1.6L14 17zm-4 3v-2h8v2zm-8-4q-.825 0-1.412-.587T4 18V4q0-.825.588-1.412T6 2h7l6 6v3.025h-2V9h-5V4H6v14h6v2zm0-2V4z" />
              </svg>
              </button>
            </div>
        </div>

        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Payment Request Detail</h3>
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

            <form onSubmit={handleSubmitDetail} className={style.formContainer}>

              {departmentType.toLowerCase() === "operation" && (
                <>
                  {/* Booking */}
                  <div className={style.customSelectWrapper} ref={bookingRef}>
                    <div
                      className={style.customSelectInput}
                      onClick={() => setOpenBooking(!openBooking)}
                    >
                      {detailForm.bookingId
                        ? bookings.find((b) => b.id === detailForm.bookingId)?.bookingNumber
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
                              setDetailForm({ ...detailForm, bookingId: b.id });
                              setOpenBooking(false);
                            }}
                          >
                            {b.bookingNumber}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Charge */}
                  <div className={style.customSelectWrapper} ref={chargeRef}>
                    <div
                      className={style.customSelectInput}
                      onClick={() => setOpenCharge(!openCharge)}
                    >
                      {detailForm.chargeId
                        ? charges.find((c) => c.id === detailForm.chargeId)?.name
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
                              setDetailForm({ ...detailForm, chargeId: c.id, chargeDesc: c.name });
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
                  style={{
                    outline:"none",
                    cursor:"not-allowed"
                  }}
                    type="text"
                    placeholder="Charge Description"
                    value={detailForm.chargeDesc}
                    readOnly
                  />
                </>
              )}

              {departmentType.toLowerCase() === "administrative" && (
                <input
                  type="text"
                  placeholder="Charge Description"
                  value={detailForm.chargeDesc}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, chargeDesc: e.target.value })
                  }
                />
              )}

              <input
                type="number"
                placeholder="Quantity"
                value={detailForm.quantity}
                onChange={(e) =>
                  setDetailForm({ ...detailForm, quantity: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Amount"
                value={detailForm.amount}
                onChange={(e) =>
                  setDetailForm({ ...detailForm, amount: e.target.value })
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
                <button type="submit" className={style.submitButton} disabled={isPostingDetail}>
                  {isPostingDetail ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>

            </div>
          </div>
        )}

          <div className={style.flexFormTable}>
            <form onSubmit={handleSubmitMain} className={style.editFormPayReq}>
              <div className={style.editPaymentReqSelect}>
                <div className={style.flexSelectPayment}>
              {/* Vendor */}
              <label className={style.editLabelPayment}>Vendor:</label>
                <div className={style.customSelectWrapper} ref={vendorRef}>
                  <div className={style.customSelectInput} onClick={() => setOpenVendor(!openVendor)}>
                    {formData.vendorId
                      ? activeVendors.find((v) => v.id === formData.vendorId)?.name
                      : "-- Select Vendor --"}
                    <span className={style.selectArrow}>▾</span>
                  </div>
                  {openVendor && (
                    <div className={style.customSelectDropdown}>
                      {activeVendors
                      .filter((v) => v.id !== formData.vendorId)
                      .map((v) => (
                        <div
                          key={v.id}
                          className={style.customSelectOption}
                          onClick={() => {
                            setFormData({ ...formData, vendorId: v.id });
                            setOpenVendor(false);
                          }}
                        >
                          {v.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            <div className={style.flexSelectPayment}>
              {/* Department */}
              <label className={style.editLabelPayment}>Department:</label>
              <div className={style.customSelectWrapper} ref={departmentRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenDepartment(!openDepartment)}
                >
                  {formData.departmentId
                    ? activeDepartments.find((d) => d.id === formData.departmentId)?.name
                    : "-- Select Department --"}
                  <span className={style.selectArrow}>▾</span>
                </div>
                {openDepartment && (
                  <div className={style.customSelectDropdown}>
                  {activeDepartments
                    .filter((d) => d.id !== formData.departmentId)
                    .map((d) => (
                    <div
                      key={d.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        handleDepartmentClick(d); 
                        setOpenDepartment(false);
                      }}
                    >
                      {d.name}
                    </div>
                  ))}
                  </div>
                )}
                </div>
              </div>

              {departmentModal && selectedDepartment && (
                <div className={style.modalOverlay}>
                  <div className={style.modalDialog}>
                    <svg className={style.deleteCloseSvg} xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
                      <path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01m181.008-630.016c-12.496-12.496-32.752-12.496-45.248 0L512 466.752l-135.76-135.76c-12.496-12.496-32.752-12.496-45.264 0c-12.496 12.496-12.496 32.752 0 45.248L466.736 512l-135.76 135.76c-12.496 12.48-12.496 32.769 0 45.249c12.496 12.496 32.752 12.496 45.264 0L512 557.249l135.76 135.76c12.496 12.496 32.752 12.496 45.248 0c12.496-12.48 12.496-32.769 0-45.249L557.248 512l135.76-135.76c12.512-12.512 12.512-32.768 0-45.248" />
                    </svg>
                    <h3 className={style.modalTitle}>Are you sure?</h3>
                    <p className={style.modalText}>
                      Changing department to <b>{selectedDepartment.name}</b> will clear all existing charge details. Do you want to proceed?
                    </p>
                    <div className={style.modalButtons}>
                      <button className={style.cancelDeleteBtn} onClick={cancelDepartmentChange}>
                        Cancel
                      </button>
                      <button className={style.confirmDeleteBtn} onClick={confirmDepartmentChange}>
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={style.flexSelectPaymentRead}>
                <label className={style.editLabel}>Type:</label>
                <input
                  className={style.editInput}
                  type="text"
                  placeholder="Department Type"
                  value={
                    formData.departmentId
                      ? activeDepartments.find((d) => d.id === formData.departmentId)?.type || ""
                      : ""
                  }
                  readOnly
                  style={{
                    cursor: "not-allowed",
                    outline: "none",
                    color: "#000",
                    // background: "#f2f2f2",
                  }}
                />
              </div>
            </div>

         <div className={style.editPaymentReqSelect}>
            <div className={style.flexSelectPaymentReq}>
          {/* Request Type */}
          <label className={style.editLabel}>Request Type:</label>
            <div className={style.customSelectWrapper} ref={requestTypeRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenRequestType(!openRequestType)}
              >
                {formData.requestType || "-- Select Request Type --"}
                <span className={style.selectArrow}>▾</span>
              </div>
              {openRequestType && (
                <div className={style.customSelectDropdown}>
                  {requestTypeOptions.map((type) => (
                    <div
                      key={type}
                      className={style.customSelectOption}
                      onClick={() => {
                        handleRequestTypeChange(type);
                        setOpenRequestType(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={style.flexSelectPaymentReq}>
            {/* Request Number */}
            <label className={style.editLabel}>Request Number:</label>
            <input
              type="text"
              className={style.editInputReq}
              value={formData.requestNumber}
              readOnly
            />
            </div>
          </div>

          {/* Charge To */}
            <label className={style.editLabel}>Charge To:</label>

            <div className={style.customSelectWrapper} ref={chargeToRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenChargeTo(!openChargeTo)}
              >
                {formData.chargeTo || "Select Charge To"}
                <span className={style.selectArrow}>▾</span>
              </div>

              {openChargeTo && (
                <div className={style.customSelectDropdown}>
                  {chargeToOptions.map((option) => (
                    <div
                      key={option}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, chargeTo: option });
                        setOpenChargeTo(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>


          {/* Remarks */}
          <label className={style.editLabel}>Remarks:</label>
          <textarea
            placeholder="Remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />

          {/* Date Needed */}
          <label className={style.editLabel}>Date Needed:</label>
          <input
            className={style.editInput}
            type="date"
            value={formData.dateNeeded}
            onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
            required
          />

         <div className={style.flexBtn}>
            <button
              type="button"
              className={style.cancelBtn}
              onClick={() => {
                toast((t) => (
                  <div> 
                    <p style={{ marginBottom: "24px", marginTop:"10px" }}>
                      Cancel this Payment Request?
                    </p>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button
                        onClick={async () => {
                          toast.dismiss(t.id);
                          setFormData({ ...formData, status: "Canceled" });

                          try {
                            await updatePaymentRequest({
                              id,
                              ...formData,
                              status: "Canceled",
                            }).unwrap();

                            toast.success("Payment Request Canceled");
                          } catch (err) {
                            toast.error("Failed to cancel");
                            console.log(err);
                          }
                        }}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                          background: "#6c757d",
                          color: "#fff",
                          border: "none",
                          padding: "6px 16px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ), {
                  duration: Infinity,
                  position: "top-center",
                });
              }}
            >
              Cancel
            </button>
            <button className={style.editButton} type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </button>
         </div>
        </form>
                  
          <div className={style.payReqTempTable}>
            <table className={style.table}>
              <thead>
                {(() => {
                  const isOperation = departmentType.toLowerCase() === "operation";
                  const gridColumns = isOperation
                    ? "50px 1fr 1fr 100px 100px" 
                    : "50px 1fr 100px 100px";     

                  return (
                    <tr
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridColumns,
                        marginBottom: "4px",
                        border: "1px solid #ddd",
                        fontSize: "14px",
                        textAlign: "left",
                        backgroundColor: "#fff",
                      }}
                      className={style.editThPayreq}
                    >
                      <th className={style.thPayreq}></th>
                      {isOperation && <th className={style.thPayreq}>Booking ID</th>}
                      <th className={style.thPayreq}>Description</th>
                      <th className={style.thPayreq}>Qty</th>
                      <th className={style.thPayreq}>Amount</th>
                    </tr>
                  );
                })()}
              </thead>
              <tbody>
                {currentDetails.length === 0 ? (
                  <tr>
                    <td
                      colSpan={departmentType.toLowerCase() === "operation" ? 5 : 4}
                      className={style.payreqDetails}
                      style={{ textAlign: "center" }}
                    >
                      No details found
                    </td>
                  </tr>
                ) : (
                  currentDetails.map((d) => {
                    const isOperation = departmentType.toLowerCase() === "operation";
                    const gridColumns = isOperation
                      ? "50px 1fr 1fr 100px 100px"
                      : "50px 1fr 100px 100px";

                    return (
                      <tr
                        key={d.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: gridColumns,
                          boxShadow: "none !important",
                          fontWeight: "300",
                          fontSize: "14px",
                          border: "1px solid #ddd",
                          marginBottom: "2px",
                          // boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 2px 0px"
                        }}
                      >
                        <td className={style.payreqTd}>
                          <button
                            onClick={() => {
                              setDeleteId(d.id);
                              setDeleteModal(true);
                            }}
                            className={style.deleteBtn}
                            title="Delete"
                          >
                            <svg
                              className={style.deleteSvg}
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
                              />
                            </svg>
                          </button>

                        </td>
                        {isOperation && <td className={style.payreqTd}>{d.bookingNumber}</td>}
                        <td className={style.payreqTd}>{d.chargeDesc}</td>
                        <td className={style.payreqTd}>{d.quantity}</td>
                        <td className={style.payreqTd}>{d.amount}</td>
                      </tr>
                    );
                  })
                )}

                {/* Total row */}
                {(() => {
                  const isOperation = departmentType.toLowerCase() === "operation";
                  const gridColumns = isOperation
                    ? "100px 100px 1fr 100px 100px"
                    : "100px 1fr 100px 100px";

                  return (
                    <tr
                      className={style.tableTrHistory}
                      style={{ display: "grid", gridTemplateColumns: gridColumns }}
                    >
                      <td className={style.payreqTdTotal}>Total:</td>
                      {isOperation && <td className={style.payreqTd}></td>}
                      <td className={style.payreqTd}></td>
                      <td className={style.payreqTdTotal}></td>
                      <td className={style.payreqTdTotal}>
                        {localDetails.reduce(
                          (sum, d) => sum + (Number(d.quantity || 0) * Number(d.amount || 0)),
                          0
                        )}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>

              {deleteModal && (
                <div className={style.modalOverlay}>
                  <div className={style.modalDialog}>
                    <svg className={style.deleteCloseSvg} xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
                      <path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01m181.008-630.016c-12.496-12.496-32.752-12.496-45.248 0L512 466.752l-135.76-135.76c-12.496-12.496-32.752-12.496-45.264 0c-12.496 12.496-12.496 32.752 0 45.248L466.736 512l-135.76 135.76c-12.496 12.48-12.496 32.769 0 45.249c12.496 12.496 32.752 12.496 45.264 0L512 557.249l135.76 135.76c12.496 12.496 32.752 12.496 45.248 0c12.496-12.48 12.496-32.769 0-45.249L557.248 512l135.76-135.76c12.512-12.512 12.512-32.768 0-45.248" />
                    </svg>
                    <h3 className={style.modalTitle}>Are you sure? </h3>
                    <p className={style.modalText}>Changing department type will clear all the charge details. Do you want to proceed?</p>
                    <div className={style.modalButtons}>
                      <button
                        className={style.cancelDeleteBtn}
                        onClick={() => setDeleteModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className={style.confirmDeleteBtn}
                        onClick={async () => {
                          await handleDelete(deleteId);
                          setDeleteModal(false);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                      currentPage === i + 1 ? style.activePage : ''
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
        </div>
      </div>
    </main>
  );
}

export default EditPaymentRequest;
