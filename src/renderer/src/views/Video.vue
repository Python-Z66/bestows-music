<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">全部 MV</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="item in videos" :key="item.id" class="group cursor-pointer">
        <div
          class="relative aspect-video rounded-md overflow-hidden bg-gray-800 mb-2 border border-white/5"
        >
          <img
            :src="item.cover"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div
            class="absolute top-1 right-1 text-xs text-white bg-black/40 backdrop-blur-sm px-1 rounded flex items-center"
          >
            <Icon icon="mdi:play-outline" class="mr-0.5 text-[10px]" />
            {{ formatCount(item.playCount) }}
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <Icon icon="mdi:play-circle-outline" class="text-5xl text-white/80" />
          </div>
        </div>
        <div class="text-sm text-gray-200 leading-tight line-clamp-1 group-hover:text-white">
          {{ item.name }}
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ item.artistName }}
        </div>
      </div>
    </div>

    <div class="mt-10 text-center">
      <button
        v-if="hasMore"
        @click="loadMore"
        :disabled="loading"
        class="px-8 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-300 transition disabled:opacity-50"
      >
        {{ loading ? '加载中...' : '加载更多 MV' }}
      </button>
      <div v-else class="text-gray-600 text-sm">到底啦</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Icon } from '@iconify/vue'

const videos = ref<any[]>([])
const loading = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 20

const formatCount = (count: number) => {
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(0) + '万'
  return count
}

const loadData = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    // 使用 /mv/all 接口支持分页
    const res: any = await request.get(`/mv/all?limit=${limit}&offset=${offset.value}`)
    const newItems = res.data || []

    if (append) {
      videos.value = [...videos.value, ...newItems]
    } else {
      videos.value = newItems
    }

    if (newItems.length < limit) hasMore.value = false
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

onMounted(() => {
  loadData()
})
</script>
