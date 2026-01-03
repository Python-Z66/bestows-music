<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="mb-8">
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="20"
        :pagination="{ clickable: true }"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        class="w-full rounded-lg overflow-hidden h-48 sm:h-64 lg:h-72"
      >
        <swiper-slide v-for="banner in banners" :key="banner.imageUrl" class="cursor-pointer">
          <img :src="banner.imageUrl" class="w-full h-full object-cover" />
          <div
            class="absolute bottom-0 right-0 bg-ncm-red text-white text-xs px-2 py-1 rounded-tl-lg"
          >
            {{ banner.typeTitle }}
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white hover:underline cursor-pointer">推荐歌单</h2>
        <span
          class="text-xs text-gray-400 hover:text-white cursor-pointer flex items-center"
          @click="router.push('/playlist-square')"
        >
          查看更多 <Icon icon="mdi:chevron-right" class="text-sm" />
        </span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div
          v-for="item in playLists"
          :key="item.id"
          class="group cursor-pointer"
          @click="router.push(`/playlist/${item.id}`)"
        >
          <div
            class="relative aspect-square rounded-md overflow-hidden bg-gray-800 mb-2 border border-white/5"
          >
            <img
              :src="item.picUrl"
              class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              loading="lazy"
            />
            <div
              class="absolute top-1 right-1 text-xs text-white bg-black/20 backdrop-blur-sm px-1 rounded flex items-center"
            >
              <Icon icon="mdi:play-outline" class="mr-0.5 text-[10px]" />
              {{ formatCount(item.playCount) }}
            </div>
            <div
              class="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-ncm-red opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg translate-y-2 group-hover:translate-y-0"
            >
              <Icon icon="mdi:play" class="text-xl ml-0.5" />
            </div>
          </div>
          <div class="text-sm text-gray-200 leading-tight line-clamp-2 group-hover:text-white">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import request from '../utils/request'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const modules = [Pagination, Autoplay]
const router = useRouter()

const banners = ref<any[]>([])
const playLists = ref<any[]>([])

const formatCount = (count: number) => {
  if (count > 100000000) return (count / 100000000).toFixed(1) + '亿'
  if (count > 10000) return (count / 10000).toFixed(0) + '万'
  return count
}

onMounted(async () => {
  try {
    const bannerRes: any = await request.get('/banner?type=0')
    banners.value = bannerRes.banners
    const playlistRes: any = await request.get('/personalized?limit=10')
    playLists.value = playlistRes.result
  } catch (e) {
    console.error('加载发现页数据失败', e)
  }
})
</script>

<style>
.swiper-pagination-bullet-active {
  background-color: #ec4141 !important;
}
.swiper-pagination-bullet {
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
