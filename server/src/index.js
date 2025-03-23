const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const { NodeVM } = require('vm2');
const { WebSocketServer } = require('ws');
const http = require('http');
const babel = require('@babel/core');
const packagesRouter = require('./api/packages');
const utilsRouter = require('./api/utils');
const { UTILS_DIR } = require('../utils');

// 初始化应用
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// 注册包管理API路由
app.use('/api/packages', packagesRouter);

// 注册通用脚本API路由
app.use('/api/utils', utilsRouter);

// 确保脚本目录存在
const SCRIPTS_DIR = path.join(__dirname, '../scripts');
fs.ensureDirSync(SCRIPTS_DIR);

// 存储所有运行中的任务和临时保存的脚本
const runningTasks = {};
const tempScripts = {};

// 加载并启动所有脚本
function loadAndStartAllScripts()
{
    try {
        const scripts = fs.readdirSync(SCRIPTS_DIR).filter(file => file.endsWith('.js'));

        scripts.forEach(scriptFile =>
        {
            const scriptPath = path.join(SCRIPTS_DIR, scriptFile);
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');

            // 尝试解析脚本的元数据（假设脚本文件开头有JSON注释）
            let metadata = { schedule: '* * * * *', enabled: true, name: scriptFile };
            try {
                const metadataMatch = scriptContent.match(/\/\*\s*(\{[\s\S]*?\})\s*\*\//);
                if (metadataMatch && metadataMatch[1]) {
                    const parsedMetadata = JSON.parse(metadataMatch[1]);
                    metadata = { ...metadata, ...parsedMetadata };
                }
            } catch (err) {
                console.error(`解析脚本 ${scriptFile} 的元数据时出错:`, err);
            }

            // 如果脚本启用，则启动它
            if (metadata.enabled) {
                startScript(scriptFile, metadata.schedule, scriptContent);
            }
        });

        console.log(`已加载 ${scripts.length} 个脚本`);
    } catch (err) {
        console.error('加载脚本时出错:', err);
    }
}

// 启动一个脚本
function startScript(scriptName, schedule, scriptContent)
{
    try {
        // 如果任务已经在运行，先停止它
        if (runningTasks[scriptName]) {
            runningTasks[scriptName].stop();
            delete runningTasks[scriptName];
        }

        // 创建新的定时任务
        const task = cron.schedule(schedule, () =>
        {
            console.log(`执行脚本: ${scriptName}`);
            try {
                // 创建自定义console对象，将输出重定向到WebSocket
                const customConsole = {
                    log: (...args) =>
                    {
                        const message = args.map(arg =>
                            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                        ).join(' ');
                        wss.clients.forEach(client =>
                        {
                            if (client.scriptName === scriptName) {
                                client.send(message);
                            }
                        });
                    },
                    error: (...args) =>
                    {
                        const message = args.map(arg =>
                            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                        ).join(' ');
                        wss.clients.forEach(client =>
                        {
                            if (client.scriptName === scriptName) {
                                client.send(`[ERROR] ${message}`);
                            }
                        });
                    }
                };
                const rootPath = path.join(__dirname, '../scripts');
                const vm = new NodeVM({
                    timeout: 5000, // 5秒超时
                    console: 'redirect',
                    compiler: (code, filename) =>
                    {
                        // 使用 Babel 转译代码（支持 import/export）
                        return babel.transform(code, {
                            filename,
                            presets: [
                                ['@babel/preset-env', {
                                    modules: 'commonjs', // 强制转为 CommonJS
                                    targets: { node: 'current' } // 兼容当前 Node.js 版本
                                }]
                            ],
                            sourceType: 'module' // 确保 Babel 以 ES 模块解析
                        }).code;
                    },
                    require: {
                        builtin: ['*'],
                        external: true,
                        context: 'host',
                        root: rootPath,
                        resolve: (moduleName) => path.resolve(rootPath, 'node_modules', moduleName)
                    }
                });
                vm.on('console.log', (...message) =>
                {
                    customConsole.log(message);
                });

                vm.on('console.error', (...message) =>
                {
                    customConsole.error(message);
                });

                // 执行脚本
                vm.run(scriptContent);
            } catch (err) {
                console.error(`执行脚本 ${scriptName} 时出错:`, err);
            }
        });

        // 存储任务引用
        runningTasks[scriptName] = task;
        console.log(`脚本 ${scriptName} 已启动，计划: ${schedule}`);
        return true;
    } catch (err) {
        console.error(`启动脚本 ${scriptName} 时出错:`, err);
        return false;
    }
}

// 获取脚本路径
function getScriptPath(scriptName)
{
    let scriptPath = path.join(SCRIPTS_DIR, scriptName);
    if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(UTILS_DIR, scriptName);
        if (!fs.existsSync(scriptPath)) {
            return null;
        }
    }
    return scriptPath;
}

// API路由

// 获取所有脚本
app.get('/api/scripts', (req, res) =>
{
    try {
        const scripts = [];
        const scriptFiles = fs.readdirSync(SCRIPTS_DIR).filter(file => file.endsWith('.js'));

        scriptFiles.forEach(scriptFile =>
        {
            const scriptPath = path.join(SCRIPTS_DIR, scriptFile);
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');

            // 解析脚本元数据
            let metadata = { schedule: '* * * * *', enabled: true, name: scriptFile };
            try {
                const metadataMatch = scriptContent.match(/\/\*\s*(\{[\s\S]*?\})\s*\*\//)
                if (metadataMatch && metadataMatch[1]) {
                    const parsedMetadata = JSON.parse(metadataMatch[1]);
                    metadata = { ...metadata, ...parsedMetadata };
                }
            } catch (err) {
                console.error(`解析脚本 ${scriptFile} 的元数据时出错:`, err);
            }

            // 添加运行状态
            metadata.running = !!runningTasks[scriptFile];
            metadata.content = scriptContent;

            scripts.push(metadata);
        });

        res.json(scripts);
    } catch (err) {
        console.error('获取脚本列表时出错:', err);
        res.status(500).json({ error: '获取脚本列表失败' });
    }
});

// 获取单个脚本
app.get('/api/scripts/:name', (req, res) =>
{
    try {
        const scriptName = req.params.name;
        const scriptPath = getScriptPath(scriptName);
        if (!scriptPath) {
            return res.status(404).json({ error: '脚本不存在' });
        }

        const scriptContent = fs.readFileSync(scriptPath, 'utf8');

        // 解析脚本元数据
        let metadata = { schedule: '* * * * *', enabled: true, name: scriptName };
        try {
            const metadataMatch = scriptContent.match(/\/\*\s*(\{[\s\S]*?\})\s*\*\//)
            if (metadataMatch && metadataMatch[1]) {
                const parsedMetadata = JSON.parse(metadataMatch[1]);
                metadata = { ...metadata, ...parsedMetadata };
            }
        } catch (err) {
            console.error(`解析脚本 ${scriptName} 的元数据时出错:`, err);
        }

        // 添加运行状态和内容
        metadata.running = !!runningTasks[scriptName];
        metadata.content = scriptContent;

        res.json(metadata);
    } catch (err) {
        console.error('获取脚本时出错:', err);
        res.status(500).json({ error: '获取脚本失败' });
    }
});

// 创建新脚本
app.post('/api/scripts', (req, res) =>
{
    try {
        const { name, content, schedule, enabled } = req.body;

        if (!name || !content) {
            return res.status(400).json({ error: '脚本名称和内容不能为空' });
        }

        // 确保脚本名称有.js后缀
        const scriptName = name.endsWith('.js') ? name : `${name}.js`;
        const scriptPath = path.join(SCRIPTS_DIR, scriptName);

        // 检查脚本是否已存在
        if (fs.existsSync(scriptPath)) {
            return res.status(400).json({ error: '脚本已存在' });
        }

        // 构建脚本内容，包括元数据
        const metadata = JSON.stringify({ schedule, enabled, name: scriptName }, null, 2);
        const scriptContent = `/*\n${metadata}\n*/\n\n${content}`;

        // 写入脚本文件
        fs.writeFileSync(scriptPath, scriptContent);

        // 如果启用，则启动脚本
        if (enabled) {
            startScript(scriptName, schedule, content);
        }

        res.status(201).json({ name: scriptName, schedule, enabled });
    } catch (err) {
        console.error('创建脚本时出错:', err);
        res.status(500).json({ error: '创建脚本失败' });
    }
});

// 更新脚本
app.put('/api/scripts/:name', (req, res) =>
{
    try {
        const scriptName = req.params.name;
        const { content, schedule, enabled } = req.body;
        const scriptPath = path.join(SCRIPTS_DIR, scriptName);

        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: '脚本不存在' });
        }

        // 构建新的脚本内容，包括元数据
        const metadata = JSON.stringify({ schedule, enabled, name: scriptName }, null, 2);
        const scriptContent = `/*\n${metadata}\n*/\n\n${content}`;

        // 写入脚本文件
        fs.writeFileSync(scriptPath, scriptContent);

        // 如果任务正在运行，停止它
        if (runningTasks[scriptName]) {
            runningTasks[scriptName].stop();
            delete runningTasks[scriptName];
        }

        // 如果启用，则启动脚本
        if (enabled) {
            startScript(scriptName, schedule, content);
        }

        res.json({ name: scriptName, schedule, enabled });
    } catch (err) {
        console.error('更新脚本时出错:', err);
        res.status(500).json({ error: '更新脚本失败' });
    }
});

// 删除脚本
app.delete('/api/scripts/:name', (req, res) =>
{
    try {
        const scriptName = req.params.name;
        let scriptPath = path.join(SCRIPTS_DIR, scriptName);
        if (!fs.existsSync(scriptPath)) {
            // 如果是通用脚本，则尝试从UTILS_DIR中删除
            scriptPath = path.join(UTILS_DIR, scriptName);
            if (!fs.existsSync(scriptPath)) {
                return res.status(404).json({ error: '脚本不存在' });
            }
        }

        // 如果任务正在运行，停止它
        if (runningTasks[scriptName]) {
            runningTasks[scriptName].stop();
            delete runningTasks[scriptName];
        }

        // 删除脚本文件
        fs.unlinkSync(scriptPath);

        res.json({ success: true });
    } catch (err) {
        console.error('删除脚本时出错:', err);
        res.status(500).json({ error: '删除脚本失败' });
    }
});

// 暂停/恢复脚本
app.post('/api/scripts/:name/toggle', (req, res) =>
{
    try {
        const scriptName = req.params.name;
        const scriptPath = getScriptPath(scriptName);
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: '脚本不存在' });
        }

        const scriptContent = fs.readFileSync(scriptPath, 'utf8');

        // 解析脚本元数据
        let metadata = { schedule: '* * * * *', enabled: true, name: scriptName };
        try {
            const metadataMatch = scriptContent.match(/\/\*\s*(\{[\s\S]*?\})\s*\*\//)
            if (metadataMatch && metadataMatch[1]) {
                const parsedMetadata = JSON.parse(metadataMatch[1]);
                metadata = { ...metadata, ...parsedMetadata };
            }
        } catch (err) {
            console.error(`解析脚本 ${scriptName} 的元数据时出错:`, err);
        }

        // 切换启用状态
        const newEnabled = !metadata.enabled;
        metadata.enabled = newEnabled;

        // 提取脚本内容（不包括元数据）
        let scriptCodeContent = scriptContent;
        const metadataMatch = scriptContent.match(/\/\*[\s\S]*?\*\/\s*/);
        if (metadataMatch) {
            scriptCodeContent = scriptContent.substring(metadataMatch[0].length);
        }

        // 构建新的脚本内容
        const newMetadata = JSON.stringify(metadata, null, 2);
        const newScriptContent = `/*\n${newMetadata}\n*/\n\n${scriptCodeContent}`;

        // 写入脚本文件
        fs.writeFileSync(scriptPath, newScriptContent);

        // 根据新状态启动或停止脚本
        if (newEnabled) {
            startScript(scriptName, metadata.schedule, scriptCodeContent);
        } else if (runningTasks[scriptName]) {
            runningTasks[scriptName].stop();
            delete runningTasks[scriptName];
        }

        res.json({ name: scriptName, enabled: newEnabled });
    } catch (err) {
        console.error('切换脚本状态时出错:', err);
        res.status(500).json({ error: '切换脚本状态失败' });
    }
});

// 临时保存脚本
app.put('/api/scripts/:name/temp', (req, res) =>
{
    try {
        const scriptName = req.params.name;
        const { content, schedule, enabled } = req.body;

        // 保存到临时存储
        tempScripts[scriptName] = { content, schedule, enabled };

        res.json({ success: true });
    } catch (err) {
        console.error('临时保存脚本失败:', err);
        res.status(500).json({ error: '临时保存脚本失败' });
    }
});

// 手动执行脚本
app.post('/api/scripts/:name/run', async (req, res) =>
{
    try {
        const scriptName = req.params.name;
        const scriptPath = getScriptPath(scriptName);
        if (!fs.existsSync(scriptPath)) {
            return res.status(404).json({ error: '脚本不存在' });
        }

        // 优先使用临时保存的内容
        let scriptContent = tempScripts[scriptName]?.content;
        if (!scriptContent) {
            scriptContent = fs.readFileSync(scriptPath, 'utf8');
        }

        // 执行脚本
        try {
            // 创建自定义console对象，将输出重定向到WebSocket
            const customConsole = {
                log: (...args) =>
                {
                    const message = args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' ');
                    wss.clients.forEach(client =>
                    {
                        if (client.scriptName === scriptName) {
                            client.send(message);
                        }
                    });
                },
                error: (...args) =>
                {
                    const message = args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' ');
                    wss.clients.forEach(client =>
                    {
                        if (client.scriptName === scriptName) {
                            client.send(`[ERROR] ${message}`);
                        }
                    });
                }
            };
            const rootPath = path.join(__dirname, '../scripts');
            const vm = new NodeVM({
                timeout: 5000, // 5秒超时
                console: 'redirect',
                compiler: (code, filename) =>
                {
                    // 使用 Babel 转译代码（支持 import/export）
                    return babel.transform(code, {
                        filename,
                        presets: [
                            ['@babel/preset-env', {
                                modules: 'commonjs', // 强制转为 CommonJS
                                targets: { node: 'current' } // 兼容当前 Node.js 版本
                            }]
                        ],
                        sourceType: 'module' // 确保 Babel 以 ES 模块解析
                    }).code;
                },
                require: {
                    builtin: ['*'],
                    external: true,
                    context: 'host',
                    root: rootPath,
                    resolve: (moduleName) => path.resolve(rootPath, 'node_modules', moduleName)
                }
            });
            vm.on('console.log', (...message) =>
            {
                console.log(message);
                customConsole.log(message);
            });

            vm.on('console.error', (...message) =>
            {
                customConsole.error(message);
            });

            // 执行脚本
            await vm.run(scriptContent);

            res.json({ success: true, message: '脚本执行成功' });
        } catch (err) {
            console.error(`执行脚本 ${scriptName} 时出错:`, err);
            wss.clients.forEach(client =>
            {
                if (client.scriptName === scriptName) {
                    client.send(`[ERROR] 执行脚本失败: ${err.message}`);
                }
            });
            res.status(500).json({ error: '脚本执行失败', message: err.message });
        }
    } catch (err) {
        console.error('执行脚本时出错:', err);
        res.status(500).json({ error: '执行脚本失败' });
    }
});

// 获取脚本执行日志（这是一个额外功能）
app.get('/api/logs', (req, res) =>
{
    // 在实际应用中，这里应该实现日志存储和检索功能
    // 简化版本，返回空数组
    res.json([]);
});

// WebSocket连接处理
wss.on('connection', (ws, req) =>
{
    const matches = req.url.match(/\/api\/scripts\/([^\/]+)\/logs/);
    const scriptName = matches ? matches[1] : '';
    ws.scriptName = scriptName;
    console.log(`WebSocket连接已建立: ${scriptName}`);

    ws.on('close', () =>
    {
        console.log(`WebSocket连接已关闭: ${scriptName}`);
    });
});

// 启动服务器
server.listen(PORT, () =>
{
    console.log(`服务器运行在端口 ${PORT}`);

    // 启动所有已启用的脚本
    loadAndStartAllScripts();
});