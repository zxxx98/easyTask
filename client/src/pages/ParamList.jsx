import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../config/request'
import { toast } from 'react-toastify'

function ParamList() {
  const navigate = useNavigate()
  const [params, setParams] = useState({})
  const [loading, setLoading] = useState(true)

  // 加载参数列表
  useEffect(() => {
    loadParams()
  }, [])

  const loadParams = async () => {
    try {
      const response = await request.get('/api/params')
      setParams(response.data)
    } catch (err) {
      console.error('加载全局参数失败:', err)
      toast.error('加载全局参数失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除参数
  const handleDelete = async (name) => {
    if (!window.confirm(`确定要删除参数 ${name} 吗？`)) {
      return
    }

    try {
      await request.delete(`/api/params/${name}`)
      toast.success('删除成功')
      loadParams()
    } catch (err) {
      console.error('删除全局参数失败:', err)
      toast.error(err.response?.data?.error || '删除全局参数失败')
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">全局参数管理</h1>
        <button
          onClick={() => navigate('/params/new')}
          className="btn btn-primary"
        >
          新建参数
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                参数名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                参数值
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(params).map(([name, value]) => (
              <tr key={name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/params/${name}`)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {Object.keys(params).length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                  暂无全局参数
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ParamList