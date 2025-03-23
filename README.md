<!--
 * @Description:
 * @Author: zhouxin
 * @Date: 2025-03-21 23:34:02
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2025-03-23 11:19:44
 * @FilePath: \easyTask\README.md
-->

# EasyTask

一个基于 Node.js 和 React 的定时任务管理系统，支持在 Web 界面上管理和监控 JavaScript 脚本的定时执行。

## 主要功能

- 📝 在线编辑 JavaScript 脚本
- ⏰ 灵活的 Cron 表达式定时设置
- 📊 实时监控脚本执行日志
- 🔄 支持启用/禁用脚本
- 📦 内置常用工具函数
- 🛠️ 支持 npm 包管理

## 技术栈

### 前端

- React 18
- Vite
- TailwindCSS
- React Router
- Ace Editor
- Axios

### 后端

- Node.js
- Express
- node-cron
- WebSocket
- VM2

## 部署方法

### Docker 单容器部署

```bash
# 拉取镜像
docker pull zhouxin98/easytask:latest

# 运行容器
docker run -d \
  --name easytask \
  -p 80:80 \
  -p 3001:3001 \
  -v /path/to/scripts:/app/server/scripts \
  -e PORT=3001 \
  -e VITE_HOST=0.0.0.0 \
  zhouxin98/easytask:latest
```

### Docker Compose 部署

创建`docker-compose.yml`文件：

```yaml
version: "3"

services:
  easytask:
    image: zhouxin98/easytask:latest
    container_name: easytask
    ports:
      - "80:80"
      - "${PORT:-3001}:3001"
    volumes:
      - /path/to/scripts:/app/server/scripts
    environment:
      - PORT=3001
      - VITE_HOST=0.0.0.0
    restart: unless-stopped
```

运行：

```bash
docker-compose up -d
```

## 环境变量

| 变量名    | 说明         | 默认值  |
| --------- | ------------ | ------- |
| PORT      | 后端服务端口 | 3001    |
| VITE_HOST | 前端服务主机 | 0.0.0.0 |

## 访问应用

部署完成后：

- 通过 `http://localhost` 或 `http://your-server-ip` 访问应用界面
- API 服务通过 `http://localhost:3001` 或 `http://your-server-ip:3001` 访问

## 数据持久化

脚本文件存储在容器的 `/app/server/scripts` 目录中。建议通过挂载卷的方式将此目录映射到主机，以实现数据持久化。

## 注意事项

1. 确保挂载目录具有适当的读写权限
2. 建议使用具体的版本标签而不是 latest 标签来部署
3. 容器同时暴露了 80 端口（用于 Web 界面访问）和 3001 端口（用于 API 服务）
4. 设置 VITE_HOST=0.0.0.0 可以允许局域网内其他设备访问服务
