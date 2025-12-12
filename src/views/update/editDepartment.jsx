import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useFetchDepartmentByIdQuery,
  useUpdateDepartmentMutation,
} from "../../features/departmentSlice";
import toast, { Toaster } from "react-hot-toast";
import style from "../css/page.module.css";
import { Mosaic } from "react-loading-indicators";

function EditDepartment() {

  const [openEditType, setOpenEditType] = useState(false);
  const editTypeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editTypeRef.current && !editTypeRef.current.contains(event.target)) {
        setOpenEditType(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeOptions = ["Administrative", "Operation"];

  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: department, isLoading, isError, error } =
    useFetchDepartmentByIdQuery(id);

  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "",
    isActive: false,
  });

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code || "",
        name: department.name || "",
        type: department.type || "",
        isActive: department.isActive ?? false,
      });
    }
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDepartment({ id, ...formData }).unwrap();
      toast.success("Updated successfully!");
      // navigate("/department");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update department.");
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
            <Mosaic color="#ca8a04" size="small" />
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
    <main className="main-container">
      <Toaster position="top-right" />

      <div className={style.editContainer}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path fill="currentColor" d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654" />
              </svg>
              <h3 className={style.headerLaber}>Edit Department</h3>
              </div>
              <p className={style.headerSubtitle}>Business / Manage Departments</p>
            </div>

        <form onSubmit={handleSubmit} className={style.editForm}>
          <label className={style.editLabel}>Code:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            required
          />
          <label className={style.editLabel}>Name:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Department Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
          <label className={style.editLabel}>Type:</label>
          <div className={style.customSelectWrapper} ref={editTypeRef}>
            <div
              className={style.customSelectInput}
              onClick={() => setOpenEditType(!openEditType)}
            >
              {formData.type || "Select Type"}
              <span className={style.selectArrow}>▾</span>
            </div>
            {openEditType && (
              <div className={style.customSelectDropdown}>
                {typeOptions
                  .filter((t) => t !== formData.type)
                  .map((t) => (
                  <div
                    key={t}
                    className={style.customSelectOption}
                    onClick={() => {
                      setFormData({ ...formData, type: t });
                      setOpenEditType(false);
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={style.editActiveHolder}>
            <label>Active:</label>
            <input
              className={style.editActive}
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.checked,
                })
              }
            />
          </div>
          <button
            className={style.editButton}
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditDepartment;
