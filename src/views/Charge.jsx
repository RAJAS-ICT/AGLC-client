import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useFetchChargeQuery, usePostChargeMutation } from "../features/chargeSlice"; 
import { useNavigate, Link } from "react-router-dom";
import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function Charge() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useFetchChargeQuery();
  const charges = data ?? [];

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    isActive: true,
  });

  const [addCharge] = usePostChargeMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [showModal, setShowModal] = useState(false);

  const filteredCharges = charges.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCharges.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCharges = filteredCharges.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await addCharge(formData).unwrap();
      toast.success(res.message || "Charge Added!");

      setFormData({ code: "", name: "", isActive: true });
      setShowModal(false);

      if (res.data?.id) {
        navigate(`/editCharge/${res.data.id}`);
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || "Error adding charge");
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
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.ListContainer}>
        <div className={style.pageHeaderContainer}>
            <div className={style.flexTitleHeader}>
             <div className={style.flexheaderTitle}>
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path fill="currentColor" d="M0 12V0h12v2.5H2.5V12z" />
                  <path fill="currentColor" d="M16 4H4v12h12z" />
                </svg>
              <h3 className={style.headerLaber}>Manage Charges</h3>
              </div>
              <p className={style.headerSubtitle}>Transactions / Charge</p>
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
            <button className={style.addBtn} onClick={() => setShowModal(true)} title="Add Charge">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/>
              </svg>
            </button>
          </div>
        </div>

        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Charge</h3>
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
                <label className={style.modalLabel}>Code: </label>
                <input
                  type="text"
                  placeholder="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />

                <label className={style.modalLabel}>Name: </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className={style.activeWrap}>
                  <label> Active: </label>
                  <input
                    className={style.activeHolder}
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </div>

                <div className={style.modalActions}>
                  <button type="button" className={style.cancelButton} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={style.submitButton}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table>
          <thead>
            <tr className={style.headChargeTable}>
              <th>Code</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentCharges.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No charges found</td>
              </tr>
            ) : (
              currentCharges.map((c) => (
                <tr className={style.bodyChargeTable} key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>

                  <td>
                    <button className={style.editBtn} onClick={() => navigate(`/editCharge/${c.id}`)}>
                       <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

export default Charge;
