<template>
  <div v-if="isDesktopLyric" class="w-screen h-screen overflow-hidden bg-transparent">
    <router-view></router-view>
  </div>

  <div
    v-else
    class="relative h-screen w-screen overflow-hidden bg-black font-sans select-none text-white"
  >
    <div
      v-if="settingsStore.backgroundImage"
      class="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-300 pointer-events-none"
      :style="{
        backgroundImage: `url(${settingsStore.backgroundImage})`,
        opacity: settingsStore.backgroundOpacity
      }"
    ></div>

    <div class="relative z-10 flex h-full w-full backdrop-blur-sm">
      <div class="w-52 h-full border-r border-white/10 flex-shrink-0">
        <Sidebar @open-theme="showThemeModal = true" />
      </div>

      <div class="flex-1 flex flex-col h-full min-w-0 bg-gray-900/40">
        <header
          class="h-14 border-b border-white/5 flex items-center px-4 drag-region flex-shrink-0 justify-between"
        >
          <div
            class="flex items-center bg-black/20 rounded-full px-3 py-1 border border-white/5 text-xs text-gray-300 w-64 no-drag transition focus-within:bg-black/40 focus-within:border-white/20"
          >
            <Icon icon="mdi:magnify" class="mr-2 text-base" />
            <input
              v-model="searchKeyword"
              @keydown.enter="handleSearch"
              type="text"
              placeholder="搜索音乐 / 歌单 / 歌手"
              class="bg-transparent border-none outline-none text-white placeholder-gray-500 w-full h-full"
            />
          </div>

          <div class="flex items-center space-x-4 no-drag">
            <Icon
              icon="mdi:cog-outline"
              class="text-gray-400 hover:text-white cursor-pointer transition"
              @click="router.push('/settings')"
              title="设置"
            />

            <div class="h-4 w-[1px] bg-white/10 mx-2"></div>
            <button @click="winMin" class="text-gray-400 hover:text-white p-1">
              <Icon icon="mdi:minus" />
            </button>
            <button @click="winMax" class="text-gray-400 hover:text-white p-1">
              <Icon icon="mdi:crop-square" />
            </button>
            <button @click="winClose" class="text-gray-400 hover:text-ncm-red p-1">
              <Icon icon="mdi:close" />
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
          <router-view></router-view>
        </main>

        <transition name="slide-up">
          <LyricsPage v-if="showLyrics" @close="showLyrics = false" @toggle-queue="toggleQueue" />
        </transition>

        <transition name="slide-fade">
          <SongQueue v-if="showQueue" />
        </transition>

        <footer
          v-show="!showLyrics"
          class="h-20 flex-shrink-0 border-t border-white/5 z-50 bg-gray-900/60 backdrop-blur-md"
        >
          <PlayerBar @toggle-queue="toggleQueue" @toggle-lyrics="showLyrics = !showLyrics" />
        </footer>
      </div>
    </div>

    <ThemeModal :show="showThemeModal" @close="showThemeModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
import ThemeModal from './components/ThemeModal.vue'
import SongQueue from './components/SongQueue.vue'
import LyricsPage from './components/LyricsPage.vue'
import { useUserStore } from './stores/user'
import { useSettingsStore } from './stores/settings'
import { usePlayerStore } from './stores/player'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const playerStore = usePlayerStore()

const showThemeModal = ref(false)
const showQueue = ref(false)
const showLyrics = ref(false)
const searchKeyword = ref('')

const isDesktopLyric = computed(() => route.path === '/desktop-lyric')

const toggleQueue = () => {
  showQueue.value = !showQueue.value
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: searchKeyword.value, t: Date.now() } })
  }
}

const winMin = () => window.electron.ipcRenderer.send('window-min')
const winMax = () => window.electron.ipcRenderer.send('window-max')
const winClose = () => window.electron.ipcRenderer.send('window-close')

onMounted(() => {
  userStore.init()
  playerStore.init()
})
</script>

<style>
.drag-region {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
/* ... scrollbar styles ... */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
