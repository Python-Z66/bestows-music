<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6 flex items-center">
      <button @click="$router.back()" class="mr-4 hover:text-white text-gray-400 transition">
        <Icon icon="mdi:arrow-left" />
      </button>
      歌单广场
    </h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="item in playlists"
        :key="item.id"
        class="group cursor-pointer"
        @click="$router.push(`/playlist/${item.id}`)"
      >
        <div
          class="relative aspect-square rounded-md overflow-hidden bg-gray-800 mb-2 border border-white/5"
        >
          <img
            :src="item.coverImgUrl"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            loading="lazy"
          />
          <div
            class="absolute top-1 right-1 text-xs text-white bg-black/40 backdrop-blur-sm px-1 rounded flex items-center"
          >
            <Icon icon="mdi:play-outline" class="mr-0.5 text-[10px]" />
            {{ formatCount(item.playCount) }}
          </div>
          <div
            class="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-ncm-red opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg"
          >
            <Icon icon="mdi:play" class="text-xl ml-0.5" />
          </div>
        </div>
        <div class="text-sm text-gray-200 leading-tight line-clamp-2 group-hover:text-white">
          {{ item.name }}
        </div>
      </div>
    </div>

    <div class="mt-10 text-center">
      <div v-if="loading" class="text-gray-500">加载中...</div>
      <button
        v-else-if="hasMore"
        @click="loadMore"
        class="px-8 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition"
      >
        加载更多
      </button>
      <div v-else class="text-gray-600 text-sm">没有更多了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Icon } from '@iconify/vue'

const playlists = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 30

const formatCount = (count: number) => {
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(0) + '万'
  return count
}

const loadData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    // 获取精选歌单
    const res: any = await request.get(`/top/playlist?limit=${limit}&offset=${offset.value}`)
    if (res.playlists && res.playlists.length > 0) {
      playlists.value = [...playlists.value, ...res.playlists]
      offset.value += limit
    } else {
      hasMore.value = false
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
