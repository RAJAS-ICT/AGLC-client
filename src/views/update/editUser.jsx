import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../features/userSlice";
import toast, { Toaster } from 'react-hot-toast';
import style from '../css/page.module.css'
import { Mosaic } from "react-loading-indicators";

function EditUser() {
  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    password: '',
    role: '',
    isActive: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        // password: user.password || '',
        role: user.role || '',
        isActive: user.isActive ?? false,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = { ...formData };

    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      await updateUser({ id, ...dataToSend }).unwrap();
      toast.success('Updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user.');
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
    <main className='main-container'>
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editContainer}>
         <div className={style.EditflexTitleHeader}>
          <div className={style.flexheaderTitle}>
             <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
             <path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654" />
           </svg>
           <h3 className={style.headerLaber}>Edit User</h3>
           </div>
           <p className={style.headerSubtitle}>User Management / Manage Users</p>
        </div>
       <form onSubmit={handleSubmit} className={style.editForm}>
          <div className={style.flexInput}>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Username: </label>
              <input
                className={style.editInput}
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Email: </label>
              <input
                className={style.editInput}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className={style.flexInput}>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>First Name: </label>
              <input
                className={style.editInput}
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Middle Name: </label>
              <input
                className={style.editInput}
                type="text"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>
        </div>
        <label className={style.editLabel}>Last Name: </label>
        <input
          className={style.editInput}
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
        <label className={style.editLabel}>Password: </label>
        <input
          className={style.editInput}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <label className={style.editLabel}>Role: </label>
        <select
            className={style.selectRole}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            <option value="" disabled>Select Role</option>
            <option value="Power User">Power User</option>
            <option value="System Support">System Support</option>
            <option value="Operations">Operations</option>
            <option value="Accounting Manager">Accounting Manager</option>
            <option value="Accounting Staff">Accounting Staff</option>
        </select>  
        <div className={style.editUserActiveHolder}>
            <label>Active: </label>
            <input
              className={style.editActive}
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </div>    
        <button
          className={style.editButton}
          type="submit"
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </form>
      </div>
    </main>
  );
}

export default EditUser;
