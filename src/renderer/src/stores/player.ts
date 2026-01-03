import { defineStore } from 'pinia'
import request from '../utils/request'

const audio = new Audio()

const parseLyric = (lrc: string) => {
  if (!lrc) return []
  const lines = lrc.split('\n')
  const result: { time: number; text: string }[] = []
  const timeExp = /\[(\d{1,3}):(\d{1,2})\.(\d{1,3})\]/
  for (const line of lines) {
    const res = timeExp.exec(line)
    if (res) {
      const m = parseInt(res[1])
      const s = parseInt(res[2])
      const msStr = res[3]
      let ms = 0
      if (msStr.length === 3) ms = parseInt(msStr) / 1000
      else if (msStr.length === 2) ms = parseInt(msStr) / 100
      else ms = parseInt(msStr) / 10
      const time = m * 60 + s + ms
      const text = line.replace(timeExp, '').trim()
      result.push({ time, text })
    }
  }
  result.sort((a, b) => a.time - b.time)
  return result
}

export type PlayMode = 'sequence' | 'loop' | 'random'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentSong: JSON.parse(localStorage.getItem('player-current') || 'null'),
    playList: JSON.parse(localStorage.getItem('player-list') || '[]'),
    currentIndex: Number(localStorage.getItem('player-index')) || -1,
    currentTime: Number(localStorage.getItem('player-time')) || 0,
    duration: 0,
    volume: Number(localStorage.getItem('player-volume')) || 0.7,
    isPlaying: false,
    lyricList: [] as { time: number; text: string }[],
    currentLyricIndex: 0,
    playMode: (localStorage.getItem('player-mode') as PlayMode) || 'sequence',
    likedSongIds: new Set<number>(),
    lyricOffset: 0,
    // === 新增：防止单次播放重复打卡 ===
    scrobbled: false
  }),

  actions: {
    async init() {
      audio.volume = this.volume
      this.initAudioEvents()
      this.initIpcEvents()

      if (this.currentSong) {
        if (this.playList.length === 0) {
          this.playList = [this.currentSong]
          this.currentIndex = 0
        }
        this.fetchLyric(this.currentSong.id)
        try {
          const res: any = await request.get(
            `/song/url/v1?id=${this.currentSong.id}&level=standard`
          )
          if (res.data?.[0]?.url) {
            audio.src = res.data[0].url
            audio.currentTime = this.currentTime
          }
        } catch (e) {}
      }
    },

    initIpcEvents() {
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.on('lyric-control-action', (_event, data: any) => {
          if (data.type === 'offset') {
            this.lyricOffset += data.value
          } else if (data.type === 'control') {
            if (data.value === 'prev') this.prev()
            if (data.value === 'next') this.next()
            if (data.value === 'toggle') this.togglePlay()
          }
        })
      }
    },

    async playSong(song: any) {
      if (!song) return
      if (this.currentSong?.id === song.id && !audio.paused) return

      this.currentSong = song
      this.lyricOffset = 0
      this.scrobbled = false // 重置打卡状态
      this.saveState()

      // 本地音乐逻辑
      if (song.isLocal && song.url) {
        audio.src = song.url
        audio.play()
        this.isPlaying = true
        return
      }

      this.fetchLyric(song.id)

      try {
        const res: any = await request.get(`/song/url/v1?id=${song.id}&level=standard`)
        if (!res.data?.[0]?.url) {
          setTimeout(() => this.next(true), 1000)
          return
        }
        audio.src = res.data[0].url
        audio.volume = this.volume

        try {
          await audio.play()
          this.isPlaying = true
        } catch (e: any) {
          if (e.name !== 'AbortError') throw e
        }

        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.ar?.map((a: any) => a.name).join('/') || 'Unknown',
            artwork: song.al ? [{ src: song.al.picUrl }] : []
          })
        }
      } catch (e) {
        this.isPlaying = false
      }
    },

    // === 新增：听歌打卡 (更新最近播放) ===
    async scrobble() {
      if (!this.currentSong || this.scrobbled) return
      if (this.currentSong.isLocal) return

      try {
        // sourceid 默认为专辑ID
        const sourceid = this.currentSong.al?.id || 0
        const time = Math.floor(this.currentTime)
        // 调用 scrobble 接口
        await request.get(`/scrobble?id=${this.currentSong.id}&sourceid=${sourceid}&time=${time}`)
        this.scrobbled = true
        console.log('听歌打卡成功')
      } catch (e) {
        console.error('打卡失败', e)
      }
    },

    async fetchLyric(id: number) {
      this.lyricList = []
      this.currentLyricIndex = 0
      try {
        const res: any = await request.get(`/lyric?id=${id}`)
        if (res.lrc?.lyric) {
          this.lyricList = parseLyric(res.lrc.lyric)
        }
      } catch (e) {
        console.error(e)
      }
    },

    toggleMode() {
      if (this.playMode === 'sequence') this.playMode = 'loop'
      else if (this.playMode === 'loop') this.playMode = 'random'
      else this.playMode = 'sequence'
      localStorage.setItem('player-mode', this.playMode)
    },

    async toggleLike(id: number) {
      const isLike = !this.likedSongIds.has(id)
      try {
        await request.get(`/like?id=${id}&like=${isLike}`)
        if (isLike) this.likedSongIds.add(id)
        else this.likedSongIds.delete(id)
      } catch (e) {
        alert('操作失败')
      }
    },

    next(auto = false) {
      if (this.playList.length === 0) return
      if (this.playMode === 'loop' && auto) {
        audio.currentTime = 0
        audio.play()
        return
      }
      let nextIndex = this.currentIndex + 1
      if (this.playMode === 'random') {
        nextIndex = Math.floor(Math.random() * this.playList.length)
      } else if (nextIndex >= this.playList.length) {
        nextIndex = 0
      }
      this.currentIndex = nextIndex
      this.playSong(this.playList[nextIndex])
    },

    prev() {
      if (this.playList.length === 0) return
      let prevIndex = this.currentIndex - 1
      if (prevIndex < 0) prevIndex = this.playList.length - 1
      this.currentIndex = prevIndex
      this.playSong(this.playList[prevIndex])
    },

    addToQueue(song: any) {
      if (this.playList.length === 0) {
        this.setPlayList([song])
        this.playSong(song)
        return
      }
      const exists = this.playList.find((s) => s.id === song.id)
      if (exists) return
      const insertIndex = this.currentIndex + 1
      this.playList.splice(insertIndex, 0, song)
      this.saveState()
    },

    setPlayList(list: any[]) {
      this.playList = list
      this.currentIndex = 0
      this.saveState()
    },

    clearPlaylist() {
      this.playList = []
      this.currentSong = null
      this.currentIndex = -1
      this.isPlaying = false
      audio.pause()
      audio.src = ''
      this.saveState()
    },

    togglePlay() {
      if (this.isPlaying) audio.pause()
      else audio.play()
      this.isPlaying = !this.isPlaying
    },

    seek(time: number) {
      audio.currentTime = time
      this.currentTime = time
    },

    setVolume(val: number) {
      this.volume = val
      audio.volume = val
      localStorage.setItem('player-volume', String(val))
    },

    initAudioEvents() {
      audio.addEventListener('timeupdate', () => {
        this.currentTime = audio.currentTime
        if (audio.duration) this.duration = audio.duration

        // === 听歌打卡触发逻辑 ===
        // 播放进度超过 1/3 或者播放时间超过 60秒
        if (!this.scrobbled && this.duration > 0) {
          const progress = this.currentTime / this.duration
          if (progress > 0.33 || this.currentTime > 60) {
            this.scrobble()
          }
        }

        if (this.lyricList.length > 0) {
          const effectiveTime = this.currentTime - this.lyricOffset / 1000
          const index = this.lyricList.findIndex((item, i) => {
            const next = this.lyricList[i + 1]
            return item.time <= effectiveTime && (!next || next.time > effectiveTime)
          })

          if (index !== -1 && index !== this.currentLyricIndex) {
            this.currentLyricIndex = index
            const currentLine = this.lyricList[index]
            const nextLine = this.lyricList[index + 1]
            const duration = nextLine ? (nextLine.time - currentLine.time) * 1000 : 3000

            if (window.electron && window.electron.ipcRenderer) {
              window.electron.ipcRenderer.send('sync-lyric', {
                text: currentLine.text,
                duration: duration
              })
            }
            localStorage.setItem('current-lyric-text', currentLine.text)
          }
        }
        localStorage.setItem('player-time', String(this.currentTime))
      })

      audio.addEventListener('ended', () => {
        this.next(true)
      })
      audio.addEventListener('play', () => {
        this.isPlaying = true
      })
      audio.addEventListener('pause', () => {
        this.isPlaying = false
      })
    },

    saveState() {
      try {
        localStorage.setItem('player-current', JSON.stringify(this.currentSong))
        localStorage.setItem('player-list', JSON.stringify(this.playList))
        localStorage.setItem('player-index', String(this.currentIndex))
      } catch (e) {}
    }
  }
})
