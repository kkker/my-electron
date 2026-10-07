# docker-compose build --no-cache && docker-compose up -d
## 預設情況下，如果配置沒變，Compose 不會重啟容器。若想強迫所有服務都重新建立並啟動容器，可加上 --force-recreate：
# docker-compose up -d --build --force-recreate

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

# 🌟 1-2. 跨平台打包關鍵：在 Linux 容器內安裝 Wine & 檔案壓縮工具
# 這是讓 Linux 能順利打包並編譯出 Windows .exe 檔的必備元件
RUN apt-get install -y \
    wine \
    mono-complete \
    zip \
    unzip

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
