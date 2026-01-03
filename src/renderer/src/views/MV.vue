<template>
  <div class="p-6 max-w-6xl mx-auto pb-24 flex space-x-6" v-if="mvDetail">
    <div class="flex-1 min-w-0">
      <div class="text-xl font-bold mb-4 flex items-center">
        <button @click="$router.back()" class="mr-4 hover:text-white text-gray-400 transition">
          <Icon icon="mdi:arrow-left" />
        </button>
        {{ mvDetail.name }}
      </div>

      <div class="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 shadow-2xl relative">
        <video
          v-if="mvUrl"
          :src="mvUrl"
          controls
          autoplay
          class="w-full h-full"
          controlsList="nodownload"
        ></video>
        <div v-else class="absolute inset-0 flex items-center justify-center text-gray-500">
          加载视频中...
        </div>
      </div>

      <div class="mb-6">
        <div class="flex items-center space-x-4 mb-3">
          <div
            class="text-blue-400 cursor-pointer text-lg"
            @click="router.push(`/artist/${mvDetail.artistId}`)"
          >
            {{ mvDetail.artistName }}
          </div>
        </div>
        <div class="text-gray-400 text-sm mb-2">
          发布：{{ mvDetail.publishTime }} &nbsp;&nbsp;|&nbsp;&nbsp; 播放：{{
            formatCount(mvDetail.playCount)
          }}
        </div>
        <div class="text-gray-500 text-sm whitespace-pre-wrap">{{ mvDetail.desc }}</div>
      </div>
    </div>

    <div class="w-80 flex-shrink-0 hidden lg:block">
      <div class="text-lg font-bold mb-4">相关推荐</div>
      <div
        v-for="item in simiMvs"
        :key="item.id"
        class="flex mb-4 cursor-pointer group"
        @click="changeMv(item.id)"
      >
        <div
          class="w-36 aspect-video bg-gray-800 rounded overflow-hidden mr-3 relative flex-shrink-0"
        >
          <img :src="item.cover" class="w-full h-full object-cover" />
          <div class="absolute top-1 right-1 text-[10px] text-white bg-black/40 px-1 rounded">
            {{ formatCount(item.playCount) }}
          </div>
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="text-sm text-gray-200 line-clamp-2 mb-1 group-hover:text-white transition">
            {{ item.name }}
          </div>
          <div class="text-xs text-gray-500 truncate">by {{ item.artistName }}</div>
        </div>
      </div>
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

const mvDetail = ref<any>(null)
const mvUrl = ref('')
const simiMvs = ref<any[]>([])

const formatCount = (count: number) => {
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(0) + '万'
  return count
}

const loadData = async (id: string) => {
  if (!id) return
  // 暂停音乐播放
  playerStore.togglePlay()
  if (playerStore.isPlaying) playerStore.togglePlay() // 确保是暂停状态

  try {
    // MV详情
    const detailRes: any = await request.get(`/mv/detail?mvid=${id}`)
    mvDetail.value = detailRes.data

    // MV地址
    const urlRes: any = await request.get(`/mv/url?id=${id}`)
    mvUrl.value = urlRes.data.url

    // 相关MV
    const simiRes: any = await request.get(`/simi/mv?mvid=${id}`)
    simiMvs.value = simiRes.mvs
  } catch (e) {
    console.error(e)
  }
}

const changeMv = (id: string) => {
  router.push(`/mv/${id}`)
}

watch(
  () => route.params.id,
  (newId) => loadData(newId as string)
)
onMounted(() => loadData(route.params.id as string))
</script>
