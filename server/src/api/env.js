/*
 * @Description: 
 * @Author: zhouxin
 * @Date: 2025-03-25 23:24:30
 * @LastEditors: 
 * @LastEditTime: 2025-03-26 21:12:05
 * @FilePath: \easyTask\server\src\api\params.js
 */
const { Router } = require('express');
const { getEnv, setEnv } = require('../../utils/env');
const fs = require('fs-extra');
const path = require('path');

const router = Router();
const PARAMS_FILE = path.join(__dirname, '../../scripts/params/.env');

// 获取环境变量
router.get('/', (req, res) =>
{
    try {
        const params = getEnv();
        res.json({ params });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 更新环境变量
router.post('/update', (req, res) =>
{
    try {
        const { params } = req.body;
        setEnv(params);
        res.json({ message: '环境变量已更新', success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;