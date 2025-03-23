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

# 安装nginx和netcat
RUN apk add --no-cache nginx netcat-openbsd

# 创建脚本目录
RUN mkdir -p /app/server/scripts

# 复制服务端文件
COPY --from=server-builder /app/server /app/server

# 复制客户端构建文件
COPY --from=client-builder /app/client/dist /app/client/dist

# 安装serve
WORKDIR /app/client
RUN npm install -g serve

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 设置工作目录
WORKDIR /app/server

# 设置后端端口环境变量，默认为3001
ENV PORT=3001

# 暴露端口
EXPOSE 80
EXPOSE ${PORT}

# 启动脚本
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 启动服务
CMD ["/app/start.sh"]
