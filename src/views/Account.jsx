import React, { useRef, useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  useFetchAccountQuery,
  useImportExcelMutation,
  usePostAccountMutation,
} from '../features/accountTitleSlice';
import { useNavigate, Link } from 'react-router-dom';
import style from '../views/css/page.module.css';
import * as XLSX from 'xlsx';
import { Mosaic } from "react-loading-indicators";

function Account() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFetchAccountQuery();
  const accounts = data ?? [];

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    accountType: '',
    reportType: '',
    lineItem: '',
    isActive: true,
  });

  const [addAccount] = usePostAccountMutation();
  const [importExcel] = useImportExcelMutation();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  const itemsPerPage = 7;
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.code.toLowerCase().includes(search.toLowerCase()) ||
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountType.toLowerCase().includes(search.toLowerCase()) ||
      acc.reportType.toLowerCase().includes(search.toLowerCase()) ||
      acc.lineItem.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const currentAccounts = filteredAccounts.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrevious = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addAccount(formData).unwrap();
      toast.success(response.message || 'Account Added!');
      setFormData({
        code: '',
        name: '',
        accountType: '',
        reportType: '',
        lineItem: '',
        isActive: true,
      });
      setShowModal(false);
      navigate(`/editAccount/${response.data.id}`);
    } catch (err) {
      const message = err?.data?.message || err?.error || 'Action failed!';
      toast.error(message);
    }
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await delay(2000); 
      const res = await importExcel(formData).unwrap();
      toast.success(res.message || 'Imported successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Import failed!');
    } finally {
      setIsImporting(false);
      setIsDropdownOpen(false); 
      e.target.value = '';
    }
  };

  const handleExport = () => {
    if (accounts.length === 0) {
      toast.error('No data to export');
      return;
    }

    const filteredData = accounts.map(({ id, code, name, accountType, reportType, lineItem }) => ({
      id,
      code,
      name,
      accountType,
      reportType,
      lineItem,
    }));

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accounts');
    XLSX.writeFile(wb, 'accounts_export.xlsx');
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
      <Toaster position="top-right" />

      <div className={style.ListContainer}>
       
        <div className={style.pageHeaderContainerAccount}>
            <div className={style.flexTitleHeader}>
             <div className={style.flexheaderTitle}>
                <svg className={style.svgExclamation} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path fill="currentColor" d="M0 12V0h12v2.5H2.5V12z" />
                  <path fill="currentColor" d="M16 4H4v12h12z" />
                </svg>
              <h3 className={style.headerLaber}>Manage Accounts</h3>
              </div>
              <p className={style.headerSubtitle}>Transactions / Account</p>
            </div>
          <div className={style.flexHeader}>
             <div className={style.SrchContainer}>
                <input
                  type="text"
                  className={style.inputSrch}
                  required
                  placeholder="Type to search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <div className={style.icon}>
                <svg style={{color:'#3a3a3a'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                    <path d="m21 21l-4.34-4.34" />
                    <circle cx="11" cy="11" r="8" />
                  </g>
                </svg>
                </div>
              </div>

            <button className={style.addBtn} onClick={() => setShowModal(true)} title="Add Account">
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
            <div className={style.moreWrapper}>
                <button
                    className={style.moreBtn}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    disabled={isImporting}
                    title="Import/Export File"
                  >
                {isImporting ? (
                  <div className={style.loadingWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z" opacity="0.5"/><path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"><animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12" type="rotate"/></path></svg>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zm1.225-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
                    />
                  </svg>
                )}
              </button>
                {isDropdownOpen && !isImporting && (
                  <div className={style.dropdownMenu}>
                    <button onClick={handleImport} className={style.dropdownItem}>
                      Import
                    </button>
                    <button onClick={handleExport} className={style.dropdownItem}>
                      Export
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  className={style.hiddenFileInput}
                  onChange={handleFileChange}
                />
              </div>
          </div>
        
        </div>
        {showModal && (
          <div className={style.modalOverlay}>
            <div className={style.modal}>
              <div className={style.modalHeader}>
                <h3>Add Account</h3>
                <button
                  className={style.closeButton}
                  onClick={() => setShowModal(false)}
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
              <form onSubmit={handleSubmit} className={style.formContainer}>
                <label className={style.modalLabel}>Code: </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Code"
                  required
                />
                <label className={style.modalLabel}>Name: </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Name"
                  required
                />
                <label className={style.modalLabel}>Account Type: </label>
                <input
                  type="text"
                  value={formData.accountType}
                  onChange={(e) =>
                    setFormData({ ...formData, accountType: e.target.value })
                  }
                  placeholder="Account Type"
                />
                <label className={style.modalLabel}>Report Type: </label>
                <input
                  type="text"
                  value={formData.reportType}
                  onChange={(e) =>
                    setFormData({ ...formData, reportType: e.target.value })
                  }
                  placeholder="Report Type"
                />
                <label className={style.modalLabel}>Line Item: </label>
                <input
                  type="text"
                  value={formData.lineItem}
                  onChange={(e) =>
                    setFormData({ ...formData, lineItem: e.target.value })
                  }
                  placeholder="Line Item"
                />
                <div className={style.activeWrap}>
                  <label> Active:</label>
                  <input
                    className={style.activeHolder}
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
                <div className={style.modalActions}>
                  <button
                    type="button"
                    className={style.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={style.submitButton}>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <table>
          <thead>
            <tr className={style.headAccountTable}>
              <th>Code</th>
              <th>Name</th>
              <th>Account Type</th>
              <th>Report Type</th>
              <th>Line Item</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentAccounts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No accounts found
                </td>
              </tr>
            ) : (
              currentAccounts.map((account) => (
                <tr className={style.bodyAccountTable} key={account.id}>
                  <td>{account.code}</td>
                  <td>{account.name}</td>
                  <td>{account.accountType}</td>
                  <td>{account.reportType}</td>
                  <td>{account.lineItem}</td>
                  <td>
                    <button
                      className={style.editBtn}
                      onClick={() =>
                        navigate(`/editAccount/${account.id}`)
                      }
                    >
                       <svg className={style.svdEditIcon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.14 2.25a5.61 5.61 0 0 0-5.327 7.376L2.77 17.671a1.774 1.774 0 0 0 0 2.508l1.052 1.052a1.773 1.773 0 0 0 2.509 0l8.044-8.045a5.61 5.61 0 0 0 7.19-6.765c-.266-1.004-1.442-1.104-2.032-.514L17.81 7.629a1.017 1.017 0 1 1-1.438-1.438l1.722-1.723c.59-.59.49-1.766-.515-2.032a5.6 5.6 0 0 0-1.438-.186"/></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className={style.paginationContainer}>
            <button
              className={style.pageButton}
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`${style.pageButton} ${
                  currentPage === i + 1 ? style.activePage : ''
                }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={style.pageButton}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Account;
