import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'
import DebugPanel from '../components/DebugPanel'

function UtilEdit() {
  const navigate = useNavigate()
  const { name } = useParams()

  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // 加载脚本内容
  useEffect(() => {
    loadUtil()
  }, [name])

  const loadUtil = async () => {
    try {
      const response = await axios.get(`/api/utils/${name}`)
      setContent(response.data.content)
    } catch (err) {
      console.error('加载通用脚本失败:', err)
      toast.error('加载通用脚本失败')
      navigate('/utils')
    } finally {
      setLoading(false)
    }
  }

  // 保存脚本
  const handleSave = async () => {
    try {
      setSaving(true)

      await axios.put(`/api/utils/${name}`, {
        content
      })

      toast.success('保存成功')
      navigate('/utils')
    } catch (err) {
      console.error('保存通用脚本失败:', err)
      toast.error(err.response?.data?.error || '保存通用脚本失败')
    } finally {
      setSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    navigate('/utils')
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">编辑通用脚本 - {name}</h1>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="flex w-full gap-6">
          <div className="w-1/2 bg-white shadow-md rounded-lg p-6">
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

          <div className="w-1/2">
            <DebugPanel
              scriptId={name}
              content={content}
              isUtil={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UtilEdit