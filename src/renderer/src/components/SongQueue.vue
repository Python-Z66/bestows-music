<template>
  <div
    class="fixed right-0 bottom-20 w-96 top-14 bg-gray-800/95 backdrop-blur-xl border-l border-white/5 shadow-2xl z-40 flex flex-col transform transition-transform duration-300"
  >
    <div class="h-12 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
      <div class="text-sm font-bold text-gray-200">当前播放</div>
      <div class="flex items-center space-x-3 text-xs text-gray-400">
        <span class="cursor-pointer hover:text-white"
          >总共 {{ playerStore.playList.length }} 首</span
        >
        <span class="cursor-pointer hover:text-ncm-red" @click="playerStore.clearPlaylist()"
          >清空</span
        >
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-0 scroll-smooth">
      <div
        v-if="playerStore.playList.length === 0"
        class="h-full flex items-center justify-center text-gray-500 text-sm"
      >
        列表是空的，快去添加音乐吧
      </div>

      <div
        v-for="(song, index) in playerStore.playList"
        :key="song.id"
        @dblclick="
          playerStore.playSong(song)
          playerStore.currentIndex = index;
"
        :class="[
          'flex items-center px-4 py-3 text-xs cursor-pointer hover:bg-white/5 group border-l-2',
          playerStore.currentSong?.id === song.id
            ? 'bg-white/10 text-ncm-red border-ncm-red'
            : 'text-gray-300 border-transparent'
        ]"
      >
        <div class="w-6 flex-shrink-0">
          <Icon
            v-if="playerStore.currentSong?.id === song.id"
            icon="mdi:equalizer"
            class="text-ncm-red animate-pulse"
          />
          <span v-else class="text-gray-600 group-hover:hidden">{{ index + 1 }}</span>
          <Icon icon="mdi:play" class="hidden group-hover:block text-gray-400" />
        </div>

        <div
          class="flex-1 truncate font-medium mr-2"
          :class="playerStore.currentSong?.id === song.id ? 'text-white' : ''"
        >
          {{ song.name }}
        </div>

        <div class="w-24 truncate text-gray-500 group-hover:text-gray-400 text-right">
          {{ song.ar ? song.ar.map((a: any) => a.name).join('/') : '未知' }}
        </div>

        <div class="w-12 text-right text-gray-600 group-hover:text-gray-500 ml-2">
          {{ formatDuration(song.dt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'

const playerStore = usePlayerStore()

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 1000 / 60)
  const s = Math.floor((ms / 1000) % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>
