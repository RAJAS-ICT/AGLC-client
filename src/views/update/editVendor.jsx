import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
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
      <div className={style.editVendor}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654" />
              </svg>
              <h3 className={style.headerLaber}>Edit Vendor</h3>
              </div>
              <p className={style.headerSubtitle}>Business / Manage Vendor</p>
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
          <label>Active: </label>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </div>
        <button className={style.editButton} type="submit">Update</button>
      </form>
      </div>
    </main>
  );
}

export default VendorEdit;
