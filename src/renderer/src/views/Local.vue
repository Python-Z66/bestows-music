<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">本地音乐</h1>

    <div
      class="bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:bg-white/10 transition cursor-pointer"
      @click="triggerFileSelect"
    >
      <Icon icon="mdi:folder-music-outline" class="text-6xl text-gray-500 mx-auto mb-4" />
      <p class="text-lg text-gray-300">点击选择或拖拽音乐文件到此处播放</p>
      <p class="text-xs text-gray-500 mt-2">支持 MP3, FLAC, OGG 等格式</p>
      <input
        type="file"
        ref="fileInput"
        multiple
        accept="audio/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <div class="mt-8" v-if="localSongs.length > 0">
      <div
        v-for="(song, index) in localSongs"
        :key="index"
        class="grid grid-cols-[50px_1fr_100px] text-sm text-gray-400 py-3 px-2 hover:bg-white/5 rounded-md cursor-pointer group items-center odd:bg-white/5"
        @dblclick="playLocal(song)"
      >
        <div class="flex justify-center text-xs">{{ index + 1 }}</div>
        <div class="text-white truncate">{{ song.name }}</div>
        <div class="text-xs text-right">{{ formatSize(song.size) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'

const fileInput = ref<HTMLInputElement | null>(null)
const localSongs = ref<File[]>([])
const playerStore = usePlayerStore()

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    for (let i = 0; i < files.length; i++) {
      localSongs.value.push(files[i])
    }
  }
}

const formatSize = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

const playLocal = (file: File) => {
  // 创建 Blob URL 播放
  const url = URL.createObjectURL(file)
  const song = {
    id: Date.now(), // 伪造ID
    name: file.name.replace(/\.[^/.]+$/, ''),
    ar: [{ name: '本地音乐' }],
    al: { picUrl: '' },
    url: url, // 存入自定义 URL
    isLocal: true // 标记为本地
  }

  // 需要修改 player.ts 适配本地 URL (见下方说明)
  // 这里暂时直接替换 audio.src
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}
</script>
