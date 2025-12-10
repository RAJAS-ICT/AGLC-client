import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useGetPettyCashQuery, useCreatePettyCashMutation } from "../features/pettyCashReleaseSlice";
import { useFetchPaymentRequestQuery } from "../features/paymentRequest";
import { useFetchEmployeeQuery } from "../features/employeeSlice";
import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function PettyCashRelease() {
  const { data, isLoading, isError, error } = useGetPettyCashQuery();
  const pettyCashes = data ?? [];

  const [formData, setFormData] = useState({
    paymentRequestId: null,
    receivedById: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const [createPettyCash] = useCreatePettyCashMutation();

  const { data: paymentRequests = [], isLoading: isLoadingPayReq } = useFetchPaymentRequestQuery();
  const { data: employees = [], isLoading: isLoadingEmp } = useFetchEmployeeQuery();

  const [openPayReq, setOpenPayReq] = useState(false);
  const [openEmp, setOpenEmp] = useState(false);
  const payReqRef = useRef(null);
  const empRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (payReqRef.current && !payReqRef.current.contains(event.target)) setOpenPayReq(false);
      if (empRef.current && !empRef.current.contains(event.target)) setOpenEmp(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPettyCash = pettyCashes.filter(
    (pc) =>
      pc.paymentRequestId?.toString().includes(search) ||
      pc.receivedById?.toString().includes(search)
  );
  const totalPages = Math.ceil(filteredPettyCash.length / itemsPerPage);
  const currentPettyCash = filteredPettyCash.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paymentRequestId || !formData.receivedById) {
      toast.error("Invalid Action");
      return;
    }
    try {
      const res = await createPettyCash(formData).unwrap();
      toast.success(res.message || "Petty Cash Released!");
      setFormData({ paymentRequestId: null, receivedById: null });
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to release petty cash");
    }
  };

  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader || isLoading) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        display: "flex", justifyContent: "center", alignItems: "center",
        backgroundColor: "#fff", zIndex: 9999
      }}>
        <Mosaic color="#007bff" size="small" />
      </div>
    );
  }

  if (isError) return <p>Error: {error?.message || "Something went wrong"}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" />

      <div className={style.ListContainer}>
        <div className={style.pageHeaderContainerAccount}>
          <div className={style.flexTitleHeader}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/>
            </svg>
            <h3 className={style.headerLaber}>Petty Cash Release</h3>
          </div>
          <div className={style.flexHeader}>
            <input
              className={style.searchBox}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search..."
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

        {/* Modal */}
        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Account</h3>
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
               <div className={style.customSelectWrapper} ref={payReqRef}>
                <div
                    className={style.customSelectInput}
                    onClick={() => setOpenPayReq(!openPayReq)}
                >
                    {formData.paymentRequestId
                    ? (() => {
                        const pr = paymentRequests.find(p => p.id === formData.paymentRequestId);
                        return pr ? pr.requestType : formData.paymentRequestId;
                        })()
                    : "Select Payment Request"}
                    <span className={style.selectArrow}>▾</span>
                </div>

                {openPayReq && (
                    <div className={style.customSelectDropdown}>
                    {isLoadingPayReq ? (
                        <div className={style.customSelectOption}>Loading...</div>
                    ) : paymentRequests.length === 0 ? (
                        <div className={style.customSelectOption}>No Payment Requests</div>
                    ) : (
                        paymentRequests
                        .filter(pr => pr.status === 'Open' && pr.requestType === 'Petty Cash')
                        .map((pr) => (
                            <div
                            key={pr.id}
                            className={style.customSelectOption}
                            onClick={() => {
                                setFormData({ ...formData, paymentRequestId: pr.id }); 
                                setOpenPayReq(false);
                            }}
                            >
                            {pr.requestType}
                            </div>
                        ))
                    )}
                    </div>
                )}
                </div>

                <div className={style.customSelectWrapper} ref={empRef}>
                <div
                    className={style.customSelectInput}
                    onClick={() => setOpenEmp(!openEmp)}
                >
                    {formData.receivedById
                    ? (() => {
                        const emp = employees.find(e => e.id === formData.receivedById);
                        return emp
                            ? `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim()
                            : formData.receivedById;
                        })()
                    : "Select Employee"}
                    <span className={style.selectArrow}>▾</span>
                </div>

                {openEmp && (
                    <div className={style.customSelectDropdown}>
                    {isLoadingEmp ? (
                        <div className={style.customSelectOption}>Loading...</div>
                    ) : employees.length === 0 ? (
                        <div className={style.customSelectOption}>No Employees</div>
                    ) : (
                        employees.map((emp) => (
                        <div
                            key={emp.id}
                            className={style.customSelectOption}
                            onClick={() => {
                            setFormData({ ...formData, receivedById: emp.id });
                            setOpenEmp(false);
                            }}
                        >
                            {`${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim()}
                        </div>
                        ))
                    )}
                    </div>
                )}
                </div>


                <div className={style.modalActions}>
                  <button type="button" className={style.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={style.submitButton}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table>
          <thead>
            <tr className={style.headPettyCashTable}>
              <th>Payment Request</th>
              <th>Received By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentPettyCash.length === 0 ? (
              <tr><td colSpan="2" style={{ textAlign: "center" }}>No records found</td></tr>
            ) : currentPettyCash.map((pc) => (
              <tr className={style.bodyPettyCashTable} key={pc.id}>
                <td>
                    {paymentRequests.find(
                        pr => pr.id === pc.paymentRequestId && pr.requestType === "Petty Cash"
                    )?.requestType || pc.paymentRequestId}
                </td>

                    <td>
                    {(() => {
                        const emp = employees.find(e => e.id === pc.receivedById);
                        return emp
                        ? `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim()
                        : pc.receivedById;
                    })()}
                    </td>
                    <td>
                        <button
                            className={style.editBtn}
                        >
                            <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                            Manage
                        </button>
                    </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={style.paginationContainer}>
            <button className={style.pageButton} onClick={handlePrevious} disabled={currentPage === 1}>Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} className={`${style.pageButton} ${currentPage === i + 1 ? style.activePage : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
            ))}
            <button className={style.pageButton} onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>
    </main>
  );
}

export default PettyCashRelease;
