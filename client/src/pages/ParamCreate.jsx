import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import request from '../config/request'
import { toast } from 'react-toastify'

function ParamCreate() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [valueType, setValueType] = useState('string')
  const [saving, setSaving] = useState(false)

  // 处理值类型变更
  const handleTypeChange = (type) => {
    setValueType(type)
    // 重置值
    if (type === 'boolean') {
      setValue(false)
    } else if (type === 'number') {
      setValue(0)
    } else if (type === 'json') {
      setValue('{}')
    } else {
      setValue('')
    }
  }

  // 处理值变更
  const handleValueChange = (e) => {
    if (valueType === 'boolean') {
      setValue(e.target.checked)
    } else {
      setValue(e.target.value)
    }
  }

  // 保存参数
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('请输入参数名称')
      return
    }

    try {
      setSaving(true)

      let parsedValue = value
      if (valueType === 'number') {
        parsedValue = Number(value)
        if (isNaN(parsedValue)) {
          throw new Error('请输入有效的数字')
        }
      } else if (valueType === 'json') {
        try {
          parsedValue = JSON.parse(value)
        } catch (err) {
          throw new Error('请输入有效的JSON格式')
        }
      } else if (valueType === 'boolean') {
        parsedValue = Boolean(value)
      }

      await request.post('/api/params', {
        name,
        value: parsedValue
      })

      toast.success('参数创建成功')
      navigate('/params')
    } catch (err) {
      console.error('创建全局参数失败:', err)
      toast.error(err.message || err.response?.data?.error || '创建全局参数失败')
    } finally {
      setSaving(false)
    }
  }

  // 取消创建
  const handleCancel = () => {
    navigate('/params')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">创建新参数</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="name" className="form-label">参数名称</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="my-param"
          />
        </div>

        <div className="mb-4">
          <label className="form-label">参数类型</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="string"
                checked={valueType === 'string'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">字符串</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="number"
                checked={valueType === 'number'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">数字</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="boolean"
                checked={valueType === 'boolean'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">布尔值</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="json"
                checked={valueType === 'json'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">JSON对象</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">参数值</label>
          {valueType === 'boolean' ? (
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={handleValueChange}
                className="form-checkbox"
              />
              <span className="ml-2">启用</span>
            </label>
          ) : valueType === 'json' ? (
            <textarea
              value={value}
              onChange={handleValueChange}
              className="form-textarea font-mono"
              rows={10}
              placeholder="{}"
            />
          ) : (
            <input
              type={valueType === 'number' ? 'number' : 'text'}
              value={value}
              onChange={handleValueChange}
              className="form-input"
            />
          )}
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
    </div>
  )
}

export default ParamCreate