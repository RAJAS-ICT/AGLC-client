import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useFetchPaymentRequestQuery, usePostPaymentRequestMutation } from "../features/paymentRequest";
import { useFetchVendorQuery } from "../features/vendorSlice";
import { useFetchDepartmentQuery } from "../features/departmentSlice";
import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function PaymentRequestPage() {

  const [openVendor, setOpenVendor] = useState(false);
  const vendorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) {
        setOpenVendor(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const [openDepartment, setOpenDepartment] = useState(false);
  const departmentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentRef.current && !departmentRef.current.contains(event.target)) {
        setOpenDepartment(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const [openRequestType, setOpenRequestType] = useState(false);
  const requestTypeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (requestTypeRef.current && !requestTypeRef.current.contains(event.target)) {
        setOpenRequestType(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requestTypes = ["Check", "Manager's Check", "Petty Cash"];

  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useFetchPaymentRequestQuery();
  const paymentRequests = data ?? [];

  const { data: vendors = [] } = useFetchVendorQuery();
  const { data: departments = [] } = useFetchDepartmentQuery();

  const activeVendors = vendors.filter((v) => v.isActive);
  const activeDepartments = departments.filter((d) => d.isActive);

  const [addPayment] = usePostPaymentRequestMutation();

  const [formData, setFormData] = useState({
    vendorId: "",
    costCenterId: "",
    dateNeeded: "",
    requestType:'',
    requestNumber:'',
    chargeTo: "",
    remarks: "",
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);

  const filteredRequests = paymentRequests.filter(
    (pr) =>
      pr.remarks?.toLowerCase().includes(search.toLowerCase()) ||
      pr.chargeTo?.toLowerCase().includes(search.toLowerCase()) ||
      pr.requestType?.toLowerCase().includes(search.toLowerCase()) ||
      pr.requestNumber?.toLowerCase().includes(search.toLowerCase()) ||
      activeVendors.find((v) => v.id === pr.vendorId)?.name?.toLowerCase().includes(search.toLowerCase()) ||
      activeDepartments.find((d) => d.id === pr.costCenterId)?.name?.toLowerCase().includes(search.toLowerCase())
  );

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

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addPayment(formData).unwrap();
      toast.success(response.message || "Payment Request added!");
      setFormData({ vendorId: "", costCenterId: "", dateNeeded: "", chargeTo: "", requestType: "", requestNumber: "", remarks: ""});
      setShowModal(false);
      navigate(`/editPaymentRequest/${response.data.id}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add Payment Request");
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
             <Mosaic color="#007bff" size="small" />
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
              <h3 className={style.headerLaber}>Payment Request</h3>
            </div>
            <div className={style.flexHeader}>
              <input
                className={style.searchBox}
                type="text"
                placeholder="Search..."
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
                <h3>Add Payment Request</h3>
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
               <div className={style.customSelectWrapper} ref={vendorRef} >
                  <div
                    className={style.customSelectInput}
                    onClick={() => setOpenVendor(!openVendor)}
                  >
                    {formData.vendorId
                      ? activeVendors.find((v) => v.id === formData.vendorId)?.name
                      : "Select Vendor"}
                    <span className={style.selectArrow}>▾</span>
                  </div>

                  {openVendor && (
                    <div className={style.customSelectDropdown}>
                      {activeVendors.length === 0 ? (
                        <div className={style.customSelectOption} style={{ cursor: "default" }}>
                          No vendors
                        </div>
                      ) : (
                        activeVendors.map((v) => (
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
                        ))
                      )}
                    </div>
                  )}
                </div>

              <input
                style={{color:"#000"}}
                  type="date"
                  value={formData.dateNeeded}
                  onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                  required
                />

              <div className={style.customSelectWrapper} ref={departmentRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenDepartment(!openDepartment)}
                >
                  {formData.costCenterId
                    ? activeDepartments.find((d) => d.id === formData.costCenterId)?.name
                    : "Select Department"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openDepartment && (
                  <div className={style.customSelectDropdown}>
                    {activeDepartments.length === 0 ? (
                      <div className={style.customSelectOption} style={{ cursor: "default" }}>
                        No departments
                      </div>
                    ) : (
                      activeDepartments.map((d) => (
                        <div
                          key={d.id}
                          className={style.customSelectOption}
                          onClick={() => {
                            setFormData({ ...formData, costCenterId: d.id });
                            setOpenDepartment(false);
                          }}
                        >
                          {d.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

               <input
                  type="text"
                  placeholder="Department Type"
                  value={
                    formData.costCenterId
                      ? activeDepartments.find((d) => d.id === formData.costCenterId)?.type || ""
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

                
            <div className={style.customSelectWrapper} ref={requestTypeRef} style={{ marginBottom: ".75rem" }}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenRequestType(!openRequestType)}
              >
                {formData.requestType || "Select Request Type"}
                <span className={style.selectArrow}>▾</span>
              </div>

              {openRequestType && (
                <div className={style.customSelectDropdown}>
                  {requestTypes.map((type) => (
                    <div
                      key={type}
                      className={style.customSelectOption}
                      onClick={() => {
                        let prefix = "";
                        if (type === "Check") prefix = "CR";
                        else if (type === "Manager's Check") prefix = "MCR";
                        else if (type === "Petty Cash") prefix = "PCR";

                        const year = new Date().getFullYear();
                        setFormData({
                          ...formData,
                          requestType: type,
                          requestNumber: `${prefix}${year}`,
                        });
                        setOpenRequestType(false);
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
                {/* <input
                  type="text"
                  placeholder="Request Number"
                  value={formData.requestNumber}
                  readOnly 
                  style={{cursor:"not-alowed", outline:"none", color:"#000"}}
                /> */}

                  <div
                    className={style.customSelectWrapper}
                    ref={chargeToRef}
                    style={{ marginBottom: ".75rem" }}
                  >
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

                <textarea
                  type="text"
                  placeholder="Remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                >
                </textarea>                

                <div className={style.modalActions}>
                  <button type="button" className={style.cancelButton} onClick={() => setShowModal(false)}>
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
            <tr className={style.headTablePayment}>
              <th>Request Number</th>
              <th>Vendor</th>
              <th>Department</th>
              <th>Charge To</th>
              <th>Request Type</th>
              <th>Remarks</th>
              <th>Date Needed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No payment requests found
                </td>
              </tr>
            ) : (
              currentRequests.map((pr) => (
                <tr key={pr.id} className={style.bodyTablePayment}>
                  <td>{pr.requestNumber}</td>
                  <td>{activeVendors.find((v) => v.id === pr.vendorId)?.name || "--"}</td>
                  <td>{activeDepartments.find((d) => d.id === pr.costCenterId)?.name || "--"}</td>
                  <td>{pr.chargeTo}</td>
                  <td>{pr.requestType}</td>
                  <td>{pr.remarks}</td>
                  <td>
                    {pr.dateNeeded
                      ? new Date(pr.dateNeeded).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",  
                        })
                      : "--"}
                  </td>
                  <td>
                    <button className={style.editBtn} onClick={() => navigate(`/editPaymentRequest/${pr.id}`)}>
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
                  className={`${style.pageButton} ${currentPage === i + 1 ? style.activePage : ""}`}
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

export default PaymentRequestPage;
