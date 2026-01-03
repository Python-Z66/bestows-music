<template>
  <div class="p-8 pb-24" v-if="details">
    <div class="flex space-x-8 mb-8">
      <div class="relative w-52 h-52 flex-shrink-0 group">
        <img :src="details.picUrl" class="w-full h-full rounded-xl shadow-xl object-cover" />
        <div class="absolute inset-0 bg-black/10 rounded-xl border border-white/10"></div>
        <div
          class="absolute top-0 -right-10 w-52 h-52 rounded-full bg-black -z-10 flex items-center justify-center"
        >
          <div class="w-20 h-20 bg-[#1c1c1f] rounded-full border-4 border-gray-800"></div>
        </div>
      </div>

      <div class="flex flex-col justify-end py-2">
        <div
          class="text-xs font-bold border border-ncm-red text-ncm-red inline-block px-2 py-0.5 rounded w-fit mb-3"
        >
          专辑
        </div>
        <h1 class="text-3xl font-bold mb-4 text-white drop-shadow-md">{{ details.name }}</h1>

        <div class="flex items-center space-x-6 text-gray-400 text-sm mb-6">
          <span
            class="text-blue-400 hover:text-blue-300 cursor-pointer"
            @click="router.push(`/artist/${details.artist.id}`)"
          >
            歌手：{{ details.artist.name }}
          </span>
          <span>时间：{{ new Date(details.publishTime).toLocaleDateString() }}</span>
        </div>

        <div class="flex space-x-3">
          <button
            @click="playAll"
            class="bg-ncm-red text-white px-6 py-2 rounded-full flex items-center hover:bg-red-600 transition shadow-lg shadow-red-500/20"
          >
            <Icon icon="mdi:play" class="mr-1 text-xl" /> 播放全部
          </button>
          <button
            class="border border-white/20 text-gray-200 px-4 py-2 rounded-full hover:bg-white/10 transition flex items-center backdrop-blur-sm"
          >
            <Icon icon="mdi:folder-plus-outline" class="mr-1 text-lg" /> 收藏
          </button>
        </div>
      </div>
    </div>

    <div>
      <div
        class="grid grid-cols-[50px_4fr_2fr_60px] text-xs text-gray-400 border-b border-white/10 pb-2 px-2"
      >
        <span>#</span><span>标题</span><span>歌手</span><span>时长</span>
      </div>
      <div
        v-for="(song, index) in tracks"
        :key="song.id"
        class="grid grid-cols-[50px_4fr_2fr_60px] text-sm text-gray-300 py-3 px-2 hover:bg-white/10 rounded-md cursor-pointer group transition-colors items-center odd:bg-white/5"
        @dblclick="playTrack(song)"
      >
        <div class="flex justify-center text-xs text-gray-500">{{ index + 1 }}</div>
        <div class="text-white font-medium truncate pr-4">{{ song.name }}</div>
        <div class="truncate pr-4 text-xs text-gray-400">
          {{ song.ar.map((a: any) => a.name).join('/') }}
        </div>
        <div class="text-xs text-gray-500">{{ formatDuration(song.dt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import request from '../utils/request'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const details = ref<any>(null)
const tracks = ref<any[]>([])

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 1000 / 60)
  const s = Math.floor((ms / 1000) % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const playTrack = (song: any) => {
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}

const playAll = () => {
  if (tracks.value.length) {
    playerStore.setPlayList(tracks.value)
    playerStore.playSong(tracks.value[0])
  }
}

onMounted(async () => {
  const id = route.params.id
  if (!id) return
  try {
    const res: any = await request.get(`/album?id=${id}`)
    details.value = res.album
    tracks.value = res.songs
  } catch (e) {
    console.error(e)
  }
})
</script>
