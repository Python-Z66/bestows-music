<template>
  <div
    class="h-20 bg-gray-900/90 backdrop-blur-md border-t border-white/5 flex items-center px-4 justify-between z-50 text-white select-none"
  >
    <div class="w-1/3 flex items-center space-x-3">
      <template v-if="playerStore.currentSong">
        <div
          class="w-12 h-12 rounded overflow-hidden relative group cursor-pointer"
          @click="$emit('toggle-lyrics')"
        >
          <img :src="playerStore.currentSong.al.picUrl" class="w-full h-full object-cover" />
          <div
            class="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center"
          >
            <Icon icon="mdi:chevron-up" class="text-white text-xl" />
          </div>
        </div>
        <div class="flex flex-col max-w-[200px]">
          <div class="text-sm truncate cursor-pointer hover:underline">
            {{ playerStore.currentSong.name }}
          </div>
          <div class="text-xs text-gray-400 truncate cursor-pointer hover:underline">
            {{
              playerStore.currentSong.ar
                ? playerStore.currentSong.ar.map((a: any) => a.name).join('/')
                : '未知'
            }}
          </div>
        </div>
        <button @click="playerStore.toggleLike(playerStore.currentSong.id)">
          <Icon
            :icon="
              playerStore.likedSongIds.has(playerStore.currentSong.id)
                ? 'mdi:heart'
                : 'mdi:heart-outline'
            "
            :class="
              playerStore.likedSongIds.has(playerStore.currentSong.id)
                ? 'text-ncm-red'
                : 'text-gray-400'
            "
            class="hover:text-ncm-red cursor-pointer ml-2 text-lg"
          />
        </button>
      </template>
      <template v-else>
        <div
          class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500"
        >
          NCM
        </div>
      </template>
    </div>

    <div class="flex-1 flex flex-col items-center max-w-2xl px-4">
      <div class="flex items-center space-x-6 mb-2">
        <Icon
          :icon="modeIcon"
          class="text-xl text-gray-400 hover:text-white cursor-pointer"
          @click="playerStore.toggleMode"
        />
        <Icon
          icon="mdi:skip-previous"
          class="text-2xl text-gray-300 hover:text-ncm-red cursor-pointer"
          @click="playerStore.prev()"
        />
        <div
          class="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-black hover:bg-white cursor-pointer transition"
          @click="playerStore.togglePlay()"
        >
          <Icon :icon="playerStore.isPlaying ? 'mdi:pause' : 'mdi:play'" class="text-xl" />
        </div>
        <Icon
          icon="mdi:skip-next"
          class="text-2xl text-gray-300 hover:text-ncm-red cursor-pointer"
          @click="playerStore.next(false)"
        />
        <div class="w-5"></div>
      </div>
      <div class="w-full flex items-center space-x-2 text-xs text-gray-400 font-mono">
        <span class="w-10 text-right">{{ formatTime(playerStore.currentTime) }}</span>
        <div
          class="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer relative group"
          @click="handleSeek"
        >
          <div
            class="h-full bg-ncm-red rounded-full relative"
            :style="{ width: progressPercent + '%' }"
          >
            <div
              class="absolute -right-1.5 -top-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"
            ></div>
          </div>
        </div>
        <span class="w-10">{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="w-1/3 flex items-center justify-end space-x-4">
      <Icon
        icon="mdi:picture-in-picture-bottom-right"
        class="text-xl text-gray-300 hover:text-white cursor-pointer transition"
        title="打开/关闭桌面歌词"
        @click="toggleDesktopLyric"
      />

      <div class="flex items-center space-x-2 w-24">
        <Icon :icon="volumeIcon" class="text-lg cursor-pointer" @click="toggleMute" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="playerStore.volume"
          @input="handleVolume"
          class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ncm-red"
        />
      </div>
      <Icon
        icon="mdi:playlist-music"
        class="text-xl text-gray-300 hover:text-white cursor-pointer"
        @click="$emit('toggle-queue')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'

defineEmits(['toggle-queue', 'toggle-lyrics'])
const playerStore = usePlayerStore()

const progressPercent = computed(() =>
  playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0
)
const volumeIcon = computed(() =>
  playerStore.volume === 0
    ? 'mdi:volume-mute'
    : playerStore.volume < 0.5
      ? 'mdi:volume-medium'
      : 'mdi:volume-high'
)
const modeIcon = computed(() =>
  playerStore.playMode === 'loop'
    ? 'mdi:repeat-once'
    : playerStore.playMode === 'random'
      ? 'mdi:shuffle'
      : 'mdi:repeat'
)

const formatTime = (seconds: number) => {
  if (!seconds) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const handleSeek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percent = clickX / rect.width
  playerStore.seek(percent * playerStore.duration)
}

const handleVolume = (e: Event) =>
  playerStore.setVolume(Number((e.target as HTMLInputElement).value))
const toggleMute = () => playerStore.setVolume(playerStore.volume > 0 ? 0 : 0.7)

// === 核心修复逻辑 ===
const toggleDesktopLyric = () => {
  if (window.electron) {
    // 发送切换指令，由主进程判断是关闭还是打开
    window.electron.ipcRenderer.send('toggle-desktop-lyric')
  }
}

onMounted(() => {
  if (window.electron) {
    // 监听主进程发来的"启动"信号
    window.electron.ipcRenderer.on('start-desktop-lyric', () => {
      window.open(
        '/#/desktop-lyric',
        '_blank',
        'width=800,height=120,frame=false,transparent=true,alwaysOnTop=true'
      )
    })
  }
})
</script>
