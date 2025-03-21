import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'
import DebugPanel from '../components/DebugPanel'

function UtilCreate() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [content, setContent] = useState('// 在这里编写您的JavaScript代码\n\nconsole.log("Hello, EasyTask!");')
  const [saving, setSaving] = useState(false)

  // 保存脚本
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('请输入脚本名称')
      return
    }

    try {
      setSaving(true)

      await axios.post('/api/utils', {
        name,
        content
      })

      toast.success('通用脚本创建成功')
      navigate('/utils')
    } catch (err) {
      console.error('创建通用脚本失败:', err)
      toast.error(err.response?.data?.error || '创建通用脚本失败')
    } finally {
      setSaving(false)
    }
  }

  // 取消创建
  const handleCancel = () => {
    navigate('/utils')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">创建新通用脚本</h1>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="flex w-full gap-6">
          <div className="w-1/2 bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="name" className="form-label">脚本名称</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="my-util.js"
              />
              <p className="mt-1 text-sm text-gray-500">
                脚本名称将作为文件名保存，如果不包含.js后缀，系统会自动添加
              </p>
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

          <div className="w-1/2">
            <DebugPanel
              scriptId="temp"
              content={content}
              isNewScript={true}
              isUtil={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UtilCreate