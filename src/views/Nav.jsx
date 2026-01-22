import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from '../views/css/nav.module.css';
import pfp from '../assets/userpfp.jpg';
import { useCurrentUserQuery, useLogoutUserMutation } from '../features/userSlice';
import { toast } from 'react-toastify';
import { Mosaic } from "react-loading-indicators";

import { useDispatch } from 'react-redux';
import { userApi } from '../features/userSlice'; 

function Nav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [openUsers, setOpenUsers] = useState(false);
  const [openBusiness, setOpenBusiness] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);

  const [logoutUser] = useLogoutUserMutation();
  const { data: user, isLoading } = useCurrentUserQuery();
  const dispatch = useDispatch();

  const toggleUsers = () => {
    setOpenUsers(prev => !prev);
    setOpenBusiness(false);
    setOpenTransactions(false);
  };

  const toggleBusiness = () => {
    setOpenBusiness(prev => !prev);
    setOpenUsers(false);
    setOpenTransactions(false);
  };

  const toggleTransactions = () => {
    setOpenTransactions(prev => !prev);
    setOpenUsers(false);
    setOpenBusiness(false);
  };

  const closeAllAccordions = () => {
    setOpenUsers(false);
    setOpenBusiness(false);
    setOpenTransactions(false);
  };
    const [loadingLogout, setLoadingLogout] = useState(false); 
    const handleLogout = async () => {
      setLoadingLogout(true);
      setTimeout(async () => { 
      try {
        await logoutUser().unwrap();
        toast.success('Logged out successfully');
        localStorage.clear();
        sessionStorage.clear();
        dispatch(userApi.util.resetApiState());
        window.location.href = '/login'; 
      } catch (err) {
        toast.error('Logout failed');
        console.error(err);
        setLoadingLogout(false);
      }
    }, 1000);
  };

 const [showLoader, setShowLoader] = useState(true);
   
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
    }, []);
     
    if (showLoader || isLoading || loadingLogout) {
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

  if (!user) return null;

  return (
    <main className={style.main}>
      {/* Top Bar */}
      <div className={style.topBar}>
        <p className={style.welcomeText}>{user?.username || 'Guest'}</p>
          <div className={style.profileWrapper}>
            <img
              src={pfp}
              alt="profile"
              className={style.profileImg}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            <div className={`${style.dropdown} ${isDropdownOpen ? style.open : ''}`}>
              <Link
                className={style.dropdownItem1}
                to={`/editProfile/${user.id}`}
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg
                  className={style.svgProf}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z"
                  />
                </svg>
                <p>Change Password</p>
              </Link>
              <button className={style.dropdownItem2} onClick={handleLogout}>
                <svg
                  className={style.svgLogout}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h6q.425 0 .713.288T12 20t-.288.713T11 21zm12.175-8H10q-.425 0-.712-.288T9 12t.288-.712T10 11h7.175L15.3 9.125q-.275-.275-.275-.675t.275-.7t.7-.313t.725.288L20.3 11.3q.3.3.3.7t-.3.7l-3.575 3.575q-.3.3-.712.288t-.713-.313q-.275-.3-.262-.712t.287-.688z"
                  />
                </svg>
                <p>Logout</p>
              </button>
            </div>
          </div>
      </div>

      {/* Sidebar */}
      <aside className={style.sideBar}>
        <div className={style.logoContainer}>
          <p className={style.logoHeader}>ACESTAR</p>
          <p className={style.logoSubHeader}>Global Logistics Corporation</p>
        </div>

        <hr className={style.hr} />

        <div className={style.menuList}>
          <small className={style.menuCaption}>MENU</small>

          {/* User Directory */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleUsers}>
              <div className={style.flexUserManagement}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7" />
              </svg>
              <p>User Directory</p>
              </div>
              <span className={`${style.arrow} ${openUsers ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>

            <div
              className={`${style.accordionContent} ${openUsers ? style.openAccordion : ''}`}
              style={{ maxHeight: openUsers ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/user"><p>Users</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/employee"><p>Employee</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/customer"><p>Customer</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/agents"><p>Agents</p></Link>
            </div>
          </div>

          {/* Entities */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleBusiness}>
              <div className={style.flexUserManagement}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7.998 5.75A3.752 3.752 0 1 1 12.5 9.428V11.5h3.25A2.25 2.25 0 0 1 18 13.75v.825a3.754 3.754 0 0 1-.748 7.43a3.752 3.752 0 0 1-.752-7.43v-.825a.75.75 0 0 0-.75-.75h-8a.75.75 0 0 0-.75.75v.825a3.754 3.754 0 0 1-.748 7.43a3.752 3.752 0 0 1-.752-7.43v-.825a2.25 2.25 0 0 1 2.25-2.25H11V9.428A3.754 3.754 0 0 1 7.998 5.75" />
                </svg>
              <p>Entities</p>
              </div>
              <span className={`${style.arrow} ${openBusiness ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>

            <div
              className={`${style.accordionContent} ${openBusiness ? style.openAccordion : ''}`}
              style={{ maxHeight: openBusiness ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/affiliates"><p>Affiliates</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/company"><p>Company</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/vendor"><p>Vendor</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/department"><p>Department</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/localGovernmentAgency"><p>Local Government Agency</p></Link>
            </div>
          </div>

          {/* Transactions */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleTransactions}>
              <div className={style.flexUserManagement}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8.625 8.5h-4.5a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v3.5h3.5a1 1 0 0 1 0 2" />
                <path fill="currentColor" d="M21 13a1 1 0 0 1-1-1A7.995 7.995 0 0 0 5.08 8.001a1 1 0 0 1-1.731-1.002A9.995 9.995 0 0 1 22 12a1 1 0 0 1-1 1m-1.125 9a1 1 0 0 1-1-1v-3.5h-3.5a1 1 0 0 1 0-2h4.5a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1" />
                <path fill="currentColor" d="M12 22A10.01 10.01 0 0 1 2 12a1 1 0 0 1 2 0a7.995 7.995 0 0 0 14.92 3.999a1 1 0 0 1 1.731 1.002A10.03 10.03 0 0 1 12 22" />
              </svg>
              <p>Transactions</p>
              </div>
              <span className={`${style.arrow} ${openTransactions ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>

            <div
              className={`${style.accordionContent} ${openTransactions ? style.openAccordion : ''}`}
              style={{ maxHeight: openTransactions ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/account"><p>Account</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/subAccount"><p>Sub Account</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/banks"><p>Banks</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/booking"><p>Booking</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/charge"><p>Charge</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/paymentRequest"><p>Payment Request</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/pettyCashRelease"><p>Petty Cash Release</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/pettyCashLiquidation"><p>Petty Cash Liquidation</p></Link>
            </div>
          </div>
        </div>
      </aside>

    </main>
  );
}

export default Nav;
