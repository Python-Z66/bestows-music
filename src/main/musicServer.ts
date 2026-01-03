// src/main/musicServer.ts
const { serveNcmApi } = require('NeteaseCloudMusicApi')

export async function startMusicServer() {
  try {
    // 启动 API 服务器
    // checkVersion: true 会检查更新，建议关掉加快启动速度
    // port: 3000 确保和前端 request.ts 里的配置一致
    const server = await serveNcmApi({
      checkVersion: false,
      port: 3000
    })

    console.log('网易云音乐 API 服务已在 3000 端口启动')
    return server
  } catch (error) {
    console.error('API 服务启动失败:', error)
  }
}
