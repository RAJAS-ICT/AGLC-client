import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  useFetchSubAccountByIdQuery,
  useUpdateSubAccountMutation,
} from '../../features/subAccountTitleSlice';
import { useFetchAccountQuery } from '../../features/accountTitleSlice';
import toast, { Toaster } from 'react-hot-toast';
import style from '../css/page.module.css';
import { Mosaic } from "react-loading-indicators";

function EditSubAccount() {

  const [openAccountEdit, setOpenAccountEdit] = useState(false);
  const accountEditRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountEditRef.current && !accountEditRef.current.contains(event.target)) {
        setOpenAccountEdit(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { id } = useParams();
  // const navigate = useNavigate();

  const { data: subAccount, isLoading, isError, error } = useFetchSubAccountByIdQuery(id);
  const { data: accountTitles = [], isLoading: loadingAccounts } = useFetchAccountQuery();
  const [updateSubAccount, { isLoading: isUpdating }] = useUpdateSubAccountMutation();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    accountDept: false,
    accountList: false,
    accountListItem: '',
    accountId: '',
    isActive: false,
  });

  useEffect(() => {
    if (subAccount) {
      setFormData({
        code: subAccount.code || '',
        name: subAccount.name || '',
        accountDept: subAccount.accountDept ?? false,
        accountList: subAccount.accountList ?? false,
        accountListItem: subAccount.accountListItem || '',
        accountId: subAccount.accountId || '',
        isActive: subAccount.isActive ?? false,
      });
    }
  }, [subAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        accountId: formData.accountId ? parseInt(formData.accountId, 10) : null,
      };

      await updateSubAccount({ id, ...payload }).unwrap();
      toast.success('Updated successfully!');
      // navigate('/subaccount');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update Sub Account.');
    }
  };

  const [showLoader, setShowLoader] = useState(true);
   
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
    }, []);
     
    if (showLoader || isLoading || loadingAccounts) {
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

  if (isError) return <p>Error: {error?.message || 'Something went wrong'}</p>;

  const activeAccounts = accountTitles.filter((acc) => acc.isActive);

  return (
    <main className="main-container">
      <Toaster position="top-right" reverseOrder={false} />

      <div className={style.editContainer}>
        <div className={style.flexTitleHeader}>
            <svg className={style.svgTitleHeader} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M7.005 3.1a1 1 0 1 1 1.99 0l-.388 6.35a.61.61 0 0 1-1.214 0zM7 12a1 1 0 1 1 2 0a1 1 0 0 1-2 0"/></svg>
            <h3 className={style.headerLaber}>Edit Sub Account</h3>
        </div>

        <form onSubmit={handleSubmit} className={style.editForm}>
          <label className={style.editLabel}>Code:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />

          <label className={style.editLabel}>Name:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        <div className={style.editActiveAccountWraper}>
          <div className={style.editActiveHolder}>
            <label>Account Department:</label>
            <input
              className={style.editActive}
              type="checkbox"
              checked={formData.accountDept}
              onChange={(e) => setFormData({ ...formData, accountDept: e.target.checked })}
            />
          </div>

          <div className={style.editActiveHolder}>
            <label>Account List:</label>
            <input
              className={style.editActive}
              type="checkbox"
              checked={formData.accountList}
              onChange={(e) => setFormData({ ...formData, accountList: e.target.checked })}
            />
          </div>
        </div>
          <label className={style.editLabel}>Account List Item:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Account List Item"
            value={formData.accountListItem}
            onChange={(e) => setFormData({ ...formData, accountListItem: e.target.value })}
          />

          <label className={style.editLabel}>Select Account Title:</label>
          <div className={style.customSelectWrapper} ref={accountEditRef}>
            <div
              className={style.customSelectInput}
              onClick={() => setOpenAccountEdit(!openAccountEdit)}
            >
              {formData.accountId
                ? activeAccounts.find((a) => a.id === formData.accountId)?.name
                : "-- Select Account --"}
              <span className={style.selectArrow}>▾</span>
            </div>

            {openAccountEdit && (
              <div className={style.customSelectDropdown}>
                {activeAccounts.length === 0 ? (
                  <div className={style.customSelectOption} style={{ cursor: "default" }}>
                    No accounts
                  </div>
                ) : (
                  activeAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={style.customSelectOption}
                      onClick={() => {
                        setFormData({ ...formData, accountId: account.id });
                        setOpenAccountEdit(false);
                      }}
                    >
                      {account.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <label className={style.editLabel}>Account ID:</label>
          <input
            className={style.editInputSubAccount}
            type="text"
            placeholder="Account ID"
            value={formData.accountId}
            disabled
          />
          <div className={style.editActiveHolder}>
            <label>Active:</label>
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

export default EditSubAccount;
