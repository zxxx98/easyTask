const fs = require('fs-extra');
const path = require('path');

// 全局参数存储目录
const PARAMS_DIR = path.join(__dirname, '../scripts/params');

// 确保全局参数目录存在
fs.ensureDirSync(PARAMS_DIR);

// 参数文件路径
const PARAMS_FILE = path.join(PARAMS_DIR, 'global_params.json');

// 确保参数文件存在
if (!fs.existsSync(PARAMS_FILE)) {
    fs.writeJsonSync(PARAMS_FILE, {}, { spaces: 2 });
}

// 获取所有全局参数
function getAllParams()
{
    try {
        return fs.readJsonSync(PARAMS_FILE, { throws: false }) || {};
    } catch (err) {
        console.error('获取全局参数列表失败:', err);
        return {};
    }
}

// 获取单个全局参数
function getParam(name)
{
    try {
        const params = getAllParams();
        if (!params[name]) {
            throw new Error('全局参数不存在');
        }
        return {
            name,
            value: params[name]
        };
    } catch (err) {
        console.error(`获取全局参数 ${name} 失败:`, err);
        throw err;
    }
}

// 创建全局参数
function createParam(name, value)
{
    try {
        if (!name) {
            throw new Error('参数名称不能为空');
        }

        const params = getAllParams();
        if (params[name]) {
            throw new Error('全局参数已存在');
        }

        // 更新参数文件
        params[name] = value;
        fs.writeJsonSync(PARAMS_FILE, params, { spaces: 2 });

        return {
            name,
            value
        };
    } catch (err) {
        console.error(`创建全局参数 ${name} 失败:`, err);
        throw err;
    }
}

// 更新全局参数
function updateParam(name, value)
{
    try {
        const params = getAllParams();
        if (!params[name]) {
            throw new Error('全局参数不存在');
        }

        // 更新参数文件
        params[name] = value;
        fs.writeJsonSync(PARAMS_FILE, params, { spaces: 2 });

        return {
            name,
            value
        };
    } catch (err) {
        console.error(`更新全局参数 ${name} 失败:`, err);
        throw err;
    }
}

// 删除全局参数
function deleteParam(name)
{
    try {
        const params = getAllParams();
        if (!params[name]) {
            throw new Error('全局参数不存在');
        }

        // 删除参数
        delete params[name];
        fs.writeJsonSync(PARAMS_FILE, params, { spaces: 2 });
    } catch (err) {
        console.error(`删除全局参数 ${name} 失败:`, err);
        throw err;
    }
}

module.exports = {
    getAllParams,
    getParam,
    createParam,
    updateParam,
    deleteParam,
    PARAMS_DIR
};