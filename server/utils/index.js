const fs = require('fs-extra');
const path = require('path');

// 通用脚本存储目录
const UTILS_DIR = path.join(__dirname, '../scripts/common');

// 确保通用脚本目录存在
fs.ensureDirSync(UTILS_DIR);

// 获取所有通用脚本
function getAllUtils() {
    try {
        const utils = [];
        const scriptFiles = fs.readdirSync(UTILS_DIR).filter(file => file.endsWith('.js'));

        scriptFiles.forEach(scriptFile => {
            const scriptPath = path.join(UTILS_DIR, scriptFile);
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');

            utils.push({
                name: scriptFile,
                content: scriptContent
            });
        });

        return utils;
    } catch (err) {
        console.error('获取通用脚本列表失败:', err);
        throw err;
    }
}

// 获取单个通用脚本
function getUtil(name) {
    try {
        const scriptPath = path.join(UTILS_DIR, name);
        if (!fs.existsSync(scriptPath)) {
            throw new Error('通用脚本不存在');
        }

        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        return {
            name,
            content: scriptContent
        };
    } catch (err) {
        console.error(`获取通用脚本 ${name} 失败:`, err);
        throw err;
    }
}

// 创建通用脚本
function createUtil(name, content) {
    try {
        if (!name || !content) {
            return res.status(400).json({ error: '脚本名称和内容不能为空' });
        }

        // 确保脚本名称有.js后缀
        const scriptName = name.endsWith('.js') ? name : `${name}.js`;
        const scriptPath = path.join(UTILS_DIR, scriptName);
        if (fs.existsSync(scriptPath)) {
            throw new Error('通用脚本已存在');
        }

        // 验证脚本内容
        if (!content || typeof content !== 'string') {
            throw new Error('脚本内容无效');
        }

        // 写入脚本文件
        fs.writeFileSync(scriptPath, content, 'utf8');

        return {
            scriptName,
            content
        };
    } catch (err) {
        console.error(`创建通用脚本 ${scriptName} 失败:`, err);
        throw err;
    }
}

// 更新通用脚本
function updateUtil(name, content) {
    try {
        const scriptPath = path.join(UTILS_DIR, name);
        if (!fs.existsSync(scriptPath)) {
            throw new Error('通用脚本不存在');
        }

        // 验证脚本内容
        if (!content || typeof content !== 'string') {
            throw new Error('脚本内容无效');
        }

        // 更新脚本文件
        fs.writeFileSync(scriptPath, content, 'utf8');

        return {
            name,
            content
        };
    } catch (err) {
        console.error(`更新通用脚本 ${name} 失败:`, err);
        throw err;
    }
}

// 删除通用脚本
function deleteUtil(name) {
    try {
        const scriptPath = path.join(UTILS_DIR, name);
        if (!fs.existsSync(scriptPath)) {
            throw new Error('通用脚本不存在');
        }

        // 删除脚本文件
        fs.unlinkSync(scriptPath);
    } catch (err) {
        console.error(`删除通用脚本 ${name} 失败:`, err);
        throw err;
    }
}

module.exports = {
    getAllUtils,
    getUtil,
    createUtil,
    updateUtil,
    deleteUtil,
    UTILS_DIR
};