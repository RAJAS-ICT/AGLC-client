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

  const [logoutUser] = useLogoutUserMutation();
  const { data: user, isLoading } = useCurrentUserQuery();
  const dispatch = useDispatch();

  const [openSetup, setOpenSetup] = useState(false);
  const [openOperations, setOpenOperations] = useState(false);
  const [openPettyCash, setOpenPettyCash] = useState(false);

  const toggleUsers = () => {
    setOpenUsers(prev => !prev);
    setOpenBusiness(false);
    setOpenSetup(false);
    setOpenOperations(false);
    setOpenPettyCash(false);
  };

  const toggleBusiness = () => {
    setOpenBusiness(prev => !prev);
    setOpenUsers(false);
    setOpenSetup(false);
    setOpenOperations(false);
    setOpenPettyCash(false);
  };


  const toggleSetup = () => {
    setOpenSetup(prev => !prev);
    setOpenUsers(false);
    setOpenBusiness(false);
    setOpenOperations(false);
    setOpenPettyCash(false);
  };

  const toggleOperations = () => {
    setOpenOperations(prev => !prev);
    setOpenUsers(false);
    setOpenBusiness(false);
    setOpenSetup(false);
    setOpenPettyCash(false);
  };

  const togglePettyCash = () => {
    setOpenPettyCash(prev => !prev);
    setOpenUsers(false);
    setOpenBusiness(false);
    setOpenSetup(false);
    setOpenOperations(false);
  };


  const closeAllAccordions = () => {
    setOpenUsers(false);
    setOpenBusiness(false);
    setOpenSetup(false);
    setOpenOperations(false);
    setOpenPettyCash(false);
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
              <Link className={style.link} onClick={closeAllAccordions} to="/user"><p>User</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/employee"><p>Employee</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/customer"><p>Customer</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/agents"><p>Agent</p></Link>
            </div>
          </div>
          {/* Accounts */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleSetup}>
              <div className={style.flexUserManagement}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" fill-rule="evenodd">
                    <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                    <path fill="currentColor" d="m12.67 2.217l8.5 4.75A1.5 1.5 0 0 1 22 8.31v1.44c0 .69-.56 1.25-1.25 1.25H20v8h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1v-8h-.75C2.56 11 2 10.44 2 9.75V8.31c0-.522.27-1.002.706-1.274l8.623-4.819a1.5 1.5 0 0 1 1.342 0ZM17 11H7v8h2v-6h2v6h2v-6h2v6h2zm-5-5a1 1 0 1 0 0 2a1 1 0 0 0 0-2" />
                  </g>
                </svg>
                <p>Accounts</p>
              </div>
              <span className={`${style.arrow} ${openSetup ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>
            <div
              className={`${style.accordionContent} ${openSetup ? style.openAccordion : ''}`}
              style={{ maxHeight: openSetup ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/account"><p>Account</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/subAccount"><p>Sub Account</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/banks"><p>Bank</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/paymentRequest"><p>Payment Request</p></Link>
            </div>
          </div>
          {/* Petty Cash */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={togglePettyCash}>
              <div className={style.flexUserManagement}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <defs>
                    <path id="SVGS9q3IkIf" d="M21.5 11v10h-19V11z" />
                  </defs>
                  <g fill="none">
                    <use href="#SVGS9q3IkIf" />
                    <path d="M12 13.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5m5.136-7.209L19 5.67l1.824 5.333H3.002L3 11.004L14.146 2.1z" />
                    <path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M21 11.003h-.176L19.001 5.67L3.354 11.003L3 11m-.5.004H3L14.146 2.1l2.817 3.95" />
                    <g stroke="currentColor" stroke-linecap="square" stroke-width="2">
                      <path d="M14.5 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z" />
                      <use href="#SVGS9q3IkIf" />
                      <path d="M2.5 11h2a2 2 0 0 1-2 2zm19 0h-2a2 2 0 0 0 2 2zm-19 10h2.002A2 2 0 0 0 2.5 18.998zm19 0h-2a2 2 0 0 1 2-2z" />
                    </g>
                  </g>
                </svg>
                <p>Petty Cash</p>
              </div>
              <span className={`${style.arrow} ${openPettyCash ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>
            <div
              className={`${style.accordionContent} ${openPettyCash ? style.openAccordion : ''}`}
              style={{ maxHeight: openPettyCash ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/pettyCashRelease">
                <p>Petty Cash Release</p>
              </Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/pettyCashLiquidation">
                <p>Petty Cash Liquidation</p>
              </Link>
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
              <Link className={style.link} onClick={closeAllAccordions} to="/affiliates"><p>Affiliate</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/company"><p>Company</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/vendor"><p>Vendor</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/department"><p>Department</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/localGovernmentAgency"><p>Local Government Agency</p></Link>
            </div>
          </div>
          {/* Operations */}
          <div className={style.accordionItem}>
            <div className={style.accordionHeader} onClick={toggleOperations}>
              <div className={style.flexUserManagement}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.669 2.282c.218-.043.443-.043.662 0c.251.048.479.167.691.277l.053.028l8.27 4.28a.75.75 0 0 1 .405.666v7.898c0 .283.002.583-.093.862a1.8 1.8 0 0 1-.395.652c-.205.214-.473.351-.723.48l-.063.033l-8.131 4.208a.75.75 0 0 1-.69 0l-8.131-4.208l-.063-.033c-.25-.129-.518-.266-.723-.48a1.8 1.8 0 0 1-.395-.652c-.095-.28-.094-.58-.093-.863V7.533a.75.75 0 0 1 .405-.666l8.269-4.28l.053-.027c.213-.111.44-.23.692-.278m.226 1.496a7 7 0 0 0-.282.141L4.668 7.514l2.827 1.384l7.356-3.703l-2.465-1.276a7 7 0 0 0-.282-.141l-.058-.024m4.45 2.292l-7.31 3.68L12 11.102l7.332-3.588zm-5.246 13.72v-7.36l-3-1.469v1a.75.75 0 0 1-1.5 0v-1.734l-3-1.468v6.624c0 .187 0 .294.005.375l.009.078a.3.3 0 0 0 .057.095c.005.004.021.017.064.042c.068.042.163.09.328.176zm.645-15.988l.06-.024z" />
                </svg>
                <p>Operations</p>
              </div>
              <span className={`${style.arrow} ${openOperations ? style.rotate : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" />
                </svg>
              </span>
            </div>
            <div
              className={`${style.accordionContent} ${openOperations ? style.openAccordion : ''}`}
              style={{ maxHeight: openOperations ? '500px' : '0' }}
            >
              <Link className={style.link} onClick={closeAllAccordions} to="/booking"><p>Booking</p></Link>
              <Link className={style.link} onClick={closeAllAccordions} to="/charge"><p>Charge</p></Link>
            </div>
          </div>

        </div>
      </aside>
    </main>
  );
}

export default Nav;
