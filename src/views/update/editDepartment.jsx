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
            <Mosaic color="#007bff" size="small" />
        </div>
      );
    }

  if (isError) return <p>Error: {error?.message || "Something went wrong"}</p>;

  return (
    <main className="main-container">
      <Toaster position="top-right" />

      <div className={style.editContainer}>
        <div className={style.flexTitleHeader}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
            <h3 className={style.headerLaber}>Edit Department</h3>
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
                {typeOptions.map((t) => (
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
