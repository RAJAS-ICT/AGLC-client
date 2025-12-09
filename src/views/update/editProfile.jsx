import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUpdateUserProfileMutation } from "../../features/userSlice";
import toast, { Toaster } from 'react-hot-toast';
import style from '../css/page.module.css';
import { Mosaic } from "react-loading-indicators";

function EditUser() {
  const { id } = useParams();
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

  if (showLoader) {
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

  return (
    <main className='main-container'>
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editContainer}>
        <h3 className={style.headerLaber}>Edit User Password</h3>
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
