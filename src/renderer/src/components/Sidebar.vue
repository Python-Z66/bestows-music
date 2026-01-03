<template>
  <div
    class="w-52 h-full flex flex-col text-gray-400 text-sm overflow-y-auto no-scrollbar relative z-20 pt-4"
  >
    <div class="px-5 mb-6">
      <div
        class="flex items-center space-x-3 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors"
        @click="handleUserClick"
      >
        <div
          class="w-10 h-10 rounded-full bg-white/10 overflow-hidden border-2 border-white/10 shrink-0"
        >
          <img
            v-if="userStore.isLoggedIn && userStore.profile"
            :src="userStore.profile.avatarUrl"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon icon="mdi:account" class="text-xl" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-200 truncate font-bold">
            {{ userStore.isLoggedIn ? userStore.profile.nickname : '未登录' }}
          </div>
          <div
            class="text-[10px] text-gray-500 group-hover:text-ncm-red transition-colors flex items-center mt-0.5"
          >
            <span>{{ userStore.isLoggedIn ? 'Lv.8' : '点击登录' }}</span>
            <Icon icon="mdi:chevron-right" v-if="!userStore.isLoggedIn" />
          </div>
        </div>
      </div>

      <div
        v-if="showUserMenu"
        class="absolute top-20 left-6 w-40 bg-[#2B2B2B] rounded-lg shadow-2xl border border-white/5 py-1 z-50 text-gray-300"
      >
        <div
          class="flex items-center space-x-2 px-4 py-2.5 hover:bg-white/10 cursor-pointer transition"
          @click="router.push('/settings');
            showUserMenu = false
          "
        >
          <Icon icon="mdi:cog-outline" /><span>设置</span>
        </div>
        <div class="h-[1px] bg-white/10 my-1"></div>
        <div
          class="flex items-center space-x-2 px-4 py-2.5 hover:bg-white/10 cursor-pointer transition text-red-400"
          @click="handleLogout"
        >
          <Icon icon="mdi:logout" /><span>退出</span>
        </div>
      </div>
    </div>

    <div class="px-3 space-y-1">
      <div
        v-for="item in mainMenus"
        :key="item.name"
        @click="handleMenuClick(item)"
        :class="['menu-item', activeMenu === item.name ? 'active' : '']"
      >
        <Icon :icon="item.icon" class="text-xl mr-3 opacity-80" />
        <span class="font-medium">{{ item.name }}</span>
      </div>
    </div>

    <div class="mt-6 px-3 space-y-1">
      <div class="text-xs text-gray-500 px-3 mb-2 font-medium">我的音乐</div>
      <div
        v-for="item in myMusicMenus"
        :key="item.name"
        @click="handleMenuClick(item)"
        :class="['menu-item', activeMenu === item.name ? 'active' : '']"
      >
        <Icon :icon="item.icon" class="text-xl mr-3 opacity-80" />
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="mt-6 px-3 pb-20 space-y-1">
      <div
        class="text-xs text-gray-500 px-3 mb-2 flex items-center justify-between group cursor-pointer hover:text-gray-300"
      >
        <span class="font-medium">创建的歌单</span>
        <Icon icon="mdi:plus" class="opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div
        v-for="playlist in userStore.playlists"
        :key="playlist.id"
        @click="goToPlaylist(playlist.id)"
        class="menu-item"
        :class="route.path === `/playlist/${playlist.id}` ? 'active' : ''"
      >
        <Icon
          :icon="playlist.specialType === 5 ? 'mdi:heart-outline' : 'mdi:playlist-music-outline'"
          class="text-lg mr-3 opacity-80"
        />
        <span class="truncate">{{ playlist.name }}</span>
      </div>
    </div>

    <LoginModal :show="showLogin" @close="showLogin = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'
import LoginModal from './LoginModal.vue'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const showLogin = ref(false)
const showUserMenu = ref(false)
const router = useRouter()
const route = useRoute()
const activeMenu = ref('发现音乐')

const handleUserClick = () => {
  userStore.isLoggedIn ? (showUserMenu.value = !showUserMenu.value) : (showLogin.value = true)
}
const handleLogout = () => {
  userStore.logout()
  showUserMenu.value = false
}
const goToPlaylist = (id: number) => {
  activeMenu.value = ''
  router.push(`/playlist/${id}`)
}
const handleMenuClick = (item: any) => {
  activeMenu.value = item.name
  if (item.path) router.push(item.path)
}

watch(
  () => userStore.isLoggedIn,
  (v) => {
    if (v) userStore.fetchUserPlaylist()
  }
)
onMounted(() => {
  if (userStore.isLoggedIn) userStore.fetchUserPlaylist()
  document.addEventListener('click', (e: any) => {
    if (!e.target.closest('.px-5')) showUserMenu.value = false
  })
})

const mainMenus = [
  { name: '发现音乐', icon: 'mdi:compass-outline', path: '/discovery' },
  { name: '播客', icon: 'mdi:podcast', path: '/podcast' },
  { name: '视频', icon: 'mdi:video-outline', path: '/video' },
  { name: '关注', icon: 'mdi:account-group-outline', path: '/following' }
]
const myMusicMenus = [
  { name: '本地与下载', icon: 'mdi:download-circle-outline', path: '/local' },
  { name: '最近播放', icon: 'mdi:clock-time-three-outline', path: '/recent' },
  { name: '我的音乐云盘', icon: 'mdi:cloud-outline', path: '/cloud' }
]
</script>

<style scoped>
.menu-item {
  @apply flex items-center py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5;
}
.menu-item.active {
  @apply bg-gradient-to-r from-ncm-red/20 to-transparent text-ncm-red font-bold relative overflow-hidden;
}
/* 左侧指示条 */
.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: 0 2px 2px 0;
}
</style>
