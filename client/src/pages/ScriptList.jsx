import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { PencilIcon, TrashIcon, PlayIcon, PauseIcon, PlusIcon } from '@heroicons/react/24/outline'

function ScriptList() {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 获取所有脚本
  const fetchScripts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/scripts')
      setScripts(response.data)
      setError(null)
    } catch (err) {
      console.error('获取脚本列表失败:', err)
      setError('获取脚本列表失败，请稍后重试')
      toast.error('获取脚本列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取脚本列表
  useEffect(() => {
    fetchScripts()
  }, [])

  // 删除脚本
  const handleDelete = async (scriptName) => {
    if (!window.confirm(`确定要删除脚本 ${scriptName} 吗？`)) {
      return
    }

    try {
      await axios.delete(`/api/scripts/${scriptName}`)
      toast.success('脚本删除成功')
      fetchScripts() // 重新获取脚本列表
    } catch (err) {
      console.error('删除脚本失败:', err)
      toast.error('删除脚本失败')
    }
  }

  // 切换脚本启用/禁用状态
  const handleToggle = async (scriptName) => {
    try {
      await axios.post(`/api/scripts/${scriptName}/toggle`)
      toast.success('脚本状态已更新')
      fetchScripts() // 重新获取脚本列表
    } catch (err) {
      console.error('更新脚本状态失败:', err)
      toast.error('更新脚本状态失败')
    }
  }

  // 手动执行脚本
  const handleRun = async (scriptName) => {
    try {
      await axios.post(`/api/scripts/${scriptName}/run`)
      toast.success('脚本执行成功')
    } catch (err) {
      console.error('执行脚本失败:', err)
      toast.error(`执行脚本失败: ${err.response?.data?.message || err.message}`)
    }
  }

  // 格式化cron表达式为更易读的文本
  const formatSchedule = (schedule) => {
    // 这里可以添加更复杂的cron表达式解析逻辑
    return schedule
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchScripts}
          className="mt-2 btn btn-primary"
        >
          重试
        </button>
      </div>
    )
  }

  if (scripts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">暂无脚本</h2>
        <p className="text-gray-500 mb-6">创建一个新脚本来开始使用EasyTask</p>
        <Link to="/scripts/new" className="btn btn-primary">
          创建新脚本
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">脚本列表</h1>
        <Link to="/scripts/new" className="btn btn-primary flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          新建脚本
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                脚本名称
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                执行计划
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scripts.map((script) => (
              <tr key={script.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{script.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatSchedule(script.schedule)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${script.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {script.enabled ? '已启用' : '已禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleRun(script.name)}
                      className="text-primary-600 hover:text-primary-900"
                      title="执行"
                    >
                      <PlayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(script.name)}
                      className={script.enabled ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                      title={script.enabled ? '禁用' : '启用'}
                    >
                      {script.enabled ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </button>
                    <Link
                      to={`/scripts/${script.name}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="编辑"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(script.name)}
                      className="text-red-600 hover:text-red-900"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ScriptList