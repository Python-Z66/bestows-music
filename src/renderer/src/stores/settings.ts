import { defineStore } from 'pinia'

export interface LyricStyle {
  color: string
  fontSize: number
  fontFamily: string
  strokeColor: string
  strokeWidth: number
  textAlign: 'left' | 'center' | 'right'
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    backgroundImage: localStorage.getItem('bg-image') || '',
    backgroundOpacity: Number(localStorage.getItem('bg-opacity')) || 0.5,
    launchAtStartup: localStorage.getItem('launch-at-startup') === 'true',
    closeOption: localStorage.getItem('close-option') || 'minimize',
    themeColor: localStorage.getItem('theme-color') || '#ec4141',
    playerStyle: localStorage.getItem('player-style') || 'glass',

    // === 歌词高级设置 ===
    lyricColor: localStorage.getItem('lyric-color') || '#4ade80',
    lyricFontSize: Number(localStorage.getItem('lyric-font-size')) || 36,
    lyricFontFamily: localStorage.getItem('lyric-font-family') || 'Arial Rounded MT Bold',
    lyricStrokeColor: localStorage.getItem('lyric-stroke-color') || '#000000',
    lyricStrokeWidth: Number(localStorage.getItem('lyric-stroke-width')) || 2,
    lyricTextAlign:
      (localStorage.getItem('lyric-text-align') as 'left' | 'center' | 'right') || 'center'
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
    setLaunchAtStartup(val: boolean) {
      this.launchAtStartup = val
      localStorage.setItem('launch-at-startup', String(val))
      if (window.electron) window.electron.ipcRenderer.send('set-login-item-settings', val)
    },
    setCloseOption(val: string) {
      this.closeOption = val
      localStorage.setItem('close-option', val)
      if (window.electron) window.electron.ipcRenderer.send('set-close-action', val)
    },
    setThemeColor(color: string) {
      this.themeColor = color
      localStorage.setItem('theme-color', color)
    },
    setPlayerStyle(style: string) {
      this.playerStyle = style
      localStorage.setItem('player-style', style)
    },

    // 统一设置歌词样式
    updateLyricConfig(config: Partial<LyricStyle>) {
      if (config.color) {
        this.lyricColor = config.color
        localStorage.setItem('lyric-color', config.color)
      }
      if (config.fontSize) {
        this.lyricFontSize = config.fontSize
        localStorage.setItem('lyric-font-size', String(config.fontSize))
      }
      if (config.fontFamily) {
        this.lyricFontFamily = config.fontFamily
        localStorage.setItem('lyric-font-family', config.fontFamily)
      }
      if (config.strokeColor) {
        this.lyricStrokeColor = config.strokeColor
        localStorage.setItem('lyric-stroke-color', config.strokeColor)
      }
      if (config.strokeWidth !== undefined) {
        this.lyricStrokeWidth = config.strokeWidth
        localStorage.setItem('lyric-stroke-width', String(config.strokeWidth))
      }
      if (config.textAlign) {
        this.lyricTextAlign = config.textAlign
        localStorage.setItem('lyric-text-align', config.textAlign)
      }

      // 发送完整配置给歌词窗口
      if (window.electron) {
        window.electron.ipcRenderer.send('update-lyric-style', {
          color: this.lyricColor,
          fontSize: this.lyricFontSize,
          fontFamily: this.lyricFontFamily,
          strokeColor: this.lyricStrokeColor,
          strokeWidth: this.lyricStrokeWidth,
          textAlign: this.lyricTextAlign
        })
      }
    },

    reset() {
      // 重置逻辑
      this.backgroundImage = ''
      this.backgroundOpacity = 0.5
      this.themeColor = '#ec4141'
      this.playerStyle = 'glass'
      this.lyricColor = '#4ade80'
      this.lyricFontSize = 36
      this.lyricFontFamily = 'Arial Rounded MT Bold'
      this.lyricStrokeColor = '#000000'
      this.lyricStrokeWidth = 2
      this.lyricTextAlign = 'center'

      localStorage.clear() // 简单粗暴清空，或者逐个remove
      // 重新保存必要的默认值
      localStorage.setItem('theme-color', '#ec4141')

      // 同步重置
      this.updateLyricConfig({})
    }
  }
})
