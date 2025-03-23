import React, { useState, useEffect } from 'react';
import request from '../config/request';
import { toast } from 'react-toastify';

function PackageManager() {
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取已安装的包列表
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await request.get('/api/packages');
      setPackages(response.data);
    } catch (error) {
      toast.error('获取包列表失败');
    }
  };

  // 安装新包
  const installPackage = async (e) => {
    e.preventDefault();
    if (!newPackage) return;

    setLoading(true);
    try {
      await request.post('/api/packages', { name: newPackage });
      toast.success(`成功安装包：${newPackage}`);
      setNewPackage('');
      fetchPackages();
    } catch (error) {
      toast.error(error.response?.data?.error || '安装包失败');
    } finally {
      setLoading(false);
    }
  };

  // 卸载包
  const uninstallPackage = async (packageName) => {
    if (!confirm(`确定要卸载 ${packageName} 吗？`)) return;

    try {
      await request.delete(`/api/packages/${packageName}`);
      toast.success(`成功卸载包：${packageName}`);
      fetchPackages();
    } catch (error) {
      toast.error(error.response?.data?.error || '卸载包失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">NPM包管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理可在脚本中使用的NPM包，安装后可直接在脚本中import使用
          </p>
        </div>
      </div>

      {/* 安装新包表单 */}
      <form onSubmit={installPackage} className="flex gap-x-4">
        <input
          type="text"
          value={newPackage}
          onChange={(e) => setNewPackage(e.target.value)}
          placeholder="输入包名，如：lodash"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? '安装中...' : '安装'}
        </button>
      </form>

      {/* 已安装包列表 */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      包名
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      版本
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {packages.map((pkg) => (
                    <tr key={pkg.name}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {pkg.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pkg.version}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => uninstallPackage(pkg.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          卸载
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageManager;