import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useRegisterUserMutation, useGetUserCountQuery } from '../features/userSlice'
import authStyle from '../auth/auth.module.css'
import logo from '../assets/acestar.jpg'

export default function Register() {
  const navigate = useNavigate()
  const { data, isLoading } = useGetUserCountQuery()
  const [newUser, { isLoading: registering }] = useRegisterUserMutation()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    role: 'Power User',
  })

  if (!isLoading && data?.count > 0) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await newUser(formData).unwrap()
      toast.success(response.message || 'Registered successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed!')
    }
  }

  return (
    <main className={authStyle.mainRegister}>
      <Toaster position="top-right" />

      <form onSubmit={handleSubmit} className={authStyle.formRegister}>
        <div className={authStyle.logHeader}>
          <img className={authStyle.img} src={logo} alt="logo" />
        </div>

        <input
          className={authStyle.fieldRegister}
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Username"
          required
        />

        <input
          className={authStyle.fieldRegister}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
        />

        <input
          className={authStyle.fieldRegister}
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          placeholder="First name"
          required
        />

        <input
          className={authStyle.fieldRegister}
          type="text"
          value={formData.middleName}
          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          placeholder="Middle name"
        />

        <input
          className={authStyle.fieldRegister}
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          placeholder="Last name"
        />

        <input
          className={authStyle.fieldRegister}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          required
        />

        <button className={authStyle.btnLogin} type="submit" disabled={registering}>
          {registering ? 'Registering…' : 'Register'}
        </button>

        <p className={authStyle.linkRegister}>
          Already have an account?{' '}
          <Link className={authStyle.link} to="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  )
}
