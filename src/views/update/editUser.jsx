import React, { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../features/userSlice";
import { ToastContainer, toast } from 'react-toastify';
import style from '../css/page.module.css'
import { Mosaic } from "react-loading-indicators";

function EditUser() {
  const { id } = useParams();

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
           <h3 className={style.headerLaber}>Update User</h3>
           </div>
           <p className={style.headerSubtitle}>User Directory / User</p>
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
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Last Name: </label>
              <input
                className={style.editInput}
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
        </div>
        <label className={style.editLabel}>Password: </label>
        <input
          className={style.editInput}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
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
