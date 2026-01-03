import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    backgroundImage: localStorage.getItem('bg-image') || '',
    backgroundOpacity: Number(localStorage.getItem('bg-opacity')) || 0.5,

    // === 新增设置项 ===
    launchAtStartup: localStorage.getItem('launch-at-startup') === 'true',
    closeOption: localStorage.getItem('close-option') || 'minimize', // 'minimize' | 'quit'
    lyricColor: localStorage.getItem('lyric-color') || '#4ade80', // 默认绿色
    lyricFontSize: Number(localStorage.getItem('lyric-font-size')) || 36
  }),

  actions: {
    setBackgroundImage(dataUrl: string) {
      this.backgroundImage = dataUrl
      localStorage.setItem('bg-image', dataUrl)
    },

    setOpacity(val: number) {
      this.backgroundOpacity = val
      localStorage.setItem('bg-opacity', String(val))
    },

    // 开机自启
    setLaunchAtStartup(val: boolean) {
      this.launchAtStartup = val
      localStorage.setItem('launch-at-startup', String(val))
      if (window.electron) {
        window.electron.ipcRenderer.send('set-login-item-settings', val)
      }
    },

    // 关闭按钮行为
    setCloseOption(val: string) {
      this.closeOption = val
      localStorage.setItem('close-option', val)
      if (window.electron) {
        window.electron.ipcRenderer.send('set-close-action', val)
      }
    },

    // 歌词样式
    setLyricStyle(color: string, size: number) {
      this.lyricColor = color
      this.lyricFontSize = size
      localStorage.setItem('lyric-color', color)
      localStorage.setItem('lyric-font-size', String(size))

      // 通知歌词窗口更新
      if (window.electron) {
        window.electron.ipcRenderer.send('update-lyric-style', { color, fontSize: size })
      }
    },

    reset() {
      this.backgroundImage = ''
      this.backgroundOpacity = 0.5
      this.lyricColor = '#4ade80'
      this.lyricFontSize = 36
      localStorage.removeItem('bg-image')
      localStorage.removeItem('bg-opacity')
      // 重置后也同步一下样式
      if (window.electron) {
        window.electron.ipcRenderer.send('update-lyric-style', { color: '#4ade80', fontSize: 36 })
      }
    }
  }
})
