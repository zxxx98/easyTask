#!/bin/sh

# 启动后端服务
cd /app/server
node src/index.js &

# 等待后端服务就绪
while ! nc -z localhost 3001; do
  echo "等待后端服务就绪..."
  sleep 1
done

# 启动前端服务
cd /app/client
serve -s dist -l 3000 &

# 等待前端服务就绪
while ! nc -z localhost 3000; do
  echo "等待前端服务就绪..."
  sleep 1
done

# 启动nginx
nginx

# 保持容器运行
wait