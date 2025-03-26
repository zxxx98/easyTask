/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-25 23:24:48
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-26 21:33:10
 * @FilePath: \easyTask\client\src\pages\EnvList.jsx
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../config/request'
import { toast } from 'react-toastify'
import MonacoEditor from 'react-monaco-editor'

function EnvList() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 加载参数列表
  useEffect(() => {
    loadParams()
  }, [])

  const loadParams = async () => {
    try {
      const response = await request.get('/api/env')
      setContent(response.data.params)
    } catch (err) {
      console.error('加载全局参数失败:', err)
      toast.error('加载全局参数失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存参数
  const handleSave = async () => {
    try {
      setSaving(true)
      await request.post('/api/env/update', { params:content })
      toast.success('保存成功')
    } catch (err) {
      console.error('保存全局参数失败:', err)
      toast.error(err.response?.data?.error || '保存全局参数失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">环境变量管理</h1>
        <button
          onClick={handleSave}
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4">
          <MonacoEditor
            width="100%"
            height={"80vh"}
            language="ini"
            theme="vs-dark"
            value={content}
            onChange={setContent}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              theme: 'vs-dark',
              wordWrap: 'on',
              fontSize: 18
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default EnvList