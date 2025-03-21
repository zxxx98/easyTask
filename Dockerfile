# 多阶段构建
# 第一阶段：构建客户端
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# 复制客户端依赖文件
COPY client/package.json client/package-lock.json* ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制客户端源代码
COPY client/ ./

# 设置API地址环境变量，默认为/api
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 构建客户端
RUN npm run build

# 第二阶段：构建服务端
FROM node:18-alpine AS server-builder

WORKDIR /app/server

# 复制服务端依赖文件
COPY server/package.json server/package-lock.json* ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

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

# 设置后端端口环境变量，默认为3001
ENV PORT=3001

# 暴露端口
EXPOSE ${PORT}

EXPOSE 3000

# 安装serve包
RUN npm install -g serve

# 启动服务端和客户端
CMD ["/bin/sh", "-c", "serve -s public -l 3000 & node src/index.js"]
