# 基礎映像檔：使用 LinuxServer.io 官方的 Ubuntu-MATE 桌面
FROM lscr.io/linuxserver/webtop:ubuntu-mate


# 1. 自動安裝適配 Ubuntu 26.04 新系統的 Electron GUI 依賴套件（已解決 t64 套件名稱問題）
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0t64 \
    libatk-bridge2.0-0t64 \
    libcups2t64 \
    libdrm2 \
    libgtk-3-0t64 \
    libgbm1 \
    libasound2t64 \
    libsecret-1-0 \
    alsa-utils

#    && rm -rf /var/lib/apt/lists/*

# 2. 安裝 Node.js 20 官方 LTS 版本與 npm
RUN apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
# v20.20.2
RUN curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
RUN apt-get install -y nodejs
# RUN apt install npm # 除了 Node.js 之外，此命令還將安裝 NPM 以及其他依賴套件。
RUN npm install -g npm@10.8.2 


# 設定預設工作目錄（進去網頁終端機時會在這裡）
WORKDIR /config/workspace

## local visit the URI, http://localhost:6800/
