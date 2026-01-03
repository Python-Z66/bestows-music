<template>
  <div class="p-8 pb-24">
    <h1 class="text-2xl font-bold mb-6">关注动态</h1>

    <div v-if="!userStore.isLoggedIn" class="text-center text-gray-500 mt-20">
      <Icon icon="mdi:account-lock" class="text-6xl mx-auto mb-4 opacity-50" />
      <p>请先登录以查看关注动态</p>
    </div>

    <div v-else class="max-w-3xl mx-auto">
      <div v-for="event in events" :key="event.id" class="mb-8 border-b border-white/5 pb-6">
        <div class="flex items-center mb-3">
          <img :src="event.user.avatarUrl" class="w-10 h-10 rounded-full mr-3" />
          <div>
            <div class="text-sm text-blue-400 font-medium">{{ event.user.nickname }}</div>
            <div class="text-xs text-gray-500">
              {{ new Date(event.eventTime).toLocaleString() }}
            </div>
          </div>
        </div>

        <div class="text-sm text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap">
          {{ parseMsg(event.json) }}
        </div>

        <div
          v-if="event.pics && event.pics.length"
          class="grid gap-2 mb-3"
          :class="event.pics.length > 1 ? 'grid-cols-3' : 'grid-cols-1 w-2/3'"
        >
          <img
            v-for="pic in event.pics"
            :src="pic.originUrl"
            class="rounded-lg object-cover w-full h-full"
          />
        </div>
      </div>

      <div v-if="events.length === 0" class="text-center text-gray-500">暂无动态</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { useUserStore } from '../stores/user'
import { Icon } from '@iconify/vue'

const userStore = useUserStore()
const events = ref<any[]>([])

const parseMsg = (jsonStr: string) => {
  try {
    const obj = JSON.parse(jsonStr)
    return obj.msg || ''
  } catch (e) {
    return ''
  }
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    try {
      const res: any = await request.get('/event?pagesize=20')
      events.value = res.event
    } catch (e) {
      console.error(e)
    }
  }
})
</script>
