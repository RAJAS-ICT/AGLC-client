import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useFetchSubAccountByIdQuery,
  useUpdateSubAccountMutation,
} from '../../features/subAccountTitleSlice';
import { useFetchAccountQuery } from '../../features/accountTitleSlice';
import { ToastContainer, toast } from 'react-toastify';
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

  const activeAccounts = accountTitles.filter((acc) => acc.isActive);

  return (
    <main className="main-container">
      <div className={style.editContainer}>
            <div className={style.EditflexTitleHeader}>
             <div className={style.flexheaderTitle}>
              <svg className={style.EditsvgExclamation} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z" />
              </svg>
              <h3 className={style.headerLaber}>Update Sub Account</h3>
              </div>
              <p className={style.headerSubtitle}>View and manage sub account.</p>
            </div>

        <form onSubmit={handleSubmit} className={style.editForm}>
          <div className={style.flexInput}>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Code:</label>
              <input
                className={style.editInput}
                type="text"
                placeholder="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className={style.gridUserEdit}>
              <label className={style.editLabel}>Name:</label>
              <input
                className={style.editInput}
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>
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
                  activeAccounts
                  .filter((a) => a.id !== formData.accountId)
                  .map((account) => (
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

          <button className={style.editButton} type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default EditSubAccount;
