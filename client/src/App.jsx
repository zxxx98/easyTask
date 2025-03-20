import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ScriptList from './pages/ScriptList'
import ScriptEdit from './pages/ScriptEdit'
import ScriptCreate from './pages/ScriptCreate'
import PackageManager from './pages/PackageManager'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ScriptList />} />
        <Route path="scripts/new" element={<ScriptCreate />} />
        <Route path="scripts/:id" element={<ScriptEdit />} />
        <Route path="packages" element={<PackageManager />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App