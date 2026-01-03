import { defineStore } from 'pinia'
import request from '../utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 关键点：如果本地有 cookie，暂定为已登录状态，避免 UI 闪烁，
    // 后续通过 API 校验如果失效了再改回 false
    isLoggedIn: !!localStorage.getItem('cookie'),
    profile: null as any,
    cookie: localStorage.getItem('cookie') || '',
    playlists: [] as any[],
    qrKey: '',
    qrImg: '',
    qrStatus: 0
  }),
  actions: {
    // === 核心修复：初始化方法 ===
    async init() {
      if (this.cookie) {
        // 有 cookie，尝试恢复用户信息
        const success = await this.fetchAccount()
        if (success) {
          // 用户信息恢复成功后，紧接着去拉歌单
          await this.fetchUserPlaylist()
        } else {
          // 如果 cookie 过期或无效，执行退出清理
          this.logout()
        }
      }
    },

    // 获取用户信息 (返回 boolean 表示是否成功)
    async fetchAccount() {
      if (!this.cookie) return false
      try {
        const res: any = await request.post(`/user/account?timestamp=${Date.now()}`, {
          cookie: this.cookie
        })
        if (res.account) {
          this.profile = res.profile
          this.isLoggedIn = true
          return true
        }
        return false
      } catch (e) {
        console.error('恢复登录状态失败', e)
        return false
      }
    },

    // 获取用户歌单 (需要依赖 profile.userId)
    async fetchUserPlaylist() {
      // 必须先有 profile (里面有 userId) 才能查歌单
      if (!this.profile) return
      try {
        const res: any = await request.get(
          `/user/playlist?uid=${this.profile.userId}&timestamp=${Date.now()}`
        )
        this.playlists = res.playlist
      } catch (error) {
        console.error('获取歌单失败', error)
      }
    },

    // 扫码相关保持不变...
    async getQrKey() {
      const res: any = await request.get(`/login/qr/key?timestamp=${Date.now()}`)
      this.qrKey = res.data.unikey
      return this.qrKey
    },
    async createQrImg(key: string) {
      const res: any = await request.get(
        `/login/qr/create?key=${key}&qrimg=true&timestamp=${Date.now()}`
      )
      this.qrImg = res.data.qrimg
    },
    async checkQrStatus() {
      if (!this.qrKey) return 800
      const res: any = await request.get(
        `/login/qr/check?key=${this.qrKey}&timestamp=${Date.now()}`
      )
      const code = res.code
      this.qrStatus = code
      if (code === 803) {
        this.cookie = res.cookie
        localStorage.setItem('cookie', this.cookie)
        // 登录成功后，手动触发这一套流程
        await this.init()
      }
      return code
    },

    // 退出登录
    logout() {
      this.isLoggedIn = false
      this.profile = null
      this.playlists = []
      this.cookie = ''
      localStorage.removeItem('cookie')
    }
  }
})
