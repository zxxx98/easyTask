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
import ParamList from './pages/ParamList'
import ParamCreate from './pages/ParamCreate'
import ParamEdit from './pages/ParamEdit'

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
        <Route path="params" element={<ParamList />} />
        <Route path="params/new" element={<ParamCreate />} />
        <Route path="params/:name" element={<ParamEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App