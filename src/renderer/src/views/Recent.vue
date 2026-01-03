<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">最近播放 (一周内)</h1>

    <div v-if="!userStore.isLoggedIn" class="text-center text-gray-500 mt-20">
      <p>请登录查看播放记录</p>
    </div>

    <div v-else>
      <div
        v-for="(item, index) in songs"
        :key="item.song.id"
        class="grid grid-cols-[50px_4fr_2fr_2fr_60px] text-sm text-gray-400 py-3 px-2 hover:bg-white/5 rounded-md cursor-pointer group items-center odd:bg-white/5"
        @dblclick="playSingle(item.song)"
      >
        <div class="flex justify-center text-xs text-ncm-red font-bold">
          {{ index + 1 }}
        </div>

        <div class="text-white font-medium truncate pr-4">
          {{ item.song.name }}
        </div>

        <div class="truncate pr-4 text-xs">
          {{ item.song.ar.map((a: any) => a.name).join('/') }}
        </div>
        <div class="truncate pr-4 text-xs">{{ item.song.al.name }}</div>
        <div class="text-xs flex items-center">
          <Icon icon="mdi:play-outline" class="mr-1" /> {{ item.playCount }}次
        </div>
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

const loadData = async () => {
  if (!userStore.profile?.userId) return
  try {
    // type=1: 最近一周, type=0: 所有时间
    const res: any = await request.get(`/user/record?uid=${userStore.profile.userId}&type=1`)
    songs.value = res.weekData
  } catch (e) {
    console.error(e)
  }
}

const playSingle = (song: any) => {
  playerStore.addToQueue(song)
  playerStore.playSong(song)
}

watch(
  () => userStore.isLoggedIn,
  (val) => {
    if (val) loadData()
  }
)

onMounted(() => {
  if (userStore.isLoggedIn) loadData()
})
</script>
