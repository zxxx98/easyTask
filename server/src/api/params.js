const { Router } = require('express');
const { getAllParams, getParam, createParam, updateParam, deleteParam } = require('../../utils/params');

const router = Router();

// 获取所有全局参数
router.get('/', (req, res) =>
{
    try {
        const params = getAllParams();
        res.json(params);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 获取单个全局参数
router.get('/:name', (req, res) =>
{
    try {
        const { name } = req.params;
        const param = getParam(name);
        res.json(param);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// 创建全局参数
router.post('/', (req, res) =>
{
    try {
        const { name, value } = req.body;
        const param = createParam(name, value);
        res.status(201).json(param);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 更新全局参数
router.put('/:name', (req, res) =>
{
    try {
        const { name } = req.params;
        const { value } = req.body;
        const param = updateParam(name, value);
        res.json(param);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// 删除全局参数
router.delete('/:name', (req, res) =>
{
    try {
        const { name } = req.params;
        deleteParam(name);
        res.status(204).send();
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

module.exports = router;