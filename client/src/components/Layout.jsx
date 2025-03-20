/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-20 22:56:19
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-20 23:16:33
 * @FilePath: \easyTask\client\src\components\Layout.jsx
 */
import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { PlusIcon, ClockIcon, CubeIcon } from '@heroicons/react/24/outline'

function Layout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EasyTask</span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                脚本列表
              </Link>
              <Link 
                to="/packages"
                className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/packages' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <CubeIcon className="inline-block h-4 w-4 mr-1" />
                包管理
              </Link>
              <Link 
                to="/scripts/new"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                新建脚本
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* 主要内容区域 */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            EasyTask - 定时脚本管理系统 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout