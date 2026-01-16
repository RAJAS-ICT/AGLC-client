import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetCustomerByIdQuery, useUpdateCustomerMutation } from '../../features/customerSlice';
import toast, { Toaster } from 'react-hot-toast';
import style from '../css/page.module.css'
import { Mosaic } from "react-loading-indicators";

function EditCustomer() {
  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: customer, isLoading, isError, error } = useGetCustomerByIdQuery(id);
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    tin: '',
    isActive: false,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        address: customer.address || '',
        tin: customer.tin || '',
        isActive: customer.isActive ?? false,
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCustomer({ id, ...formData }).unwrap();
      toast.success('Updated successfully!');
      // navigate('/customer');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update customer.');
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
      <Toaster position="top-right" reverseOrder={false} />
      <div className={style.editCustomer}>
        <div className={style.EditflexTitleHeader}>
          <div className={style.flexheaderTitle}>
            <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
            </svg>
            <h3 className={style.headerLaber}>Update Customer</h3>
            </div>
            <p className={style.headerSubtitle}>User Directory / Customer</p>
          </div>
        <form onSubmit={handleSubmit} className={style.editFormCustomer}>
          <label className={style.editLabel}>Name: </label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <label className={style.editLabel}>Address: </label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <label className={style.editLabel}>TIN: </label>
          <input
            className={style.editInput}
            type="text"
            placeholder="TIN"
            value={formData.tin}
            onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
          />
         <div className={style.editActiveHolder}>
            <label>Active: </label>
            <input
              className={style.editActive}
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
          </div>
          <button className={style.editButton} type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditCustomer;
