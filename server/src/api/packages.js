const express = require('express');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// 获取已安装的包列表
router.get('/', async (req, res) =>
{
    try {
        const packageJsonPath = path.join(__dirname, '../../scripts/package.json');

        // 如果package.json不存在，创建一个新的
        if (!fs.existsSync(packageJsonPath)) {
            await fs.writeJson(packageJsonPath, {
                name: 'easytask-scripts',
                version: '1.0.0',
                description: 'EasyTask脚本依赖包',
                dependencies: {}
            });
        }

        const packageJson = await fs.readJson(packageJsonPath);
        const packages = Object.entries(packageJson.dependencies || {}).map(([name, version]) => ({
            name,
            version: version.replace('^', '')
        }));

        res.json(packages);
    } catch (error) {
        console.error('获取包列表失败:', error);
        res.status(500).json({ error: '获取包列表失败' });
    }
});

// 安装新包
router.post('/', async (req, res) =>
{
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: '包名不能为空' });
    }

    try {
        const scriptsDir = path.join(__dirname, '../../scripts');

        // 确保scripts目录存在
        await fs.ensureDir(scriptsDir);

        // 在scripts目录下执行npm install
        await new Promise((resolve, reject) =>
        {
            exec(`cd "${scriptsDir}" && pnpm install ${name} --save`, (error, stdout, stderr) =>
            {
                if (error) {
                    console.error(`安装包失败: ${error}`);
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });

        res.json({ message: '安装成功' });
    } catch (error) {
        console.error('安装包失败:', error);
        res.status(500).json({ error: '安装包失败' });
    }
});

// 卸载包
router.delete('/:name', async (req, res) =>
{
    const { name } = req.params;

    try {
        const scriptsDir = path.join(__dirname, '../../scripts');

        // 在scripts目录下执行npm uninstall
        await new Promise((resolve, reject) =>
        {
            exec(`cd "${scriptsDir}" && pnpm uninstall ${name}`, (error, stdout, stderr) =>
            {
                if (error) {
                    console.error(`卸载包失败: ${error}`);
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });

        res.json({ message: '卸载成功' });
    } catch (error) {
        console.error('卸载包失败:', error);
        res.status(500).json({ error: '卸载包失败' });
    }
});

module.exports = router;