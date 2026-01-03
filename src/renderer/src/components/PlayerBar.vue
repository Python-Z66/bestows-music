<template>
  <div
    class="h-full flex items-center px-4 justify-between select-none relative transition-all duration-300"
    :class="
      settingsStore.playerStyle === 'glass' ? 'glass-panel' : 'bg-[#1c1c1f] border-t border-white/5'
    "
  >
    <div
      class="absolute top-[-6px] left-0 right-0 h-3 group cursor-pointer progress-container z-50"
      @click="handleSeek"
    >
      <div class="h-[2px] w-full bg-white/5 group-hover:h-[4px] transition-all absolute top-[6px]">
        <div
          class="h-full bg-white/20 w-0 transition-all duration-500"
          :style="{ width: '100%' }"
        ></div>
        <div
          class="absolute top-0 left-0 h-full bg-ncm-red transition-all duration-100 flex items-center justify-end"
          :style="{ width: progressPercent + '%' }"
        >
          <div
            class="w-3 h-3 bg-white rounded-full shadow-md transform scale-0 group-hover:scale-100 transition-transform duration-200 progress-handle -mr-1.5"
          ></div>
        </div>
      </div>
    </div>

    <div class="w-1/3 flex items-center space-x-4 pl-2">
      <template v-if="playerStore.currentSong">
        <div
          class="w-14 h-14 rounded-lg overflow-hidden relative group cursor-pointer shadow-lg border border-white/5"
          @click="$emit('toggle-lyrics')"
        >
          <img
            :src="playerStore.currentSong.al.picUrl"
            class="w-full h-full object-cover transition-transform duration-[20s] ease-linear"
            :class="playerStore.isPlaying ? 'animate-spin-slow' : ''"
          />
          <div
            class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-[1px]"
          >
            <Icon icon="mdi:chevron-up" class="text-white text-2xl" />
          </div>
        </div>

        <div class="flex flex-col max-w-[200px] justify-center">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-white truncate cursor-pointer hover:underline">{{
              playerStore.currentSong.name
            }}</span>
            <button @click="playerStore.toggleLike(playerStore.currentSong.id)">
              <Icon
                :icon="
                  playerStore.likedSongIds.has(playerStore.currentSong.id)
                    ? 'mdi:heart'
                    : 'mdi:heart-outline'
                "
                class="cursor-pointer text-lg transition-transform active:scale-125"
                :class="
                  playerStore.likedSongIds.has(playerStore.currentSong.id)
                    ? 'text-ncm-red'
                    : 'text-gray-400 hover:text-gray-200'
                "
              />
            </button>
          </div>
          <div class="text-xs text-gray-400 truncate cursor-pointer hover:text-gray-300 mt-0.5">
            {{
              playerStore.currentSong.ar
                ? playerStore.currentSong.ar.map((a: any) => a.name).join('/')
                : '未知'
            }}
          </div>
        </div>
      </template>

      <template v-else>
        <div
          class="w-14 h-14 bg-white/5 rounded-lg flex items-center justify-center text-xs text-gray-600 border border-white/5"
        >
          <Icon icon="mdi:music-note" class="text-2xl opacity-20" />
        </div>
      </template>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center max-w-lg">
      <div class="flex items-center space-x-8">
        <button
          class="text-gray-400 hover:text-ncm-red transition-colors"
          @click="playerStore.toggleMode"
          :title="modeTitle"
        >
          <Icon :icon="modeIcon" class="text-lg" />
        </button>

        <button
          class="text-gray-200 hover:text-white transition-colors hover:scale-110 active:scale-95"
          @click="playerStore.prev()"
        >
          <Icon icon="mdi:skip-previous" class="text-3xl" />
        </button>

        <button
          class="w-12 h-12 bg-ncm-red rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 glow-shadow"
          @click="playerStore.togglePlay()"
        >
          <Icon :icon="playerStore.isPlaying ? 'mdi:pause' : 'mdi:play'" class="text-2xl" />
        </button>

        <button
          class="text-gray-200 hover:text-white transition-colors hover:scale-110 active:scale-95"
          @click="playerStore.next(false)"
        >
          <Icon icon="mdi:skip-next" class="text-3xl" />
        </button>

        <button class="text-gray-400 hover:text-white transition-colors" @click="toggleMute">
          <Icon :icon="volumeIcon" class="text-xl" />
        </button>
      </div>

      <div
        class="flex items-center space-x-1 mt-2 text-[10px] text-gray-500 font-mono tracking-wider"
      >
        <span>{{ formatTime(playerStore.currentTime) }}</span>
        <span class="opacity-50">/</span>
        <span>{{ formatTime(playerStore.duration) }}</span>
      </div>
    </div>

    <div class="w-1/3 flex items-center justify-end space-x-5 pr-2">
      <div class="w-24 group flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="playerStore.volume"
          @input="handleVolume"
          class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ncm-red opacity-50 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <div class="h-4 w-[1px] bg-white/10"></div>

      <Icon
        icon="mdi:picture-in-picture-bottom-right"
        class="text-xl text-gray-400 hover:text-ncm-red cursor-pointer transition-colors"
        title="桌面歌词"
        @click="toggleDesktopLyric"
      />

      <div class="relative">
        <Icon
          icon="mdi:playlist-music"
          class="text-2xl text-gray-400 hover:text-white cursor-pointer transition-colors"
          @click="$emit('toggle-queue')"
        />
        <div
          class="absolute -top-1 -right-1 w-4 h-4 bg-white/10 text-[9px] flex items-center justify-center rounded-full text-gray-300 pointer-events-none"
        >
          {{ playerStore.playList.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'
import { useSettingsStore } from '../stores/settings'

defineEmits(['toggle-queue', 'toggle-lyrics'])
const playerStore = usePlayerStore()
const settingsStore = useSettingsStore()

const progressPercent = computed(() =>
  playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 : 0
)

const volumeIcon = computed(() => {
  if (playerStore.volume === 0) return 'mdi:volume-mute'
  if (playerStore.volume < 0.5) return 'mdi:volume-medium'
  return 'mdi:volume-high'
})

const modeIcon = computed(() => {
  if (playerStore.playMode === 'loop') return 'mdi:repeat-once'
  if (playerStore.playMode === 'random') return 'mdi:shuffle'
  return 'mdi:repeat'
})

const modeTitle = computed(() => {
  if (playerStore.playMode === 'loop') return '单曲循环'
  if (playerStore.playMode === 'random') return '随机播放'
  return '列表循环'
})

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

const toggleMute = () => {
  playerStore.setVolume(playerStore.volume > 0 ? 0 : 0.7)
}

const toggleDesktopLyric = () => {
  if (window.electron) {
    window.electron.ipcRenderer.send('toggle-desktop-lyric')
  }
}
</script>
