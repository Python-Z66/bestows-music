<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">推荐播客</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="item in djPrograms"
        :key="item.id"
        class="group cursor-pointer"
        @click="playRadio(item)"
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
            class="absolute bottom-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-ncm-red opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-lg"
          >
            <Icon icon="mdi:play" class="text-xl ml-0.5" />
          </div>
          <div class="absolute top-1 left-1 bg-black/40 px-2 py-0.5 rounded text-[10px] text-white">
            {{ item.category }}
          </div>
        </div>
        <div class="text-sm text-gray-200 leading-tight line-clamp-2 group-hover:text-white">
          {{ item.name }}
        </div>
        <div class="text-xs text-gray-500 mt-1 truncate">
          {{ item.program?.radio?.name || item.copywriter }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { Icon } from '@iconify/vue'
import { usePlayerStore } from '../stores/player'

const djPrograms = ref<any[]>([])
const playerStore = usePlayerStore()

// 播放电台节目 (其实也是歌曲的一种)
const playRadio = async (item: any) => {
  if (item.program?.mainSong) {
    playerStore.addToQueue(item.program.mainSong)
    playerStore.playSong(item.program.mainSong)
  }
}

onMounted(async () => {
  try {
    const res: any = await request.get('/personalized/djprogram')
    djPrograms.value = res.result
  } catch (e) {
    console.error(e)
  }
})
</script>
