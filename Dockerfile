# 多阶段构建
# 第一阶段：构建客户端
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# 复制客户端依赖文件
COPY client/package.json client/package-lock.json* ./

# 安装依赖
RUN npm ci

# 复制客户端源代码
COPY client/ ./

# 构建客户端
RUN npm run build

# 第二阶段：构建服务端
FROM node:18-alpine AS server-builder

WORKDIR /app/server

# 复制服务端依赖文件
COPY server/package.json server/package-lock.json* ./

# 安装依赖
RUN npm ci

# 复制服务端源代码
COPY server/ ./

# 第三阶段：最终镜像
FROM node:18-alpine

WORKDIR /app

# 创建脚本目录
RUN mkdir -p /app/server/scripts

# 复制服务端文件
COPY --from=server-builder /app/server /app/server

# 复制客户端构建文件
COPY --from=client-builder /app/client/dist /app/server/public

# 设置工作目录
WORKDIR /app/server

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "src/index.js"]