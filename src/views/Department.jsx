import React, { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useFetchDepartmentQuery, usePostDepartmentMutation } from "../features/departmentSlice";
import { useNavigate } from "react-router-dom";
import style from "../views/css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function Department() {

  const [openType, setOpenType] = useState(false);
  const typeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setOpenType(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeOptions = ["Administrative", "Operation"];

  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFetchDepartmentQuery();

  const departments = data ?? [];

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "",
    isActive: true,
  });

  const [addDepartment] = usePostDepartmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addDepartment(formData).unwrap();

      toast.success(response?.message || "Department Added!");

      setFormData({
        code: "",
        name: "",
        type: "",
        isActive: true,
      });

      setShowModal(false);
      navigate(`/editDepartment/${response.data.id}`);
    } catch (error) {
      const message = error?.data?.message || "Action failed!";
      toast.error(message);
    }
  };

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDepartments = departments.filter((dep) =>
    dep.code.toLowerCase().includes(search.toLowerCase()) ||
    dep.name.toLowerCase().includes(search.toLowerCase()) ||
    dep.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentDepartments = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevious = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const [showModal, setShowModal] = useState(false);

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
             <Mosaic color="#374151" size="small" />
         </div>
       );
     }
 
    if (isError) {
      const status = error?.status;

      if (status === 401) {
        return (
          <div className={style.unauthorizedWrapper}>
            <p className={style.error1}>401</p>
            <p className={style.error2}>Unauthorized Error</p>
            <p className={style.error3}>
              The resource requested could not be found on this server.
            </p>
          </div>
        );
      }

      return <p>Error: {error?.data?.message || 'Something went wrong'}</p>;
    }

  return (
    <main className="main-container">
      <Toaster position="top-right" />
        <div className={style.ListContainer}>
        {/* Header */}
          <div className={style.pageHeaderContainer}>
            <div className={style.flexTitleHeader}>
             <div className={style.flexheaderTitle}>
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654" />
              </svg>
              <h3 className={style.headerLaber}>View Department</h3>
              </div>
              <p className={style.headerSubtitle}>Business / Manage Department</p>
            </div>
            <div className={style.flexHeader}>
              <input
                className={style.searchBox}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
              />

              <button
                className={style.addBtn}
                onClick={() => setShowModal(true)}
              >
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
                  <h3>Add Department</h3>

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
                  <input
                    type="text"
                    placeholder="Code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <div className={style.customSelectWrapper} ref={typeRef}>
                    <div
                      className={style.customSelectInput}
                      onClick={() => setOpenType(!openType)}
                    >
                      {formData.type || "Select Type"}
                      <span className={style.selectArrow}>▾</span>
                    </div>

                    {openType && (
                      <div className={style.customSelectDropdown}>
                        {typeOptions.map((t) => (
                          <div
                            key={t}
                            className={style.customSelectOption}
                            onClick={() => {
                              setFormData({ ...formData, type: t });
                              setOpenType(false);
                            }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={style.activeWrap}>
                    <label> Active:</label>
                    <input
                      className={style.activeHolder}
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked,
                        })
                      }
                    />
                  </div>
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

        {/* Table */}
        <table>
          <thead>
            <tr className={style.headTableDepartment}>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentDepartments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No departments found
                </td>
              </tr>
            ) : (
              currentDepartments.map((dep) => (
                <tr className={style.bodyTableDept} key={dep.id}>
                  <td>{dep.code}</td>
                  <td>{dep.name}</td>
                  <td>{dep.type}</td>
                  <td>
                    <button
                      className={style.editBtn}
                      onClick={() => navigate(`/editDepartment/${dep.id}`)}
                    >
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

export default Department;
