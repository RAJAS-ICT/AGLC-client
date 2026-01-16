import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUpdateUserProfileMutation, useGetUserByIdQuery } from "../../features/userSlice";
import toast, { Toaster } from 'react-hot-toast';
import style from '../css/page.module.css';
import { Mosaic } from "react-loading-indicators";

function EditUser() {
  const { id } = useParams();

    // FETCH USER
  const { data: user, isLoading: isUserLoading , error} = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password cannot be empty.");
      return;
    }
    try {
      await updateUser({ id, password }).unwrap();
      toast.success('Updated successfully!');
      setPassword('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password.');
    }
  };

  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader || isUserLoading) {
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
   if (!user) {
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
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editContainer}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
              <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
              </svg>
              <h3 className={style.headerLaber}>Change Password</h3>
              </div>
              <p className={style.headerSubtitle}>User Management / Profile</p>
            </div>
        <form onSubmit={handleSubmit} className={style.editForm}>
          <label className={style.editLabelPassword}>New Password:</label>
          <input
            className={style.editInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <button
            className={style.editButton}
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditUser;
