<template>
  <div
    class="w-52 h-full bg-transparent flex flex-col text-gray-400 text-sm overflow-y-auto no-scrollbar relative z-20"
  >
    <div class="px-5 pt-6 pb-3 relative">
      <div
        class="flex items-center space-x-3 cursor-pointer group hover:opacity-90 transition-opacity"
        @click="handleUserClick"
      >
        <div
          class="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/10 shrink-0 backdrop-blur-sm"
        >
          <img
            v-if="userStore.isLoggedIn && userStore.profile"
            :src="userStore.profile.avatarUrl"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon icon="mdi:account" class="text-xl text-gray-400" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-sm text-gray-200 truncate font-medium shadow-black drop-shadow-md">
            {{ userStore.isLoggedIn && userStore.profile ? userStore.profile.nickname : '未登录' }}
          </div>
          <div
            class="text-xs text-gray-400 transform group-hover:text-white transition-colors flex items-center"
          >
            <span>{{ userStore.isLoggedIn ? 'VIP' : '点击登录' }}</span>
            <Icon icon="mdi:chevron-right" class="ml-1 text-base" v-if="!userStore.isLoggedIn" />
          </div>
        </div>
      </div>

      <div
        v-if="showUserMenu"
        class="absolute top-16 left-5 w-40 bg-[#2B2B2B]/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 py-1 z-50 text-gray-300"
      >
        <div
          class="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
          @click="handleOpenTheme"
        >
          <Icon icon="mdi:tshirt-crew-outline" />
          <span>个性装扮</span>
        </div>
        <div class="h-[1px] bg-white/10 my-1"></div>
        <div
          class="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 cursor-pointer transition-colors"
          @click="handleLogout"
        >
          <Icon icon="mdi:logout" />
          <span>退出登录</span>
        </div>
      </div>
    </div>

    <div class="px-3 mt-2">
      <div
        v-for="item in mainMenus"
        :key="item.name"
        @click="handleMenuClick(item)"
        :class="[
          'flex items-center space-x-3 py-2 px-3 rounded-md cursor-pointer transition-colors mb-1',
          activeMenu === item.name
            ? 'bg-ncm-red text-white font-medium shadow-lg shadow-red-500/20'
            : 'hover:bg-white/10 hover:text-white'
        ]"
      >
        <Icon :icon="item.icon" class="text-lg" />
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="mt-4 px-3">
      <div class="text-xs text-gray-500 mb-2 px-3">我的音乐</div>
      <div
        v-for="item in myMusicMenus"
        :key="item.name"
        @click="handleMenuClick(item)"
        class="flex items-center space-x-3 py-2 px-3 rounded-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors mb-1"
      >
        <Icon :icon="item.icon" class="text-lg" />
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="mt-4 px-3 pb-20">
      <div
        class="text-xs text-gray-500 mb-2 px-3 flex items-center justify-between group cursor-pointer hover:text-gray-300"
      >
        <span class="flex items-center">
          创建的歌单
          <Icon icon="mdi:chevron-down" class="ml-1" />
        </span>
        <Icon icon="mdi:plus" class="text-lg" />
      </div>

      <div
        v-for="playlist in userStore.playlists"
        :key="playlist.id"
        @click="goToPlaylist(playlist.id)"
        class="flex items-center space-x-3 py-2 px-3 rounded-md cursor-pointer hover:bg-white/10 hover:text-white transition-colors text-ellipsis overflow-hidden whitespace-nowrap mb-1"
      >
        <Icon
          :icon="playlist.specialType === 5 ? 'mdi:heart-outline' : 'mdi:playlist-music-outline'"
          class="text-lg flex-shrink-0"
        />
        <span class="truncate text-sm">{{ playlist.name }}</span>
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
import { useRouter } from 'vue-router'

const emit = defineEmits(['open-theme'])
const userStore = useUserStore()
const showLogin = ref(false)
const showUserMenu = ref(false)
const router = useRouter()
const activeMenu = ref('发现音乐')

const handleOpenTheme = () => {
  emit('open-theme')
  showUserMenu.value = false
}

const handleUserClick = () => {
  if (userStore.isLoggedIn) {
    showUserMenu.value = !showUserMenu.value
  } else {
    showLogin.value = true
  }
}

const handleLogout = () => {
  userStore.logout()
  showUserMenu.value = false
}

const goToPlaylist = (id: number) => {
  activeMenu.value = '' // 清除菜单选中状态
  router.push(`/playlist/${id}`)
}

const handleMenuClick = (item: any) => {
  activeMenu.value = item.name
  if (item.path) {
    router.push(item.path)
  }
}


watch(
  () => userStore.isLoggedIn,
  (newVal) => {
    if (newVal) userStore.fetchUserPlaylist()
  }
)

onMounted(() => {
  if (userStore.isLoggedIn) userStore.fetchUserPlaylist()
  // 点击外部关闭菜单
  document.addEventListener('click', (e: any) => {
    const target = e.target as HTMLElement
    if (!target.closest('.px-5') && showUserMenu.value) {
      showUserMenu.value = false
    }
  })
})

const mainMenus = [
  { name: '发现音乐', icon: 'mdi:compass-outline', path: '/discovery' },
  { name: '播客', icon: 'mdi:podcast', path: '/podcast' },
  { name: '视频', icon: 'mdi:video-outline', path: '/video' },
  { name: '关注', icon: 'mdi:account-group-outline', path: '/following' },
  { name: '直播', icon: 'mdi:video-wireless-outline', path: '/discovery' },
  { name: '私人FM', icon: 'mdi:radio', path: '/discovery' }
]

const myMusicMenus = [
  { name: '本地与下载', icon: 'mdi:download-circle-outline', path: '/local' }, // 修改
  { name: '最近播放', icon: 'mdi:clock-time-three-outline', path: '/recent' }, // 修改
  { name: '我的音乐云盘', icon: 'mdi:cloud-outline', path: '/cloud' } // 修改
]
</script>
