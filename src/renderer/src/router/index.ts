import { createRouter, createWebHashHistory } from 'vue-router'

// 首页比较重要，可以保留静态引入，或者也改为动态
import Discovery from '../views/Discovery.vue'

const routes = [
  { path: '/', redirect: '/discovery' },
  { path: '/discovery', component: Discovery },

  // === 性能优化：路由懒加载 ===
  { path: '/playlist/:id', component: () => import('../views/Playlist.vue') },
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
