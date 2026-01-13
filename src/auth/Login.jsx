import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useLoginUserMutation, useGetUserCountQuery } from '../features/userSlice';
import authStyle from '../auth/auth.module.css';
import logo from '../assets/acestar.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [logUser, { isLoading }] = useLoginUserMutation();


  const { data, isSuccess } = useGetUserCountQuery();
  const showRegister = isSuccess && data?.count === 0; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await logUser(formData).unwrap();
      if (!res?.data?.isActive) {
        toast.error('Your account is inactive.');
        return;
      }
      toast.success('Login successful!');
      navigate('/user');
    } catch (error) {
      const message = error?.data?.message || error?.error || 'Login failed!';
      toast.error(message);
    }
  };

  return (
    <main className={authStyle.mainLogin}>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className={authStyle.formLogin}>
        <div className={authStyle.logHeader}>
          <img className={authStyle.img} src={logo} alt="Logo" />
         
        </div>

        <input
          className={authStyle.fieldLogin}
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Username"
          required
        />

        <input
          className={authStyle.fieldLogin}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          required
        />

        <button className={authStyle.btnLogin} type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {showRegister && (
          <p className={authStyle.linkLogin}>
            Don't have an account? <Link className={authStyle.link} to="/register">Register</Link>
          </p>
        )}
      </form>
    </main>
  );
}
