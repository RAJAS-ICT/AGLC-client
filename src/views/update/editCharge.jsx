import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useParams, Link } from "react-router-dom";
import { Mosaic } from "react-loading-indicators";

import {
  useGetChargeByIdQuery,
  useUpdateChargeMutation,
} from "../../features/chargeSlice";

import style from "../css/page.module.css";

function EditCharge() {
  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: charge, isLoading, isError, error } = useGetChargeByIdQuery(id);
  const [updateCharge] = useUpdateChargeMutation();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    isActive: true,
  });

  useEffect(() => {
    if (charge) {
      setFormData({
        code: charge.code,
        name: charge.name,
        isActive: charge.isActive,
      });
    }
  }, [charge]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCharge({ id, ...formData }).unwrap();
      toast.success(response.message || "Updated successfully!");
      // navigate("/charge");
    } catch (error) {
      console.error(error);
      const message = error?.data?.message || error?.error || "Update failed!";
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
    <main className="main-container">
      <div className={style.editCharge}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
              <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
              </svg>
              <h3 className={style.headerLaber}>Update Charge</h3>
            </div>
              <p className={style.headerSubtitle}>View and manage charge.</p>
            </div>

        <form onSubmit={handleSubmit} className={style.editFormCustomer}>
          <label className={style.editLabel}>Code: </label>
          <input
            className={style.editInput}
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            placeholder="Code"
            required
          />

          <label className={style.editLabel}>Name: </label>
          <input
            className={style.editInput}
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Name"
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
            <button className={style.editButton} type="submit">
              Update
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditCharge;
