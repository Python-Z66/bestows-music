<template>
  <div class="p-8 pb-24">
    <div class="flex items-end mb-6">
      <h1 class="text-2xl font-bold mr-4">搜索结果</h1>
      <span class="text-sm text-gray-400 mb-1">"{{ keywords }}"</span>
    </div>

    <div class="flex space-x-8 border-b border-white/10 mb-6 text-sm">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        @click="changeTab(tab.value)"
        class="pb-2 cursor-pointer transition-colors border-b-2"
        :class="
          currentType === tab.value
            ? 'border-ncm-red text-white font-bold'
            : 'border-transparent text-gray-400 hover:text-white'
        "
      >
        {{ tab.label }}
      </div>
    </div>

    <div v-if="currentType === 1 && songs.length > 0">
      <div
        v-for="(song, index) in songs"
        :key="song.id"
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-sm text-gray-400 py-3 px-2 hover:bg-white/10 rounded-md cursor-pointer group items-center odd:bg-white/5"
        @dblclick="playSingle(song)"
      >
        <div class="flex justify-center text-xs">
          {{ index + 1 < 10 ? '0' + (index + 1) : index + 1 }}
        </div>
        <div class="text-white font-medium truncate pr-4">
          <span v-html="highlight(song.name)"></span>
        </div>
        <div class="truncate pr-4 text-xs">
          <span
            v-for="(ar, i) in song.ar"
            :key="ar.id"
            class="hover:text-white cursor-pointer"
            @click.stop="router.push(`/artist/${ar.id}`)"
          >
            {{ ar.name }}<span v-if="i < song.ar.length - 1"> / </span>
          </span>
        </div>
        <div
          class="truncate pr-4 text-xs cursor-pointer hover:text-white"
          @click.stop="router.push(`/album/${song.al.id}`)"
        >
          {{ song.al ? song.al.name : '未知' }}
        </div>
        <div class="text-xs">{{ formatDuration(song.dt) }}</div>
      </div>
    </div>

    <div v-else-if="currentType === 1000 && playlists.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div
          v-for="item in playlists"
          :key="item.id"
          class="group cursor-pointer"
          @click="router.push(`/playlist/${item.id}`)"
        >
          <div class="relative aspect-square rounded-md overflow-hidden mb-2">
            <img :src="item.coverImgUrl" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute top-1 right-1 text-xs text-white bg-black/40 px-1 rounded">
              ▷ {{ formatCount(item.playCount) }}
            </div>
          </div>
          <div class="text-sm text-gray-200 line-clamp-2 group-hover:text-white">
            {{ item.name }}
          </div>
          <div class="text-xs text-gray-500 mt-1">by {{ item.creator.nickname }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="currentType === 100 && artists.length > 0">
      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div
          v-for="item in artists"
          :key="item.id"
          class="flex flex-col items-center group cursor-pointer"
          @click="router.push(`/artist/${item.id}`)"
        >
          <div
            class="w-full aspect-square rounded-md overflow-hidden mb-2 bg-gray-800 border border-white/5"
          >
            <img
              :src="item.picUrl || item.img1v1Url"
              class="w-full h-full object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
          </div>
          <div class="text-sm text-gray-200 group-hover:text-white font-medium">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="text-gray-500 mt-10 text-center">未找到相关结果</div>

    <div
      class="mt-8 text-center"
      v-if="(songs.length > 0 || playlists.length > 0 || artists.length > 0) && hasMore"
    >
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition disabled:opacity-50"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../utils/request'
import { usePlayerStore } from '../stores/player'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()

const keywords = ref('')
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 30
const currentType = ref(1)

const tabs = [
  { label: '单曲', value: 1 },
  { label: '歌单', value: 1000 },
  { label: '歌手', value: 100 }
]

const songs = ref<any[]>([])
const playlists = ref<any[]>([])
const artists = ref<any[]>([])

const formatDuration = (ms: number) => {
  const m = Math.floor(ms / 1000 / 60)
  const s = Math.floor((ms / 1000) % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatCount = (count: number) => {
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(0) + '万'
  return count
}

const highlight = (text: string) => {
  return text.replace(new RegExp(keywords.value, 'gi'), '<span class="text-ncm-red">$&</span>')
}

const changeTab = (type: number) => {
  currentType.value = type
  offset.value = 0
  hasMore.value = true
  if (type === 1) songs.value = []
  if (type === 1000) playlists.value = []
  if (type === 100) artists.value = []
  search()
}

const loadMore = () => {
  offset.value += limit
  search(true)
}

const search = async (append = false) => {
  if (!keywords.value) return
  loading.value = true

  try {
    const res: any = await request.get(
      `/cloudsearch?keywords=${encodeURIComponent(keywords.value)}&type=${currentType.value}&limit=${limit}&offset=${offset.value}`
    )

    let newItems: any[] = []

    if (currentType.value === 1) {
      newItems = res.result?.songs || []
      songs.value = append ? [...songs.value, ...newItems] : newItems
    } else if (currentType.value === 1000) {
      newItems = res.result?.playlists || []
      playlists.value = append ? [...playlists.value, ...newItems] : newItems
    } else if (currentType.value === 100) {
      newItems = res.result?.artists || []
      artists.value = append ? [...artists.value, ...newItems] : newItems
    }

    hasMore.value = newItems.length >= limit
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const playSingle = (song: any) => {
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}

watch(
  () => route.query.q,
  (newVal) => {
    if (newVal) {
      keywords.value = newVal as string
      offset.value = 0
      hasMore.value = true
      search()
    }
  },
  { immediate: true }
)

watch(
  () => route.query.t,
  () => {
    offset.value = 0
    hasMore.value = true
    search()
  }
)

onMounted(() => {
  if (route.query.q) {
    keywords.value = route.query.q as string
    search()
  }
})
</script>
