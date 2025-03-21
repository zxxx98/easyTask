const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { getAllUtils, getUtil, createUtil, updateUtil, deleteUtil } = require('../../utils');

// 获取所有通用脚本
router.get('/', (req, res) => {
  try {
    const utils = getAllUtils();
    res.json(utils);
  } catch (err) {
    console.error('获取通用脚本列表失败:', err);
    res.status(500).json({ error: '获取通用脚本列表失败' });
  }
});

// 获取单个通用脚本
router.get('/:name', (req, res) => {
  try {
    const util = getUtil(req.params.name);
    res.json(util);
  } catch (err) {
    console.error('获取通用脚本失败:', err);
    res.status(404).json({ error: '通用脚本不存在' });
  }
});

// 创建通用脚本
router.post('/', (req, res) => {
  try {
    const { name, content } = req.body;
    if (!name || !content) {
      return res.status(400).json({ error: '名称和内容不能为空' });
    }
    const util = createUtil(name, content);
    res.json(util);
  } catch (err) {
    console.error('创建通用脚本失败:', err);
    res.status(500).json({ error: err.message || '创建通用脚本失败' });
  }
});

// 更新通用脚本
router.put('/:name', (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: '内容不能为空' });
    }
    const util = updateUtil(req.params.name, content);
    res.json(util);
  } catch (err) {
    console.error('更新通用脚本失败:', err);
    res.status(500).json({ error: err.message || '更新通用脚本失败' });
  }
});

// 删除通用脚本
router.delete('/:name', (req, res) => {
  try {
    deleteUtil(req.params.name);
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error('删除通用脚本失败:', err);
    res.status(500).json({ error: err.message || '删除通用脚本失败' });
  }
});

module.exports = router;