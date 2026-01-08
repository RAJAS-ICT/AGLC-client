import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import {
  useGetAgentByIdQuery,
  useUpdateAgentMutation,
} from '../../features/agentSlice'
import style from '../css/page.module.css'
import { Mosaic } from 'react-loading-indicators'

function EditAgents() {
  const { id } = useParams()

  const {
    data: agent,
    isLoading,
    isError,
    error,
  } = useGetAgentByIdQuery(id)

  const [updateAgent, { isLoading: isUpdating }] =
    useUpdateAgentMutation()

  const [formData, setFormData] = useState({
    name: '',
  })

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
      })
    }
  }, [agent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateAgent({ id, ...formData }).unwrap()
      toast.success('Updated successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update agent.')
    }
  }

  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (showLoader || isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          zIndex: 9999,
        }}
      >
        <Mosaic color="#0D254C" size="small" />
      </div>
    )
  }

  if (isError) {
    const status = error?.status

    if (status === 401) {
      return (
        <div className={style.unauthorizedWrapper}>
          <p className={style.error1}>401</p>
          <p className={style.error2}>Unauthorized Error</p>
          <p className={style.error3}>
            The resource requested could not be found on this server.
          </p>
        </div>
      )
    }

    return <p>Error: {error?.data?.message || 'Something went wrong'}</p>
  }

  return (
    <main className="main-container">
      <Toaster position="top-right" reverseOrder={false} />

      <div className={style.editCustomer}>
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
            <h3 className={style.headerLaber}>Edit Agent</h3>
          </div>
          <p className={style.headerSubtitle}>
            Management / Agents
          </p>
        </div>

        <form onSubmit={handleSubmit} className={style.editFormCustomer}>
          <label className={style.editLabel}>Name:</label>
          <input
            className={style.editInput}
            type="text"
            placeholder="Agent Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <button
            className={style.editButton}
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default EditAgents
