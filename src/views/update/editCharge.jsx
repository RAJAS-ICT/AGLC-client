import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
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
            <Mosaic color="#007bff" size="small" />
        </div>
      );
    }

  if (isError) return <p>Error: {error?.message || "Something went wrong"}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="edit-container">
        <div className={style.flexTitleHeader} style={{marginBottom:"1.25rem"}}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
            <h3 className={style.headerLaber}>Edit Charge</h3>
        </div>

        <form onSubmit={handleSubmit} className={style.editForm}>
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
            <label>Active: </label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
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
