import { createRouter, createWebHashHistory } from 'vue-router'

// 首页比较重要，可以保留静态引入
import Discovery from '../views/Discovery.vue'

const routes = [
  { path: '/', redirect: '/discovery' },
  { path: '/discovery', component: Discovery },

  // === 核心业务页面 ===
  { path: '/playlist/:id', component: () => import('../views/Playlist.vue') },
  { path: '/artist/:id', component: () => import('../views/Artist.vue') }, // 新增：歌手详情
  { path: '/album/:id', component: () => import('../views/Album.vue') }, // 新增：专辑详情
  { path: '/mv/:id', component: () => import('../views/MV.vue') }, // 新增：MV播放

  // === 功能页面 ===
  { path: '/search', component: () => import('../views/Search.vue') },
  { path: '/desktop-lyric', component: () => import('../views/DesktopLyric.vue') },
  { path: '/playlist-square', component: () => import('../views/PlaylistSquare.vue') },
  { path: '/podcast', component: () => import('../views/Podcast.vue') },
  { path: '/video', component: () => import('../views/Video.vue') },
  { path: '/following', component: () => import('../views/Following.vue') },
  { path: '/recent', component: () => import('../views/Recent.vue') },
  { path: '/cloud', component: () => import('../views/Cloud.vue') },
  { path: '/local', component: () => import('../views/Local.vue') },
  { path: '/settings', component: () => import('../views/Settings.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
