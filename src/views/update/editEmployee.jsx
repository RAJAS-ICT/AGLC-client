import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetEmployeeByIdQuery, useUpdateEmployeeMutation } from '../../features/employeeSlice'
import { ToastContainer, toast } from 'react-toastify';
import style from '../css/page.module.css'
import { Mosaic } from "react-loading-indicators";

function EditEmployee() {
  const { id } = useParams()
  const { data: employee, isLoading, isError, error } = useGetEmployeeByIdQuery(id)
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    contactNumber: '',
    userId: '',
    isActive: false
  })

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        middleName: employee.middleName || '',
        lastName: employee.lastName || '',
        contactNumber: employee.contactNumber || '',
        userId: employee.userId || '',
        isActive: employee.isActive ?? false
      })
    }
  }, [employee])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateEmployee({ id, ...formData }).unwrap()
      toast.success('Updated successfully!')
      // navigate('/employee')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update employee.')
    }
  }

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
    <main className='main-container'>
     <div className={style.editContainer}>
        <div className={style.EditflexTitleHeader}>
         <div className={style.flexheaderTitle}>
            <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
            </svg>
          <h3 className={style.headerLaber}>Update Employee</h3>
          </div>
          <p className={style.headerSubtitle}>User Directory / Employee</p>
        </div>
        <form onSubmit={handleSubmit} className={style.editForm}>
          <div className={style.flexInput}>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Firstname: </label>
              <input
                className={style.editInput}
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Middlename: </label>
              <input
                className={style.editInput}
                type="text"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
            <div className={style.gridUserEdit}>
            <label className={style.editLabel}>Lastname: </label>
              <input
                className={style.editInput}
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <label className={style.editLabel}>Contact #: </label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          />
          <label className={style.editLabel}>User ID: </label>
          <input
            className={style.editInput}
            type="number"
            placeholder="User ID"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            required
          />
           <div className={style.editActiveHolder}>
              <label className={style.activeLabel}>Active:</label>
              <label className={style.switch}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span className={style.slider}></span>
              </label>
            </div>
          <button className={style.editButton} type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default EditEmployee
