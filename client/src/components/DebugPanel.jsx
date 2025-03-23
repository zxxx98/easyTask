import React, { useState, useRef, useEffect } from 'react'
import request from '../config/request'
import { toast } from 'react-toastify'

function DebugPanel({ scriptId, content, schedule, enabled, isNewScript = false }) {
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)
  const wsRef = useRef(null)
  const logsEndRef = useRef(null)

  // 自动滚动到日志底部
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  // 运行脚本
  const handleRun = async () => {
    try {
      setRunning(true)
      setLogs([])

      // 关闭之前的WebSocket连接
      if (wsRef.current) {
        wsRef.current.close()
      }

      // 创建新的WebSocket连接
      const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}${window.location.host === 'localhost:3000' ? '//localhost:3001' : `//${window.location.host}`}/api/scripts/${scriptId}/logs`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        setLogs(prev => [...prev, event.data])
      }

      ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        toast.error('日志连接失败')
      }

      ws.onclose = () => {
        setRunning(false)
      }

      // 如果是新脚本，需要先临时保存
      if (isNewScript) {
        await request.post('/api/scripts/temp', {
          content,
          schedule,
          enabled
        })
      } else {
        // 已有脚本，临时保存当前编辑的内容
        await request.put(`/api/scripts/${scriptId}/temp`, {
          content,
          schedule,
          enabled
        })
      }

      // 发送运行请求
      await request.post(`/api/scripts/${scriptId}/run`)
      toast.info('脚本运行完成')
      handleStop() // 执行成功后停止运行
    } catch (err) {
      console.error('运行脚本失败:', err)
      toast.error('运行脚本失败')
      setRunning(false)
    }
  }

  // 停止运行
  const handleStop = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    setRunning(false)
  }

  return (
    <div className="bg-gray-900 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-200">运行日志</h2>
        <div className="space-x-2">
          <button
            onClick={handleRun}
            disabled={running}
            className="btn btn-primary"
          >
            {running ? '运行中...' : '运行'}
          </button>
          {running && (
            <button
              onClick={handleStop}
              className="btn btn-secondary"
            >
              停止
            </button>
          )}
        </div>
      </div>

      <div className="h-[500px] bg-gray-800 rounded p-4 font-mono text-sm overflow-y-auto text-gray-300 border border-gray-700">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center mt-4">
            暂无日志输出
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap mb-1 border-b border-gray-700 pb-1">{log}</div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}

export default DebugPanel