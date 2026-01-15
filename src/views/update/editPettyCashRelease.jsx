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

import { useFetchAccountQuery } from "../../features/accountTitleSlice";
import { useFetchSubAccountQuery } from "../../features/subAccountTitleSlice";
import { useFetchDepartmentQuery } from "../../features/departmentSlice";
import { useCreateJournalEntryMutation, useFetchJournalEntryQuery } from "../../features/journalEntrySlice";
import { useFetchAffiliateQuery } from "../../features/affiliateSlice";
import { useFetchAgentQuery } from "../../features/agentSlice";
import { useFetchBankQuery } from "../../features/bankSlice";
import { useFetchCustomerQuery } from "../../features/customerSlice";
import { useFetchLocalGovernmentAgencyQuery } from "../../features/localGovernmentAgencySlice";
import { useFetchVendorQuery } from "../../features/vendorSlice";

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

  const [openJournalModal, setOpenJournalModal] = useState(false);

  const [journalForm, setJournalForm] = useState({
    belongsToType: "Petty Cash Release",
    belongsToId: Number(id),
    accountTitleId: "",
    subAccountTitleId: "",
    departmentId: "",
    listItemType: "",
    listItemId: "",
  });

  const getListItemSource = () => {
  switch (journalForm.listItemType) {
    case "Affiliate":
      return affiliates;
    case "Agent":
      return agents;
    case "Bank":
      return banks;
    case "Customer":
      return customers;
    case "Employee":
      return employees;
    case "Local Government Agency":
      return lgas;
    case "Vendor":
      return vendors;
    default:
      return [];
  }
};

  const { data: accounts = [] } = useFetchAccountQuery();
  const { data: subAccounts = [] } = useFetchSubAccountQuery();
  const { data: departments = [] } = useFetchDepartmentQuery();

  const { data: journalEntries = [] } = useFetchJournalEntryQuery();
  const [createJournalEntry] = useCreateJournalEntryMutation();
  const { data: affiliates = [] } = useFetchAffiliateQuery();
  const { data: agents = [] } = useFetchAgentQuery();
  const { data: banks = [] } = useFetchBankQuery();
  const { data: customers = [] } = useFetchCustomerQuery();
  const { data: lgas = [] } = useFetchLocalGovernmentAgencyQuery();
  const { data: vendors = [] } = useFetchVendorQuery();

  const handleSaveJournalEntry = async () => {
  try {
    if (
      !journalForm.accountTitleId ||
      !journalForm.subAccountTitleId ||
      !journalForm.departmentId ||
      !journalForm.listItemType
    ) {
      toast.error("Please complete journal entry fields");
      return;
    }

    await createJournalEntry(journalForm).unwrap();
    setJournalForm({
      belongsToType: "Petty Cash Release",
      belongsToId: Number(id),
      accountTitleId: "",
      subAccountTitleId: "",
      departmentId: "",
      listItemType: "",
      listItemId: "",
    });

    toast.success("Journal Entry Created");
    setOpenJournalModal(false);
  } catch (err) {
    console.error(err);
    toast.error("Failed to create journal entry");
  }
};
  const accountRef = useRef(null);
  const subAccountRef = useRef(null);
  const departmentRef = useRef(null);
  const listTypeRef = useRef(null);
  const listItemRef = useRef(null);

  const [openAccount, setOpenAccount] = useState(false);
  const [openSubAccount, setOpenSubAccount] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openListType, setOpenListType] = useState(false);
  const [openListItem, setOpenListItem] = useState(false);



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

    const getListItemNameFromJournal = (j) => {
    const id = j.listItemId;

    switch (j.listItemType) {
      case "Affiliate":
        return affiliates.find(a => a.id === id)?.name || "-";

      case "Agent":
        return agents.find(a => a.id === id)?.name || "-";

      case "Bank":
        return banks.find(b => b.id === id)?.name || "-";

      case "Customer":
        return customers.find(c => c.id === id)?.name || "-";

      case "Employee": {
        const emp = employees.find(e => e.id === id);
        return emp
          ? `${emp.firstName} ${emp.middleName || ""} ${emp.lastName}`.trim()
          : "-";
      }

      case "Local Government Agency":
        return lgas.find(l => l.id === id)?.name || "-";

      case "Vendor":
        return vendors.find(v => v.id === id)?.name || "-";

      default:
        return "-";
    }
  };



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
          <div className={style.flexInput}>
            <div className={style.gridUserEdit}>
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
            </div>
          <div className={style.gridUserEdit}>
            <label className={style.editLabel} style={{marginBottom:'4px'}}>Vendor:</label>
              <input
                style={{outline:"none", cursor:'not-allowed', height:'41px'}}
                type="text"
                className={style.editInput}
                value={vendorName}
                readOnly
              />
          </div>
        </div>
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


      <div style={{padding:'0 1.25rem 5rem 1.25rem'}}>
         <div className={style.flexheaderTitleJournal}>
           <div className={style.bookingContainer}>
            <p className={style.bookingPaymentTitle}>Journal Entry</p>
            <p className={style.bookingPaymentSubtitle}>Create and review journal entry history.</p>
          </div>
          <button
            className={style.addBtnJournal}
            type="button"
            onClick={() => setOpenJournalModal(true)}
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"
                />
              </svg>
          </button>
        </div>

        <table className={style.tableJournal}>
          <thead>
            <tr className={style.journalHeaderTable}>
              <th>Account</th>
              <th>Sub Account</th>
              <th>Department</th>
              <th>List Item Type</th>
              <th>List Item</th>
            </tr>
          </thead>
          <tbody>
            {journalEntries.filter(
              j =>
                j.belongsToType === "Petty Cash Release" &&
                j.belongsToId === Number(id)
            ).length === 0 ? (
              <tr className={style.journalBodyTable}>
                <td
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  No journal entries found.
                </td>
              </tr>
            ) : (
              journalEntries
                .filter(
                  j =>
                    j.belongsToType === "Petty Cash Release" &&
                    j.belongsToId === Number(id)
                )
                .map(j => (
                  <tr key={j.id} className={style.journalBodyTable}>
                    <td>{j.account?.name}</td>
                    <td>{j.subAccount?.name}</td>
                    <td>{j.department?.name}</td>
                    <td>{j.listItemType}</td>
                    <td>{getListItemNameFromJournal(j)}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

{/* modal */}
      {openJournalModal && (
        <div className={style.modalOverlay}>
          <div className={style.modal}>
            {/* Header */}
            <div className={style.modalHeader}>
              <h3>Add Journal Entry</h3>
              <button
                className={style.closeButton}
                onClick={() => setOpenJournalModal(false)}
              >
                <svg
                  className={style.closeBtn}
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m11.25 4.75-6.5 6.5m0-6.5 6.5 6.5"
                  />
                </svg>
              </button>
            </div>

            <form
              className={style.formContainer}
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveJournalEntry();
              }}
            >
              {/* Account Title */}
              <label className={style.modalLabel}>Account Title:</label>
              <div className={style.customSelectWrapper} ref={accountRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenAccount(!openAccount)}
                >
                  {journalForm.accountTitleId
                    ? accounts.find(a => a.id === journalForm.accountTitleId)?.name
                    : "Select Account"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openAccount && (
                  <div className={style.customSelectDropdown}>
                    {accounts.map(a => (
                      <div
                        key={a.id}
                        className={style.customSelectOption}
                        onClick={() => {
                          setJournalForm(prev => ({
                            ...prev,
                            accountTitleId: a.id,
                          }));
                          setOpenAccount(false);
                        }}
                      >
                        {a.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub Account */}
              <label className={style.modalLabel}>Sub Account:</label>
              <div className={style.customSelectWrapper} ref={subAccountRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenSubAccount(!openSubAccount)}
                >
                  {journalForm.subAccountTitleId
                    ? subAccounts.find(s => s.id === journalForm.subAccountTitleId)?.name
                    : "Select Sub Account"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openSubAccount && (
                  <div className={style.customSelectDropdown}>
                    {subAccounts.map(s => (
                      <div
                        key={s.id}
                        className={style.customSelectOption}
                        onClick={() => {
                          setJournalForm(prev => ({
                            ...prev,
                            subAccountTitleId: s.id,
                          }));
                          setOpenSubAccount(false);
                        }}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Department */}
              <label className={style.modalLabel}>Department:</label>
              <div className={style.customSelectWrapper} ref={departmentRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenDepartment(!openDepartment)}
                >
                  {journalForm.departmentId
                    ? departments.find(d => d.id === journalForm.departmentId)?.name
                    : "Select Department"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openDepartment && (
                  <div className={style.customSelectDropdown}>
                    {departments.map(d => (
                      <div
                        key={d.id}
                        className={style.customSelectOption}
                        onClick={() => {
                          setJournalForm(prev => ({
                            ...prev,
                            departmentId: d.id,
                          }));
                          setOpenDepartment(false);
                        }}
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* List Item Type */}
              <label className={style.modalLabel}>List Item Type:</label>
              <div className={style.customSelectWrapper} ref={listTypeRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() => setOpenListType(!openListType)}
                >
                  {journalForm.listItemType || "Select Type"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openListType && (
                  <div className={style.customSelectDropdown}>
                    {[
                      "Affiliate",
                      "Agent",
                      "Bank",
                      "Customer",
                      "Employee",
                      "Local Government Agency",
                      "Vendor",
                    ].map(type => (
                      <div
                        key={type}
                        className={style.customSelectOption}
                        onClick={() => {
                          setJournalForm(prev => ({
                            ...prev,
                            listItemType: type,
                            listItemId: "",
                          }));
                          setOpenListType(false);
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* List Item */}
              <label className={style.modalLabel}>List Item:</label>
              <div className={style.customSelectWrapper} ref={listItemRef}>
                <div
                  className={style.customSelectInput}
                  onClick={() =>
                    journalForm.listItemType && setOpenListItem(!openListItem)
                  }
                >
                  {journalForm.listItemId
                    ? getListItemSource().find(i => i.id === journalForm.listItemId)?.name
                    : "Select Item"}
                  <span className={style.selectArrow}>▾</span>
                </div>

                {openListItem && (
                  <div className={style.customSelectDropdown}>
                    {getListItemSource().map(item => (
                      <div
                        key={item.id}
                        className={style.customSelectOption}
                        onClick={() => {
                          setJournalForm(prev => ({
                            ...prev,
                            listItemId: item.id,
                          }));
                          setOpenListItem(false);
                        }}
                      >
                        {item.name ||
                          `${item.firstName || ""} ${item.lastName || ""}`.trim()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* buttons */}
              <div className={style.modalActions}>
                <button
                  type="button"
                  className={style.cancelButton}
                  onClick={() => setOpenJournalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={style.submitButton}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </main>
  );
}

export default EditPettyCashRelease;
