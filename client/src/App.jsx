/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-20 22:55:52
 * @LastEditors: 
 * @LastEditTime: 2025-03-26 21:24:12
 * @FilePath: \easyTask\client\src\App.jsx
 */
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ScriptList from './pages/ScriptList'
import ScriptEdit from './pages/ScriptEdit'
import ScriptCreate from './pages/ScriptCreate'
import PackageManager from './pages/PackageManager'
import UtilList from './pages/UtilList'
import UtilCreate from './pages/UtilCreate'
import UtilEdit from './pages/UtilEdit'
import EnvList from './pages/EnvList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ScriptList />} />
        <Route path="scripts/new" element={<ScriptCreate />} />
        <Route path="scripts/:id" element={<ScriptEdit />} />
        <Route path="packages" element={<PackageManager />} />
        <Route path="utils" element={<UtilList />} />
        <Route path="utils/new" element={<UtilCreate />} />
        <Route path="utils/:name" element={<UtilEdit />} />
        <Route path="envs" element={<EnvList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App