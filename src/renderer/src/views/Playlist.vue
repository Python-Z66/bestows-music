<template>
  <div class="p-8 pb-24" v-if="details">
    <div class="flex space-x-8 mb-8">
      <div class="relative w-52 h-52 flex-shrink-0 group">
        <img :src="details.coverImgUrl" class="w-full h-full rounded-xl shadow-xl object-cover" />
        <div class="absolute inset-0 bg-black/20 rounded-xl"></div>
      </div>

      <div class="flex flex-col justify-end py-2">
        <div
          class="text-xs font-bold border border-ncm-red text-ncm-red inline-block px-2 py-0.5 rounded w-fit mb-3"
        >
          歌单
        </div>
        <h1 class="text-3xl font-bold mb-4 text-white drop-shadow-md">{{ details.name }}</h1>

        <div class="flex items-center space-x-3 text-gray-400 text-xs mb-6">
          <img :src="details.creator.avatarUrl" class="w-6 h-6 rounded-full" />
          <span class="text-blue-400 hover:text-blue-300 cursor-pointer">{{
            details.creator.nickname
          }}</span>
          <span>{{ new Date(details.createTime).toLocaleDateString() }} 创建</span>
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
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-xs text-gray-400 border-b border-white/10 pb-2 px-2"
      >
        <span>#</span>
        <span>标题</span>
        <span>歌手</span>
        <span>专辑</span>
        <span>时长</span>
      </div>

      <div
        v-for="(song, index) in tracks"
        :key="song.id"
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-sm text-gray-300 py-3 px-2 hover:bg-white/10 rounded-md cursor-pointer group transition-colors"
        @dblclick="playTrack(song)"
        :class="{ 'bg-white/10 text-ncm-red': playerStore.currentSong?.id === song.id }"
      >
        <div class="flex items-center justify-center">
          <span v-if="playerStore.currentSong?.id === song.id" class="text-ncm-red">
            <Icon icon="mdi:volume-high" />
          </span>
          <span v-else class="text-gray-500 group-hover:text-gray-300">{{ index + 1 }}</span>
        </div>

        <div class="flex items-center pr-4 overflow-hidden relative">
          <span
            class="truncate"
            :class="{ 'text-white': playerStore.currentSong?.id === song.id }"
            >{{ song.name }}</span
          >
          <span v-if="song.alia && song.alia.length" class="text-gray-500 ml-2 truncate">
            ({{ song.alia[0] }})
          </span>

          <div
            class="hidden group-hover:flex absolute right-0 top-0 bottom-0 bg-black/40 backdrop-blur-md pl-2 pr-2 space-x-3 items-center rounded-l-md"
          >
            <Icon
              icon="mdi:play-circle-outline"
              class="text-2xl text-gray-200 hover:text-white"
              title="播放"
              @click.stop="playTrack(song)"
            />
            <Icon
              icon="mdi:plus-circle-outline"
              class="text-2xl text-gray-200 hover:text-white"
              title="添加到下一首"
              @click.stop="addToQueue(song)"
            />
          </div>
        </div>

        <div class="truncate pr-4 text-gray-400 group-hover:text-gray-200">
          {{ song.ar.map((a: any) => a.name).join('/') }}
        </div>
        <div class="truncate pr-4 text-gray-400 group-hover:text-gray-200">
          {{ song.al.name }}
        </div>
        <div class="text-gray-500">{{ formatDuration(song.dt) }}</div>
      </div>
    </div>

    <div class="mt-8 text-center" v-if="hasMore">
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition disabled:opacity-50"
      >
        {{ loading ? '加载中...' : '加载更多歌曲' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import request from '../utils/request'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const playerStore = usePlayerStore()
const details = ref<any>(null)
const tracks = ref<any[]>([])
const loading = ref(false)
const offset = ref(0)
const limit = 50 // 每次加载 50 首，分页效果更明显
const hasMore = ref(true)

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 1000 / 60)
  const s = Math.floor((ms / 1000) % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const playTrack = (song: any) => {
  playerStore.setPlayList(tracks.value)
  const index = tracks.value.findIndex((t) => t.id === song.id)
  playerStore.currentIndex = index
  playerStore.playSong(song)
}

const playAll = () => {
  if (tracks.value.length > 0) {
    playerStore.setPlayList(tracks.value)
    playerStore.playSong(tracks.value[0])
  }
}

const addToQueue = (song: any) => {
  playerStore.addToQueue(song)
}

const loadData = async (id: string, append = false) => {
  if (!id) return
  loading.value = true
  if (!append) {
    tracks.value = []
    offset.value = 0
    hasMore.value = true
  }

  try {
    // 第一次才拉详情
    if (!append) {
      const res: any = await request.get(`/playlist/detail?id=${id}`)
      details.value = res.playlist
    }

    // 分页获取歌曲
    const trackRes: any = await request.get(
      `/playlist/track/all?id=${id}&limit=${limit}&offset=${offset.value}`
    )
    const newSongs = trackRes.songs || []

    tracks.value = append ? [...tracks.value, ...newSongs] : newSongs

    if (newSongs.length < limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  offset.value += limit
  loadData(route.params.id as string, true)
}

watch(
  () => route.params.id,
  (newId) => loadData(newId as string)
)
onMounted(() => loadData(route.params.id as string))
</script>
