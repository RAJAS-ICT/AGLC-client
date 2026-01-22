import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFetchPaymentRequestQuery } from "../features/paymentRequest";
import { useFetchVendorQuery } from "../features/vendorSlice";
import { useFetchDepartmentQuery } from "../features/departmentSlice";
import { useFetchPettyCashLiquidationQuery, useCreatePettyCashLiquidationMutation } from "../features/pettyCashLiquidationSlice";
import { useGetPaymentRequestDetailsByRequestIdQuery } from "../features/paymentRequestDetailSlice";
import { ToastContainer, toast } from 'react-toastify';

import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function PettyCashLiquidation() {
  const navigate = useNavigate();

  const { data: requests = [], isLoading: loadingRequests, isError, error } = useFetchPaymentRequestQuery();
  const { data: vendors = [] } = useFetchVendorQuery();
  const { data: departments = [] } = useFetchDepartmentQuery();
  const { data: liquidations = [] } = useFetchPettyCashLiquidationQuery();
  const [createPettyCashLiquidation] = useCreatePettyCashLiquidationMutation();

  const activeVendors = vendors.filter(v => v.isActive);
  const activeDepartments = departments.filter(d => d.isActive);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [showModal, setShowModal] = useState(false);
  const [openPayReq, setOpenPayReq] = useState(false);
  const payReqRef = useRef(null);

  const [formData, setFormData] = useState({
    paymentRequestId: null,
    vendor: "",
    department: "",
    chargeTo: "",
    requestType: "",
    remarks: "",
    dateNeeded: "",
    status: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (payReqRef.current && !payReqRef.current.contains(event.target)) setOpenPayReq(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLiquidations = liquidations.filter((l) => {
    const pr = requests.find(r => r.id === l.paymentRequestId);
    if (!pr) return false;

    const keyword = search.toLowerCase();

    const vendorName =
      activeVendors.find(v => v.id === pr.vendorId)?.name?.toLowerCase() || "";

    const departmentName =
      activeDepartments.find(d => d.id === pr.costCenterId)?.name?.toLowerCase() || "";

    return (
      pr.remarks?.toLowerCase().includes(keyword) ||
      pr.chargeTo?.toLowerCase().includes(keyword) ||
      pr.requestType?.toLowerCase().includes(keyword) ||
      pr.requestNumber?.toLowerCase().includes(keyword) ||
      pr.status?.toLowerCase().includes(keyword) ||
      vendorName.includes(keyword) ||
      departmentName.includes(keyword)
    );
  });


  const totalPages = Math.ceil(filteredLiquidations.length / itemsPerPage);
  const currentLiquidations = filteredLiquidations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = page => setCurrentPage(page);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage(p => p - 1);

    const { data: paymentRequestDetails = [] } = useGetPaymentRequestDetailsByRequestIdQuery(
    formData.paymentRequestId,
    { skip: !formData.paymentRequestId }
  );

  const [amount, setAmount] = useState("0.00");

  useEffect(() => {
    if (paymentRequestDetails.length > 0) {
      const total = paymentRequestDetails
        .reduce((sum, d) => sum + d.amount * d.quantity, 0)
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      setAmount(total);
    } else {
      setAmount("0.00");
    }
  }, [paymentRequestDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paymentRequestId) return toast.error("Select a Request Number");

    try {
      await createPettyCashLiquidation({ paymentRequestId: formData.paymentRequestId }).unwrap();
      toast.success("Created Successfully");

      setShowModal(false);

      setFormData({
        paymentRequestId: null,
        vendor: "",
        department: "",
        chargeTo: "",
        requestType: "",
        remarks: "",
        dateNeeded: "",
        status: "",
      });

      setAmount("0.00");

    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };
  
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);


  if (showLoader || loadingRequests) {
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
    if (error?.status === 401) {
      return (
        <div className={style.unauthorizedWrapper}>
          <p className={style.error1}>401</p>
          <p className={style.error2}>Page Not Found.</p>
          <Link to="/login">
            <button className={style.errorLogin}>Unauthorized. Please log in to proceed.</button>
          </Link>
        </div>
      );
    }
    return <p>Error loading data</p>;
  }

  return (
    <main className="main-container">
      <div className={style.ListContainer}>
        <div className={style.pageHeaderContainer}>
          <div className={style.flexTitleHeader}>
            <div className={style.flexheaderTitle}>
              <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M0 12V0h12v2.5H2.5V12z" />
                <path fill="currentColor" d="M16 4H4v12h12z" />
              </svg>
              <h3 className={style.headerLaber}>Petty Cash Liquidation</h3>
            </div>
            <p className={style.headerSubtitle}>Transactions / Petty Cash Liquidation</p>
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
              <button className={style.addBtn} onClick={() => setShowModal(true)} title="Add Payment Request">
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

        <table>
          <thead>
            <tr className={style.headTablePettycashLiquidation}>
              <th>Request Number</th>
              <th>Vendor</th>
              <th>Department</th>
              <th>Charge To</th>
              <th>Request Type</th>
              <th>Remarks</th>
              <th>Date Needed</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentLiquidations.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: "center" }}>No records found</td></tr>
            ) : currentLiquidations.map(l => {
              const pr = requests.find(r => r.id === l.paymentRequestId);
              const vendorName = activeVendors.find(v => v.id === pr?.vendorId)?.name || "--";
              const deptName = activeDepartments.find(d => d.id === pr?.costCenterId)?.name || "--";
              return (
                <tr key={l.id} className={style.bodyTablePettycashLiquidation}>
                  <td>{pr?.requestNumber || l.paymentRequestId}</td>
                  <td>{vendorName}</td>
                  <td>{deptName}</td>
                  <td>{pr?.chargeTo || "--"}</td>
                  <td>{pr?.requestType || "--"}</td>
                  <td>{pr?.remarks || "--"}</td>
                  <td>{pr?.dateNeeded ? new Date(pr.dateNeeded).toLocaleDateString() : "--"}</td>
                  <td>
                    <span
                        className={`${style.badge} ${
                          pr.status === "Open"
                            ? style.open
                            : pr.status === "Released"
                            ? style.released
                            : pr.status === "Canceled"
                            ? style.cancelled
                            : ""
                        }`}
                      >
                        {pr.status}
                      </span>
                  </td>
                  <td>
                    <button className={style.editBtn} onClick={() => navigate(`/editPettyCashLiquidation/${l.id}`)}>
                      <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={style.paginationContainer}>
            <button className={style.pageButton} onClick={handlePrevious} disabled={currentPage === 1}>Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} className={`${style.pageButton} ${currentPage === i + 1 ? style.activePage : ""}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
            ))}
            <button className={style.pageButton} onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}

        {/* modal */}
        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Petty Cash Liquidation</h3>
                <button className={style.closeButton} onClick={() => { setFormData({ paymentRequestId: null, vendor: "", department: "", chargeTo: "", requestType: "", remarks: "", dateNeeded: "", status: "", amount:"" }); setShowModal(false); }}>✕</button>
              </div>

              <form className={style.formContainer} onSubmit={handleSubmit}>
                {/* request number dropdown */}

                <div style={{ display:'flex', width:'100%', gap: '1rem'}}>
                  <div style={{ display:'flex', flexDirection:'column', width:'100%'}}>
                    <label className={style.modalLabel}>Request Number</label>
                    <div className={style.customSelectWrapper} ref={payReqRef}>
                      <div className={style.customSelectInput} onClick={() => setOpenPayReq(!openPayReq)}>
                        {formData.paymentRequestId ? requests.find(r => r.id === formData.paymentRequestId)?.requestNumber : "Select Request Number"}
                        <span className={style.selectArrow}>▾</span>
                      </div>
                      {openPayReq && (
                        <div className={style.customSelectDropdown}>
                          {requests.filter(r => r.status === "Released").map(pr => (
                            <div
                              key={pr.id}
                              className={style.customSelectOption}
                              onClick={() => {
                                const vendorName = activeVendors.find(v => v.id === pr.vendorId)?.name || "";
                                const deptName = activeDepartments.find(d => d.id === pr.costCenterId)?.name || "";
                                setFormData({
                                  paymentRequestId: pr.id,
                                  vendor: vendorName,
                                  department: deptName,
                                  chargeTo: pr.chargeTo || "",
                                  requestType: pr.requestType || "",
                                  remarks: pr.remarks || "",
                                  dateNeeded: pr.dateNeeded ? new Date(pr.dateNeeded).toLocaleDateString() : "",
                                  status: pr.status || "",
                                });
                                setOpenPayReq(false);
                              }}
                            >
                              {pr.requestNumber}
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div> 
                <div style={{ display:'flex', flexDirection:'column', width:'100%',}}>
                  <label className={style.modalLabel}>Vendor</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.vendor} readOnly />
              </div>
              </div>
              <div style={{ display:'flex', width:'100%', gap: '1rem'}}>
                <div style={{ display:'flex', flexDirection:'column', width:'100%'}}>
                  <label className={style.modalLabel}>Department</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.department} readOnly />
                </div>
                <div style={{ display:'flex', flexDirection:'column', width:'100%'}}>
                  <label className={style.modalLabel}>Charge To</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.chargeTo} readOnly />
                </div>
                </div>
                  <label className={style.modalLabel}>Request Type</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.requestType} readOnly />

                  <label className={style.modalLabel}>Remarks</label>
                  <textarea style={{outline:'none', cursor:'not-allowed'}} className={style.modalTextarea} value={formData.remarks} readOnly />
                <div style={{ display:'flex', width:'100%', gap: '1rem'}}>
                <div style={{ display:'flex', flexDirection:'column', width:'100%'}}>
                  <label className={style.modalLabel}>Date Needed</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.dateNeeded} readOnly />
                  </div>
                <div style={{ display:'flex', flexDirection:'column', width:'100%'}}>
                  <label className={style.modalLabel}>Status</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={formData.status} readOnly />
                </div>
                </div>
                  <label className={style.modalLabel}>Total Amount</label>
                  <input style={{outline:'none',cursor:'not-allowed'}} type="text" className={style.modalInput} value={amount} readOnly />

                <div className={style.modalActions}>
                  <button type="button" className={style.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={style.submitButton}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default PettyCashLiquidation;
