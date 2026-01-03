<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">我的音乐云盘</h1>

    <div v-if="!userStore.isLoggedIn" class="text-center text-gray-500 mt-20">
      <p>请登录查看云盘音乐</p>
    </div>

    <div v-else>
      <div
        v-for="(item, index) in songs"
        :key="item.songId"
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-sm text-gray-400 py-3 px-2 hover:bg-white/5 rounded-md cursor-pointer group items-center odd:bg-white/5"
        @dblclick="playSingle(item.simpleSong)"
      >
        <div class="flex justify-center text-xs">
          {{ index + 1 }}
        </div>

        <div class="text-white font-medium truncate pr-4">
          {{ item.songName }}
        </div>

        <div class="truncate pr-4 text-xs">{{ item.artist }}</div>
        <div class="truncate pr-4 text-xs">{{ item.album }}</div>
        <div class="text-xs">
          <Icon icon="mdi:cloud-check" class="text-gray-500" />
        </div>
      </div>

      <div class="mt-8 text-center" v-if="hasMore">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition disabled:opacity-50"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
      <div v-else-if="songs.length > 0" class="mt-8 text-center text-gray-600 text-xs">
        没有更多了
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import request from '../utils/request'
import { useUserStore } from '../stores/user'
import { usePlayerStore } from '../stores/player'
import { Icon } from '@iconify/vue'

const userStore = useUserStore()
const playerStore = usePlayerStore()
const songs = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 30

const loadData = async (append = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const res: any = await request.get(`/user/cloud?limit=${limit}&offset=${offset.value}`)
    const newSongs = res.data || []

    if (append) {
      songs.value = [...songs.value, ...newSongs]
    } else {
      songs.value = newSongs
    }

    hasMore.value = res.hasMore && newSongs.length >= limit
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  offset.value += limit
  loadData(true)
}

const playSingle = (song: any) => {
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}

watch(
  () => userStore.isLoggedIn,
  (val) => {
    if (val) {
      offset.value = 0
      loadData()
    }
  }
)

onMounted(() => {
  if (userStore.isLoggedIn) loadData()
})
</script>
