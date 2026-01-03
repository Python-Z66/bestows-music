<template>
  <div class="p-8 pb-24" v-if="artist">
    <div class="flex space-x-8 mb-8">
      <div
        class="relative w-52 h-52 flex-shrink-0 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl"
      >
        <img :src="artist.cover" class="w-full h-full object-cover" />
      </div>
      <div class="flex flex-col justify-end py-2">
        <h1 class="text-4xl font-bold mb-3 text-white">{{ artist.name }}</h1>
        <div class="text-sm text-gray-400 mb-6 flex items-center space-x-4">
          <span v-if="artist.transNames?.length">译名: {{ artist.transNames[0] }}</span>
          <span>单曲数: {{ artist.musicSize }}</span>
          <span>专辑数: {{ artist.albumSize }}</span>
          <span>MV数: {{ artist.mvSize }}</span>
        </div>
        <div class="flex space-x-3">
          <button
            class="bg-ncm-red text-white px-6 py-2 rounded-full hover:bg-red-600 transition flex items-center shadow-lg shadow-red-500/20"
            @click="playHotSongs"
          >
            <Icon icon="mdi:play" class="mr-1 text-xl" /> 播放热门50首
          </button>
          <button
            class="border border-white/20 text-gray-200 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            收藏
          </button>
        </div>
      </div>
    </div>

    <div class="flex space-x-8 border-b border-white/10 mb-6 text-sm">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        @click="currentTab = tab.key"
        class="pb-2 cursor-pointer transition-colors border-b-2"
        :class="
          currentTab === tab.key
            ? 'border-ncm-red text-white font-bold'
            : 'border-transparent text-gray-400 hover:text-white'
        "
      >
        {{ tab.label }}
      </div>
    </div>

    <div v-show="currentTab === 'songs'">
      <div
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-xs text-gray-400 border-b border-white/10 pb-2 px-2"
      >
        <span>#</span><span>标题</span><span>专辑</span><span>时长</span>
      </div>
      <div
        v-for="(song, index) in hotSongs"
        :key="song.id"
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-sm text-gray-300 py-3 px-2 hover:bg-white/10 rounded-md cursor-pointer group transition-colors items-center odd:bg-white/5"
        @dblclick="playSong(song)"
      >
        <div class="flex justify-center text-xs text-gray-500">{{ index + 1 }}</div>
        <div class="text-white font-medium truncate pr-4">{{ song.name }}</div>
        <div class="truncate pr-4 text-xs text-gray-400">{{ song.al.name }}</div>
        <div class="text-xs text-gray-500">{{ formatDuration(song.dt) }}</div>
      </div>
    </div>

    <div
      v-show="currentTab === 'albums'"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
    >
      <div
        v-for="album in albums"
        :key="album.id"
        class="group cursor-pointer"
        @click="router.push(`/album/${album.id}`)"
      >
        <div class="relative aspect-square rounded-md overflow-hidden bg-gray-800 mb-2">
          <img
            :src="album.picUrl"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            loading="lazy"
          />
          <div
            class="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-ncm-red opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg"
          >
            <Icon icon="mdi:play" class="text-xl ml-0.5" />
          </div>
        </div>
        <div class="text-sm text-gray-200 line-clamp-1 group-hover:text-white">
          {{ album.name }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ new Date(album.publishTime).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <div v-show="currentTab === 'mvs'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="mv in mvs"
        :key="mv.id"
        class="group cursor-pointer"
        @click="router.push(`/mv/${mv.id}`)"
      >
        <div class="relative aspect-video rounded-md overflow-hidden bg-gray-800 mb-2">
          <img
            :src="mv.imgurl"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <Icon icon="mdi:play-circle-outline" class="text-5xl text-white/80" />
          </div>
        </div>
        <div class="text-sm text-gray-200 line-clamp-1 group-hover:text-white">{{ mv.name }}</div>
      </div>
    </div>

    <div
      v-show="currentTab === 'desc'"
      class="max-w-4xl text-gray-300 leading-7 whitespace-pre-wrap"
    >
      {{ desc }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import request from '../utils/request'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const artist = ref<any>(null)
const hotSongs = ref<any[]>([])
const albums = ref<any[]>([])
const mvs = ref<any[]>([])
const desc = ref('')
const currentTab = ref('songs')

const tabs = [
  { key: 'songs', label: '热门歌曲' },
  { key: 'albums', label: '专辑' },
  { key: 'mvs', label: 'MV' },
  { key: 'desc', label: '歌手详情' }
]

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 1000 / 60)
  const s = Math.floor((ms / 1000) % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const playSong = (song: any) => {
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}

const playHotSongs = () => {
  if (hotSongs.value.length) {
    playerStore.setPlayList(hotSongs.value)
    playerStore.playSong(hotSongs.value[0])
  }
}

const loadData = async (id: string) => {
  if (!id) return
  try {
    // 歌手详情
    const res: any = await request.get(`/artist/detail?id=${id}`)
    artist.value = res.data.artist

    // 热门50首
    const songsRes: any = await request.get(`/artist/top/song?id=${id}`)
    hotSongs.value = songsRes.songs

    // 专辑
    const albumRes: any = await request.get(`/artist/album?id=${id}&limit=50`)
    albums.value = albumRes.hotAlbums

    // MV
    const mvRes: any = await request.get(`/artist/mv?id=${id}&limit=50`)
    mvs.value = mvRes.mvs

    // 描述
    const descRes: any = await request.get(`/artist/desc?id=${id}`)
    desc.value = descRes.briefDesc
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => route.params.id,
  (newId) => loadData(newId as string)
)
onMounted(() => loadData(route.params.id as string))
</script>
