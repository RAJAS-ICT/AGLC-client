import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useCreateEmployeeMutation, useFetchEmployeeQuery } from '../features/employeeSlice';
import { useNavigate } from 'react-router-dom';
import style from '../views/css/page.module.css';
import { Mosaic } from "react-loading-indicators";


function Employee() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFetchEmployeeQuery();
  const employees = data ?? [];

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    contactNumber: '',
    userId: '',
    isActive: true,
  });

  const [addEmployee] = useCreateEmployeeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addEmployee(formData).unwrap();
      toast.success(response.message || 'Employee Added!');
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        contactNumber: '',
        userId: '',
        isActive: false,
      });
      navigate(`/editEmployee/${response.data.id}`);
    } catch (error) {
      console.log(error);
      const message = error?.data?.message || error?.error || 'Action failed!';
      toast.error(message);
    }
  };

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredEmployees = employees.filter((emp) =>
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    emp.middleName.toLowerCase().includes(search.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
    emp.contactNumber.toLowerCase().includes(search.toLowerCase()) ||
    emp.userId?.toString().includes(search)
  );
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const handlePrevious = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

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
        
        {/* Header  */}
        <div className={style.pageHeaderContainer}>
          <div className={style.flexTitleHeader}>
              <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
              <h3 className={style.headerLaber}>Employee</h3>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"/></svg>
                </button>
          </div>
        </div>

      {/* Modal */}
      {showModal && ( <div className={style.modalOverlay}> 
        <div className={style.modal}> 
          <div className={style.modalHeader}> 
            <h3>Add Employee</h3>
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
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Firstname"
              required
            />
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              placeholder="Middlename"
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Lastname"
            />
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="Contact Number"
            />
            <input
              type="number"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="User ID"
            />
            <div className={style.activeWrap}>
              <label> Active:</label>
              <input
                className={style.activeHolder}
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
              <button type="submit" className={style.submitButton}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    )}
      {/* Employee Table */}
        <table>
          <thead>
            <tr className={style.headTable}>
              <th>Firstname</th>
              <th>Middlename</th>
              <th>Lastname</th>
              <th>Contact #</th>
              <th>User ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No employees found
                </td>
              </tr>
            ) : (
              currentEmployees.map((emp) => (
                <tr className={style.bodyTable} key={emp.id}>
                  <td>{emp.firstName}</td>
                  <td>{emp.middleName}</td>
                  <td>{emp.lastName}</td>
                  <td>{emp.contactNumber}</td>
                  <td>{emp.userId}</td>
                  <td>
                    <button
                      className={style.editBtn}
                      onClick={() => navigate(`/editEmployee/${emp.id}`)}
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
    </main>
  );
}

export default Employee;
