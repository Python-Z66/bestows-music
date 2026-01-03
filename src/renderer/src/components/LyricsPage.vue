<template>
  <div
    class="fixed inset-0 z-40 flex flex-col bg-[#1c1c1f] text-white transition-transform duration-500 overflow-hidden select-none"
  >
    <div class="absolute inset-0 z-0">
      <div
        class="absolute inset-0 bg-cover bg-center opacity-40 blur-[80px] scale-150 transition-all duration-1000"
        :style="`background-image: url(${playerStore.currentSong?.al?.picUrl || ''})`"
      ></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <div class="relative z-10 h-16 flex items-center justify-between px-6 pt-4">
      <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-full transition">
        <Icon icon="mdi:chevron-down" class="text-3xl text-gray-300 hover:text-white" />
      </button>
      <div class="text-center">
        <div class="text-lg font-medium">{{ playerStore.currentSong?.name }}</div>
        <div class="text-sm text-gray-400">
          {{ playerStore.currentSong?.ar?.map((a: any) => a.name).join('/') }}
        </div>
      </div>
      <div class="w-10"></div>
    </div>

    <div class="relative z-10 flex-1 flex items-center justify-center overflow-hidden">
      <div class="flex w-full max-w-5xl h-[60vh]">
        <div class="w-1/2 flex items-center justify-center relative">
          <div
            class="absolute top-0 left-1/2 w-24 h-36 bg-[url('https://s2.music.126.net/style/web2/img/frame/needle.png?2')] bg-contain bg-no-repeat z-20 origin-[12px_12px] transition-transform duration-500"
            :class="playerStore.isPlaying ? 'rotate-0' : '-rotate-[30deg]'"
            style="margin-left: -12px; margin-top: -60px"
          ></div>
          <div
            class="w-[320px] h-[320px] rounded-full bg-black flex items-center justify-center shadow-2xl border-4 border-white/5"
            :class="playerStore.isPlaying ? 'animate-spin-slow' : ''"
            :style="{ animationPlayState: playerStore.isPlaying ? 'running' : 'paused' }"
          >
            <div
              class="absolute inset-0 rounded-full bg-[url('https://s2.music.126.net/style/web2/img/coverall.png')] bg-cover opacity-80"
            ></div>
            <img
              :src="playerStore.currentSong?.al?.picUrl"
              class="w-52 h-52 rounded-full object-cover relative z-10 border-4 border-black"
            />
          </div>
        </div>

        <div class="w-1/2 relative mask-gradient">
          <div class="h-full overflow-y-auto no-scrollbar scroll-smooth" ref="lyricContainer">
            <div class="h-[50%]"></div>
            <div
              v-for="(line, index) in playerStore.lyricList"
              :key="index"
              class="py-3 text-lg transition-all duration-500 cursor-pointer origin-left"
              :class="getLyricClass(index)"
              @click="playerStore.seek(line.time)"
              :id="`line-${index}`"
            >
              {{ line.text }}
            </div>
            <div class="h-[50%]"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="relative z-20 px-10 pb-10 w-full max-w-3xl mx-auto flex flex-col justify-end">
      <div class="flex items-center space-x-4 text-xs text-gray-400 font-mono mb-8">
        <span>{{ formatTime(playerStore.currentTime) }}</span>
        <div class="flex-1 h-[2px] bg-white/20 cursor-pointer group relative" @click="handleSeek">
          <div
            class="h-full bg-white relative group-hover:bg-ncm-red transition-colors"
            :style="{ width: progressPercent + '%' }"
          >
            <div
              class="absolute -right-1.5 -top-[5px] w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transform scale-0 group-hover:scale-100 transition-all"
            ></div>
          </div>
        </div>
        <span>{{ formatTime(playerStore.duration) }}</span>
      </div>

      <div class="flex items-center justify-between px-10">
        <button @click="playerStore.toggleMode" class="text-gray-400 hover:text-white">
          <Icon :icon="modeIcon" class="text-2xl" />
        </button>

        <button @click="playerStore.prev" class="text-gray-300 hover:text-white">
          <Icon icon="mdi:skip-previous" class="text-4xl" />
        </button>

        <button
          @click="playerStore.togglePlay"
          class="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 transition text-white border border-white/20"
        >
          <Icon :icon="playerStore.isPlaying ? 'mdi:pause' : 'mdi:play'" class="text-4xl" />
        </button>

        <button @click="playerStore.next(false)" class="text-gray-300 hover:text-white">
          <Icon icon="mdi:skip-next" class="text-4xl" />
        </button>

        <div class="flex items-center space-x-6">
          <button
            @click="playerStore.currentSong && playerStore.toggleLike(playerStore.currentSong.id)"
            class="text-gray-400 hover:text-white"
          >
            <Icon
              :icon="
                playerStore.likedSongIds.has(playerStore.currentSong?.id)
                  ? 'mdi:heart'
                  : 'mdi:heart-outline'
              "
              :class="
                playerStore.likedSongIds.has(playerStore.currentSong?.id) ? 'text-ncm-red' : ''
              "
              class="text-2xl"
            />
          </button>
          <button @click="$emit('toggle-queue')" class="text-gray-400 hover:text-white">
            <Icon icon="mdi:playlist-music" class="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()
const lyricContainer = ref<HTMLElement | null>(null)

defineEmits(['close', 'toggle-queue'])

const progressPercent = computed(() => {
  if (!playerStore.duration) return 0
  return (playerStore.currentTime / playerStore.duration) * 100
})

const modeIcon = computed(() => {
  switch (playerStore.playMode) {
    case 'loop':
      return 'mdi:repeat-once'
    case 'random':
      return 'mdi:shuffle'
    default:
      return 'mdi:repeat'
  }
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
  const time = percent * playerStore.duration
  playerStore.seek(time)
}

// 歌词样式计算
const getLyricClass = (index: number) => {
  if (playerStore.currentLyricIndex === index) {
    // 高亮特效：大字 + 纯白 + 阴影
    return 'text-white font-bold text-3xl scale-105 active-shadow'
  } else {
    // 普通行：灰色 + 轻微模糊
    return 'text-gray-400 opacity-60 blur-[0.5px] hover:blur-0 hover:opacity-100 hover:text-gray-200'
  }
}

watch(
  () => playerStore.currentLyricIndex,
  (newIndex) => {
    if (!lyricContainer.value) return
    const activeLine = document.getElementById(`line-${newIndex}`)
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
)
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin-slow {
  animation: spin-slow 25s linear infinite;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* 发光文字特效 */
.active-shadow {
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}
</style>
