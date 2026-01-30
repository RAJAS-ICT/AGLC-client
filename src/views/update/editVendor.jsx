import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import {
  useGetVendorByIdQuery,
  useUpdateVendorMutation,
} from '../../features/vendorSlice';
import style from '../css/page.module.css'
import { Mosaic } from "react-loading-indicators";

function VendorEdit() {
  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: vendor, isLoading, isError, error } = useGetVendorByIdQuery(id);
  const [updateVendor] = useUpdateVendorMutation();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    tin: '',
    isActive: false,
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        address: vendor.address,
        tin: vendor.tin,
        isActive: vendor.isActive,
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateVendor({ id, ...formData }).unwrap();
      toast.success(response.message || 'Updated successfully!');
      // navigate('/vendor');
    } catch (err) {
      console.error(err);
      const message = err?.data?.message || err?.error || 'Update failed!';
      toast.error(message);
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
      <div className={style.editVendor}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
              <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
              </svg>
              <h3 className={style.headerLaber}>Update Vendor</h3>
              </div>
              <p className={style.headerSubtitle}>View and manage vendor.</p>
            </div>
        <form onSubmit={handleSubmit} className={style.editFormCustomer}>
        <label className={style.editLabel}>Name: </label>
        <input
          className={style.editInput}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          required
        />
        <label className={style.editLabel}>Adress: </label>
        <input
          className={style.editInput}
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Address"
        />
        <label className={style.editLabel}>Tin: </label>
        <input
          className={style.editInput}
          type="text"
          value={formData.tin}
          onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
          placeholder="TIN"
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
        <button className={style.editButton} type="submit">Update</button>
      </form>
      </div>
    </main>
  );
}

export default VendorEdit;
