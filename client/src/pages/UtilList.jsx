import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../config/request'
import { toast } from 'react-toastify'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

function UtilList() {
  const navigate = useNavigate()
  const [utils, setUtils] = useState([])
  const [loading, setLoading] = useState(true)

  // 加载通用脚本列表
  useEffect(() => {
    loadUtils()
  }, [])

  const loadUtils = async () => {
    try {
      const response = await request.get('/api/utils')
      setUtils(response.data)
    } catch (err) {
      console.error('加载通用脚本失败:', err)
      toast.error('加载通用脚本失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除通用脚本
  const handleDelete = async (name) => {
    if (!window.confirm(`确定要删除通用脚本 ${name} 吗？`)) {
      return
    }

    try {
      await request.delete(`/api/utils/${name}`)
      toast.success('删除成功')
      loadUtils()
    } catch (err) {
      console.error('删除通用脚本失败:', err)
      toast.error('删除通用脚本失败')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">通用脚本</h1>
        <button
          onClick={() => navigate('/utils/new')}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          新建通用脚本
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : utils.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无通用脚本，点击右上角按钮创建
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  脚本名称
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {utils.map((util) => (
                <tr key={util.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {util.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/utils/${util.name}`)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(util.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UtilList