/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-25 23:13:45
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-26 22:07:32
 * @FilePath: \easyTask\server\utils\env.js
 */
const fs = require('fs-extra');
const path = require('path');
const dotenv = require('dotenv');

// 全局参数存储目录
const PARAMS_DIR = path.join(__dirname, '../scripts/params');

// 确保全局参数目录存在
fs.ensureDirSync(PARAMS_DIR);

// 参数文件路径
const PARAMS_FILE = path.join(PARAMS_DIR, '.env');

// 确保参数文件存在
if (!fs.existsSync(PARAMS_FILE)) {
    fs.writeFileSync(PARAMS_FILE, '# 全局参数配置文件\n# 每行格式：KEY=VALUE\n# 只支持字符串类型的值\n', 'utf8');
}

// 加载.env到process.env
function loadEnv()
{
    const output = dotenv.config({ path: PARAMS_FILE });
    if (output.error) {
        throw new Error(`加载.env文件失败：${output.error}`);
    } else {
        console.log('加载.env文件成功');
    }
}

//返回文件内容
function getEnv()
{
    return fs.readFileSync(PARAMS_FILE, 'utf8');
}

//覆盖文件内容
function setEnv(content)
{
    fs.writeFileSync(PARAMS_FILE, content, 'utf8');
    loadEnv();
}

loadEnv();

module.exports = {
    PARAMS_DIR,
    PARAMS_FILE,
    getEnv,
    setEnv,
    loadEnv
};