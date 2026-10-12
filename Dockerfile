# docker-compose build --no-cache && docker-compose up -d
## 預設情況下，如果配置沒變，Compose 不會重啟容器。若想強迫所有服務都重新建立並啟動容器，可加上 --force-recreate：
# docker-compose up -d --build --force-recreate
## 進入容器
# docker exec -u abc mac_electron_vnc bash

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
# v22.x（Capacitor 8 需要 Node >= 22）
RUN curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
RUN apt-get install -y nodejs
# RUN apt install npm # 除了 Node.js 之外，此命令還將安裝 NPM 以及其他依賴套件。
RUN npm install -g npm@10.8.2

# 3. Android 建置環境（Capacitor 8 需要：JDK 21、compileSdk 36；AGP 8.13 預設 build-tools 35.0.0）
# 容器只負責「建置 APK」；安裝到手機改由主機的 adb 透過 USB 處理（Docker Desktop for Mac 無法把 USB 轉接進容器）
# SDK 放在 /opt 而非 /config：/config 是使用者家目錄，放映像檔內建工具容易與執行期資料混在一起
# 最後 chown：讓容器使用者 abc 建置時，Gradle 可自動補裝缺少的 SDK 元件
RUN apt-get install -y openjdk-21-jdk-headless
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin"
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
 && curl -sL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip \
 && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
 && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
 && rm /tmp/cmdline-tools.zip \
 && yes | sdkmanager --licenses > /dev/null \
 && sdkmanager "platforms;android-36" "build-tools;35.0.0" \
 && chown -R 1000:1000 ${ANDROID_HOME}

# 映像檔建置以 root 執行，而容器家目錄是 /config：npm 與 Android CLI 會在 /config 留下 root 擁有的快取目錄
# 改回容器使用者 abc（UID 1000），否則執行期 npm install、sdkmanager、Gradle 產生 debug.keystore 會權限不足
RUN chown -R 1000:1000 /config/.npm /config/.android


# 設定預設工作目錄（進去網頁終端機時會在這裡）
WORKDIR /config/workspace

## local visit the URI, http://localhost:6800/

## 以後更新手機上的 App，流程是：
#
# 1. 在容器內執行 npm run android:build。
# 2. 在主機的終端機執行 adb install -r android/app/build/outputs/apk/debug/app-debug.apk，裝到手機。

## TODO: 正式上架前，還要記得把 appId 從 com.example.myapp 換成正式名稱。
