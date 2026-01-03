# Bestows Music

<p align="center">
  <img src="build/icon.png" width="128" height="128" alt="Bestows Music Logo">
</p>

<p align="center">
  一款基于 <strong>Electron</strong> + <strong>Vue 3</strong> 构建的现代化网易云音乐第三方客户端。
  <br>
  拥有沉浸式桌面歌词、高度自定义的皮肤系统以及流畅的 Linux/Windows/macOS 跨平台体验。
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#本地运行">本地运行</a> •
  <a href="#打包构建">打包构建</a> •
  <a href="#致谢">致谢</a>
</p>

---

## ✨ 功能特性

### 🎵 核心体验
* **全功能播放器**：支持单曲/列表循环、随机播放、音量控制、进度条拖拽。
* **网易云账号互通**：支持扫码登录，同步你的歌单、收藏、云盘音乐和最近播放记录。
* **听歌打卡**：自动同步听歌记录到网易云，升级等级不用愁。

### 🖥️ 沉浸式桌面歌词
* **酷炫动画**：双层文字渲染，支持逐字渐变（Karaoke 效果）动画。
* **完全交互**：支持锁定/解锁（鼠标穿透）、字体大小调节、颜色自定义、快进/快退微调。
* **双向控制**：在歌词窗口即可控制切歌、暂停、关闭。

### 🎨 个性化 & 界面
* **自定义皮肤**：支持上传本地图片作为背景，并可调节背景模糊度与透明度。
* **原生级体验**：精心设计的 UI，支持系统托盘最小化、开机自启配置。
* **无缝路由**：按需加载页面，流畅的过渡动画。

### 📦 丰富的内容板块
* **发现音乐**：个性化推荐歌单、每日轮播图。
* **资源浏览**：搜索（单曲/歌手/歌单）、排行榜、最新 MV 视频、播客电台。
* **我的音乐**：本地音乐播放、我的云盘、最近播放列表。

---

## 🛠️ 技术栈

* **核心框架**：[Electron](https://www.electronjs.org/)
* **前端框架**：[Vue 3](https://vuejs.org/) (Composition API)
* **构建工具**：[Vite](https://vitejs.dev/) + [Electron-Vite](https://electron-vite.org/)
* **状态管理**：[Pinia](https://pinia.vuejs.org/) (配合 LocalStorage 持久化)
* **路由管理**：[Vue Router](https://router.vuejs.org/)
* **UI 样式**：[Tailwind CSS](https://tailwindcss.com/)
* **API 服务**：[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) (内置集成，自动启动)
* **打包工具**：[electron-builder](https://www.electron.build/)

---

## 🚀 本地运行

确保你的环境已安装 **Node.js** (推荐 v16+) 和 **npm**。

1.  **克隆项目**
    ```bash
    git clone [https://github.com/Bestows/bestows-music.git](https://github.com/Bestows/bestows-music.git)
    cd bestows-music
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发环境**
    ```bash
    npm run dev
    ```
  * 这将同时启动 Electron 主进程、渲染进程以及内置的网易云 API 服务（默认端口 3000）。

---

## 📦 打包构建

项目配置了 `electron-builder`，支持构建多平台安装包。

### Linux 构建 (AppImage, deb, rpm)
```bash
npm run build:linux
```

## 🤝 贡献与支持
欢迎提交 Issue 或 Pull Request！
如果你喜欢这个项目，请给它一个 ⭐️ Star！
作者: Bestows
GitHub: https://github.com/Python-Z66
Gitee: https://gitee.com/bestows_zth/bestows-music-player
