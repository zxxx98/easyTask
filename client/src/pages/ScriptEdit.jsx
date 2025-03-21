import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'
import DebugPanel from '../components/DebugPanel'

function ScriptEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [script, setScript] = useState(null)
  const [content, setContent] = useState('')
  const [schedule, setSchedule] = useState('* * * * *')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)


  // 获取脚本详情
  useEffect(() => {
    const fetchScript = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/scripts/${id}`)
        const scriptData = response.data

        setScript(scriptData)
        setContent(extractScriptContent(scriptData.content))
        setSchedule(scriptData.schedule)
        setEnabled(scriptData.enabled)
        setError(null)
      } catch (err) {
        console.error('获取脚本详情失败:', err)
        setError('获取脚本详情失败，请稍后重试')
        toast.error('获取脚本详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchScript()
    }
  }, [id])

  // 从完整脚本内容中提取实际代码（不包括元数据）
  const extractScriptContent = (fullContent) => {
    const metadataMatch = fullContent.match(/\/\*[\s\S]*?\*\/\s*/)
    if (metadataMatch) {
      return fullContent.substring(metadataMatch[0].length)
    }
    return fullContent
  }



  // 保存脚本
  const handleSave = async () => {
    try {
      setSaving(true)

      await axios.put(`/api/scripts/${id}`, {
        content,
        schedule,
        enabled
      })

      toast.success('脚本保存成功')
      navigate('/')
    } catch (err) {
      console.error('保存脚本失败:', err)
      toast.error('保存脚本失败')
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    navigate('/')
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
          onClick={() => navigate('/')}
          className="mt-2 btn btn-primary"
        >
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">编辑脚本: {id}</h1>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="w-1/2 bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="schedule" className="form-label">执行计划 (Cron 表达式)</label>
            <input
              type="text"
              id="schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="form-input"
              placeholder="* * * * *"
            />
            <p className="mt-1 text-sm text-gray-500">
              Cron 表达式格式: 分钟 小时 日期 月份 星期 (例如: "0 9 * * 1" 表示每周一上午9点)
            </p>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              />
              <span className="ml-2">启用脚本</span>
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="form-label">脚本内容</label>
            <AceEditor
              mode="javascript"
              theme="github"
              name="content"
              value={content}
              onChange={setContent}
              fontSize={14}
              width="100%"
              height="400px"
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              className="ace-editor"
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={saving}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>

        </div>

        <div className='w-1/2'>
        <DebugPanel
          scriptId={id}
          content={content}
          schedule={schedule}
          enabled={enabled}
        />
        </div>
      </div>
    </div>
  )
}

export default ScriptEdit