import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Mosaic } from "react-loading-indicators";

import {
  useGetPettyCashQuery,
  useUpdatePettyCashMutation,
} from "../../features/pettyCashReleaseSlice";
import { useFetchPaymentRequestQuery } from "../../features/paymentRequest";
import { useFetchEmployeeQuery } from "../../features/employeeSlice";
import { useGetPaymentRequestDetailsByRequestIdQuery } from "../../features/paymentRequestDetailSlice";


import style from "../../views/css/page.module.css";

function EditPettyCashRelease() {
  const { id } = useParams();

  const { data: pettyCashData = [], isLoading: isLoadingPettyCash, isError, error } =
    useGetPettyCashQuery();
  const [updatePettyCash, { isLoading: isUpdating }] = useUpdatePettyCashMutation();

  const { data: paymentRequests = [], isLoading: isLoadingPayReq } =
    useFetchPaymentRequestQuery();
  const { data: employees = [], isLoading: isLoadingEmp } =
    useFetchEmployeeQuery();

  const [formData, setFormData] = useState({
    paymentRequestId: "",
    receivedById: "",
    vendor: "",
    remarks: "",
  });

  useEffect(() => {
    if (pettyCashData.length > 0) {
      const current = pettyCashData.find((pc) => pc.id === parseInt(id));
      if (current) {
        setFormData({
          paymentRequestId: current.paymentRequestId,
          receivedById: current.receivedById,
        });
      }
    }
  }, [pettyCashData, id]);

  const payReqRef = useRef(null);
  const empRef = useRef(null);
  const [openPayReq, setOpenPayReq] = useState(false);
  const [openEmp, setOpenEmp] = useState(false);

  useEffect(() => {
    if (pettyCashData.length > 0) {
      const current = pettyCashData.find((pc) => pc.id === parseInt(id));
      if (current) {
        setFormData({
          paymentRequestId: current.paymentRequestId,
          receivedById: current.receivedById,
        });
      }
    }
  }, [pettyCashData, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (payReqRef.current && !payReqRef.current.contains(event.target))
        setOpenPayReq(false);
      if (empRef.current && !empRef.current.contains(event.target))
        setOpenEmp(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paymentRequestId || !formData.receivedById) {
      toast.error("Please select Payment Request and Employee");
      return;
    }
    try {
      await updatePettyCash({ id, ...formData }).unwrap();
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update petty cash.");
    }
  };

  const { data: paymentRequestDetails = [] } = useGetPaymentRequestDetailsByRequestIdQuery(
    formData.paymentRequestId,
    { skip: !formData.paymentRequestId } 
  );

  const amountText = paymentRequestDetails.length > 0
    ? paymentRequestDetails
        .reduce((sum, d) => sum + (d.amount * d.quantity), 0)
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : (0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (isLoadingPettyCash || showLoader) {
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

  const selectedPaymentRequest = paymentRequests.find(
    (pr) => pr.id === formData.paymentRequestId
  );

  const vendorName = selectedPaymentRequest?.vendor?.name || "";
  const remarksText = selectedPaymentRequest?.remarks || "";

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
      <Toaster position="top-right" reverseOrder={false} />

      <div className={style.editContainer}>
        <div className={style.EditflexTitleHeader}>
          <div className={style.flexheaderTitle}>
            <svg
              className={style.svgExclamation}
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248m-248 50c-25.405 0-46 20.595-46 46s20.595 46 46 46s46-20.595 46-46s-20.595-46-46-46m-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654"
              />
            </svg>
            <h3 className={style.headerLaber}>Edit Petty Cash Release</h3>
          </div>
          <p className={style.headerSubtitle}>
            Transactions / Manage Petty Cash
          </p>
        </div>

        <form onSubmit={handleSubmit} className={style.editForm}>
          <label className={style.editLabel}>Payment Request:</label>
            <div className={style.customSelectWrapper} ref={payReqRef}>
            <div
            className={style.customSelectInput}
            onClick={() => setOpenPayReq(!openPayReq)}
            >
            {formData.paymentRequestId
                ? (() => {
                    const pr = paymentRequests.find(
                    (p) =>
                        p.id === formData.paymentRequestId &&
                        p.requestType === "Petty Cash"
                    );

                    return pr
                    ? pr.requestNumber || pr.code || pr.id
                    : formData.paymentRequestId;
                })()
                : "Select Payment Request"}
                <span className={style.selectArrow}>▾</span>
            </div>

            {openPayReq && (
                <div className={style.customSelectDropdown}>
                {isLoadingPayReq ? (
                    <div className={style.customSelectOption}>Loading...</div>
                ) : paymentRequests.filter(pr => pr.status === 'Open' && pr.requestType === 'Petty Cash').length === 0 ? (
                    <div className={style.customSelectOption}>No Payment Requests</div>
                ) : (
                    paymentRequests
                    .filter(pr => pr.status === 'Open' && pr.requestType === 'Petty Cash')
                    .map(pr => (
                        <div
                        key={pr.id}
                        className={style.customSelectOption}
                        onClick={() => {
                            setFormData({ ...formData, paymentRequestId: pr.id });
                            setOpenPayReq(false);
                        }}
                        >
                         {pr.requestNumber || pr.code || pr.id}
                        </div>
                    ))
                )}
                </div>
            )}
            </div>
            
        <label className={style.editLabel}>Vendor:</label>
          <input
            style={{outline:"none", cursor:'not-allowed'}}
            type="text"
            className={style.editInput}
            value={vendorName}
            readOnly
          />
        <label className={style.editLabel}>Remarks:</label>
          <textarea
            style={{outline:"none", cursor:'not-allowed'}}
            className={style.modalTextarea}
            value={remarksText}
            readOnly
          />
          <label className={style.editLabel}>Amount:</label>
          <input
            style={{outline:"none", cursor:'not-allowed'}}
            type="text"
            className={style.editInput}
            value={amountText}
            readOnly
        />

        <label className={style.editLabel}>Received By:</label>
          <div className={style.customSelectWrapper} ref={empRef}>
            <div
              className={style.customSelectInput}
              onClick={() => setOpenEmp(!openEmp)}
            >
              {formData.receivedById
                ? (() => {
                    const emp = employees.find((e) => e.id === formData.receivedById);
                    return emp
                      ? `${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`.trim()
                      : formData.receivedById;
                  })()
                : "Select Employee"}
              <span className={style.selectArrow}>▾</span>
            </div>
            {openEmp && (
              <div className={style.customSelectDropdown}>
                {isLoadingEmp ? (
                  <div className={style.customSelectOption}>Loading...</div>
                ) : employees.length === 0 ? (
                  <div className={style.customSelectOption}>No Employees</div>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, receivedById: emp.id });
                        setOpenEmp(false);
                      }}
                    >
                      {`${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`.trim()}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button className={style.editButton} type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditPettyCashRelease;
