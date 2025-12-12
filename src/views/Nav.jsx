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
            <Mosaic color="#374151" size="small" />
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
          {isDropdownOpen && (
            <div className={style.dropdown}>
              <Link 
                className={style.dropdownItem1} 
                to={`/editProfile/${user.id}`} 
                onClick={() => setIsDropdownOpen(false)}
              >
              <svg className={style.svgProf} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z" />
              </svg>
                <p>Change Password</p>
              </Link>
              <button className={style.dropdownItem2} onClick={handleLogout}>
                <svg className={style.svgLogout} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6q.425 0 .713.288T12 4t-.288.713T11 5H5v14h6q.425 0 .713.288T12 20t-.288.713T11 21zm12.175-8H10q-.425 0-.712-.288T9 12t.288-.712T10 11h7.175L15.3 9.125q-.275-.275-.275-.675t.275-.7t.7-.313t.725.288L20.3 11.3q.3.3.3.7t-.3.7l-3.575 3.575q-.3.3-.712.288t-.713-.313q-.275-.3-.262-.712t.287-.688z" />
                </svg>
                <p>Logout</p>
              </button>
            </div>
          )}
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

          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleUsers}>
              <p>User Management</p>
              <span>
                {openUsers ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998H6a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2"/></svg>
                : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"/></svg>
                }
              </span>
            </div>

            {openUsers && (
              <div className={style.accordionContent}>
                <Link className={style.link} onClick={closeAllAccordions} to="/user"><p>Users</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/employee"><p>Employee</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/customer"><p>Customer</p></Link>
              </div>
            )}
          </div>

          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleBusiness}>
              <p>Business</p>
              <span>
                {openBusiness ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998H6a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2"/></svg>
                : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"/></svg>
                }
              </span>
            </div>

            {openBusiness && (
              <div className={style.accordionContent}>
                <Link className={style.link} onClick={closeAllAccordions} to="/company"><p>Company</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/vendor"><p>Vendor</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/department"><p>Department</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/charge"><p>Charge</p></Link>
              </div>
            )}
          </div>

          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleTransactions}>
              <p>Transactions</p>
              <span>
                {openTransactions ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998H6a1 1 0 0 1 0-2h12a1 1 0 0 1 0 2"/></svg>
                : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"/></svg>
                }
              </span>
            </div>

            {openTransactions && (
              <div className={style.accordionContent}>
                <Link className={style.link} onClick={closeAllAccordions} to="/account"><p>Account</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/subAccount"><p>Sub Account</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/booking"><p>Booking</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/paymentRequest"><p>Payment Request</p></Link>
                <Link className={style.link} onClick={closeAllAccordions} to="/pettyCashRelease"><p>Petty Cash Release</p></Link>
                {/* <Link className={style.link} onClick={closeAllAccordions} to="/paymentRequestDetail"><p>Payment Request Detail</p></Link> */}
              </div>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}

export default Nav;
