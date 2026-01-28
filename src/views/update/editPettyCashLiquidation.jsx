import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Mosaic } from 'react-loading-indicators';
import { ToastContainer, toast } from 'react-toastify';

import { 
  useFetchPettyCashLiquidationByIdQuery, 
  useUpdatePettyCashLiquidationMutation,
  useCreatePettyCashLiquidationDetailMutation, 
  useFetchPettyCashLiquidationDetailQuery} from '../../features/pettyCashLiquidationSlice';

import { useFetchPaymentRequestQuery } from '../../features/paymentRequest';
import { useGetPaymentRequestDetailsByRequestIdQuery } from '../../features/paymentRequestDetailSlice';

import style from '../css/page.module.css';

function EditPettyCashLiquidation() {
  const { id } = useParams();

  const { data: liquidation, isLoading: loadingLiquidation } = useFetchPettyCashLiquidationByIdQuery(id);
  const { data: paymentRequests = [], isLoading: loadingRequests } = useFetchPaymentRequestQuery();
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const { data: details = [], isLoading: loadingDetails } = useGetPaymentRequestDetailsByRequestIdQuery(selectedRequestId, { skip: !selectedRequestId });
  const [updateLiquidation, { isLoading: isUpdating }] = useUpdatePettyCashLiquidationMutation();

  const payReqRef = useRef(null);
  const [openPayReq, setOpenPayReq] = useState(false);

  const [formData, setFormData] = useState({
    requestNumber: '',
    vendorName: '',
    departmentName: '',
    chargeTo: '',
    requestType: '',
    remarks: '',
    dateNeeded: '',
    status: '',
    amount: 0
  });

  useEffect(() => {
    if (liquidation?.paymentRequestId) {
      setSelectedRequestId(liquidation.paymentRequestId);
    }
  }, [liquidation]);

  useEffect(() => {
    if (!selectedRequestId) return;

    const selected = paymentRequests.find(pr => pr.id === selectedRequestId);
    if (!selected) return;

    const amount = details.reduce(
      (sum, d) => sum + (Number(d.amount || 0) * Number(d.quantity || 0)),
      0
    );

    setFormData({
      requestNumber: selected.requestNumber || '',
      vendorName: selected.vendor?.name || '',
      departmentName: selected.department?.name || '',
      chargeTo: selected.chargeTo || '',
      requestType: selected.requestType || '',
      remarks: selected.remarks || '',
      dateNeeded: selected.dateNeeded ? selected.dateNeeded.split('T')[0] : '',
      status: selected.status || '',
      amount
    });
  }, [selectedRequestId, paymentRequests, details]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (payReqRef.current && !payReqRef.current.contains(e.target)) {
        setOpenPayReq(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequestId) {
      toast.error("Please select a Payment Request");
      return;
    }
    try {
      await updateLiquidation({ id, paymentRequestId: selectedRequestId, amount: formData.amount }).unwrap();
      toast.success("Updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update liquidation.");
    }
  };

  const [showLoader, setShowLoader] = useState(true);

  const { data: liquidationDetails = [] } = useFetchPettyCashLiquidationDetailQuery(id);

  const mappedDetails = (details ?? []).map(d => {
    const liquidation = (liquidationDetails ?? []).find(
      ld => Number(ld.paymentRequestDetailId) === Number(d.id)
    );

    return {
      ...d,
      bookingNumber: d.booking?.bookingNumber || "--",
      amount: Number(d.amount || 0),
      quantity: Number(d.quantity || 0),
      liquidatedAmount: liquidation ? Number(liquidation.liquidatedAmount) : 0,
      returnRefundAmount: liquidation ? Number(liquidation.returnRefundAmount) : 0
    };
  });



  
  const [createLiquidationDetail] = useCreatePettyCashLiquidationDetailMutation();

    const [showLiquidationModal, setShowLiquidationModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [liquidatedAmount, setLiquidatedAmount] = useState("");
  
  const releasedTotal = selectedDetail
    ? (Number(selectedDetail.amount) || 0) * (Number(selectedDetail.quantity) || 0)
    : 0;

  const returnRefundAmount =
    liquidatedAmount !== ""
      ? releasedTotal - (Number(liquidatedAmount) || 0)
      : 0;


    useEffect(() => {
      const timer = setTimeout(() => setShowLoader(false), 1000);
      return () => clearTimeout(timer);
    }, []);
  
  if (loadingLiquidation || loadingRequests || loadingDetails || showLoader) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#fff', zIndex: 9999
      }}>
        <Mosaic color="#0D254C" size="small" />
      </div>
    );
  }

  return (
    <main className="main-container">
      <div className={style.editCustomer}>
        <div className={style.EditflexTitleHeader}>
          <div className={style.flexheaderTitle}>
            <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
            </svg>
            <h3 className={style.headerLaber}>Update Petty Cash Liquidation</h3>
          </div>
          <p className={style.headerSubtitle}>Transactions / Petty Cash Liquidation</p>
        </div>
 
        <form className={style.editFormCustomer} onSubmit={handleSubmit}>
          <div className={style.editPaymentReqSelect}>

          <div className={style.flexSelectPaymentReadLiquidation}>
            <label className={style.editLabel}>Request Number:</label>
            <div className={style.customSelectWrapper} ref={payReqRef}>
              <div
                className={style.customSelectInput}
                onClick={() => setOpenPayReq(!openPayReq)}
              >
                {selectedRequestId
                  ? paymentRequests.find(pr => pr.id === selectedRequestId)?.requestNumber
                  : "Select Payment Request"}
                <span className={style.selectArrow}>▾</span>
              </div>

              {openPayReq && (
                <div className={style.customSelectDropdown}>
                  {loadingRequests ? (
                    <div className={style.customSelectOption}>Loading...</div>
                  ) : paymentRequests.filter(pr => pr.status === 'Released' && pr.requestType === 'Petty Cash').length === 0 ? (
                    <div className={style.customSelectOption}>No Payment Requests</div>
                  ) : (
                    paymentRequests
                      .filter(
                        pr => 
                          pr.status === 'Released' && 
                          pr.requestType === 'Petty Cash' && 
                          pr.id !== selectedRequestId 
                      )
                      .map(pr => (
                        <div
                          key={pr.id}
                          className={style.customSelectOption}
                          onClick={() => {
                            setSelectedRequestId(pr.id);
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
          <div className={style.flexSelectPaymentRead}>
            <label className={style.editLabel}>Vendor:</label>
            <input type="text" value={formData.vendorName} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
          </div>

          <div className={style.flexSelectPaymentRead}>
            <label className={style.editLabel}>Department:</label>
            <input type="text" value={formData.departmentName} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
          </div>
          </div>

          <div className={style.editPaymentReqSelect}>
            <div className={style.flexSelectPaymentRead}>
              <label className={style.editLabel}>Charge To:</label>
              <input type="text" value={formData.chargeTo} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
            </div>
            <div className={style.flexSelectPaymentRead}>
              <label className={style.editLabel}>Request Type:</label>
              <input type="text" value={formData.requestType} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
            </div>

            <div className={style.flexSelectPaymentRead}>
              <label className={style.editLabel}>Total Amount:</label>
              <input type="text" value={Number(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
            </div>
          </div>
          <div className={style.editPaymentReqSelect}>

            <div className={style.flexSelectPaymentRead}>
              <label className={style.editLabel}>Date Needed:</label>
              <input type="date" value={formData.dateNeeded} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
            </div>
            <div className={style.flexSelectPaymentRead}>
              <label className={style.editLabel}>Status:</label>
              <input type="text" value={formData.status} readOnly className={style.editInput} style={{ cursor: 'not-allowed', outline:'none' }} />
            </div>
          </div>

          <div className={style.flexSelectPaymentRead}>
            <label className={style.editLabel}>Remarks:</label>
            <textarea value={formData.remarks} readOnly className={style.editInput} style={{ cursor: 'not-allowed', height: '80px', paddingTop:'4px', outline:'none' }} />
          </div>

          <button type="submit" className={style.editButton} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </form>

      <div style={{padding:'0 1.25rem 5rem 1.25rem'}}>
         <div className={style.flexheaderTitleJournal}>
           <div className={style.bookingContainer}>
            <p className={style.bookingPaymentTitle}>Petty Cash Liquidation Detail</p>
            <p className={style.bookingPaymentSubtitle}>Review petty cash liquidation detail history.</p>
          </div>
        </div>
          <table className={style.tableJournal}>
            <thead>
              <tr className={style.EditjournalHeaderTableDetails}>
                <th>Booking #</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Released Total</th>
                <th>Released Amount</th>
                <th>Liquidated Amount</th>
                <th>Return/Refund</th>
                <th>Action</th>
              </tr>
            </thead>
              <tbody>
                {mappedDetails.length === 0 ? (
                  <tr className={style.journalBodyTable}>
                    <td style={{ gridColumn: "1 / -1", textAlign: "center", padding: "12px" }}>
                      No details found.
                    </td>
                  </tr>
                ) : (
                  mappedDetails.map(d => (
                    <tr key={d.id || d.bookingNumber} className={style.EditpayreqDetailsBodyTable}>
                      <td>{d.bookingNumber}</td>
                      <td>{d.chargeDesc || "--"}</td>
                      <td>{d.quantity}</td>
                      <td>{Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{(Number(d.quantity) * Number(d.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{(d.liquidatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{(d.returnRefundAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>

                      <td>
                        <button
                          className={style.editBtnLiquidation}
                          onClick={() => {
                            setSelectedDetail(d);
                            setLiquidatedAmount("");
                            setShowLiquidationModal(true);
                          }}
                        >
                          Liquidate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            { (details ?? []).length > 0 && (
              <tfoot>
                <tr className={style.totalPayreqDetailsEdit}>
                  <td colSpan="5" style={{ textAlign: "right", fontWeight: "bold", paddingRight: "12px" }}>
                    Total:
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ fontWeight: "bold" }}>
                    {(mappedDetails ?? []).reduce(
                      (sum, d) => sum + (Number(d.quantity) * Number(d.amount) || 0),
                      0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    {(mappedDetails ?? []).reduce(
                      (sum, d) => sum + (Number(d.liquidatedAmount) || 0),
                      0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    {(mappedDetails ?? []).reduce(
                      (sum, d) => sum + (Number(d.returnRefundAmount) || 0),
                      0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>

            {showLiquidationModal && (
              <div className={style.modalOverlay}>
                <div className={style.modal}>
                  <div className={style.modalHeader}>
                    <h3>Liquidate Amount</h3>
                    <button
                      className={style.closeButton}
                      onClick={() => setShowLiquidationModal(false)}
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

                  <div className={style.formContainer}>
                    <label className={style.modalLabel}>Released Total:</label>
                    <input
                      type="text"
                      value={releasedTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      readOnly
                      className={style.modalInput}
                      style={{outline:'none', cursor:'not-allowed'}}
                    />

                    <label className={style.modalLabel}>Liquidated Amount:</label>
                    <input
                      type="number"
                      className={style.modalInput}
                      value={liquidatedAmount}
                      onChange={(e) => setLiquidatedAmount(e.target.value)}
                      placeholder='0.00'
                    />

                    <label className={style.modalLabel}>Return / Refund:</label>
                    <input
                      type="text"
                      value={returnRefundAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                      readOnly
                      className={style.modalInput}
                      style={{outline:'none', cursor:'not-allowed'}}
                    />

                    <div className={style.modalActions}>
                      <button
                        className={style.cancelButton}
                        onClick={() => setShowLiquidationModal(false)}
                      >
                        Cancel
                      </button>

                      <button
                        className={style.submitButton}
                        onClick={async () => {
                          if (!selectedDetail) {
                            toast.error("No detail selected");
                            return;
                          }

                          console.log({
                            pettyCashLiquidationId: Number(id),
                            paymentRequestDetailId: selectedDetail.id,
                            liquidatedAmount: Number(liquidatedAmount),
                            returnRefundAmount
                          });

                          try {
                            await createLiquidationDetail({
                              pettyCashLiquidationId: Number(id),            
                              paymentRequestDetailId: selectedDetail.id,     
                              liquidatedAmount: Number(liquidatedAmount),
                              returnRefundAmount
                            }).unwrap();

                            toast.success("Liquidation saved");
                            setShowLiquidationModal(false);
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to save liquidation", error);
                          }
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        <ToastContainer />
      </div>
    </main>
  );
}

export default EditPettyCashLiquidation;
