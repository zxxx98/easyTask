/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-20 22:55:37
 * @LastEditors: 
 * @LastEditTime: 2025-03-20 23:26:56
 * @FilePath: \easyTask\client\src\main.jsx
 */
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>,
)