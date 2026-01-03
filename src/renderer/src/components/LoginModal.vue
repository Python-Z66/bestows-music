<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
  >
    <div
      class="bg-ncm-bg w-80 rounded-lg shadow-2xl p-6 flex flex-col items-center relative border border-white/10"
    >
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-white">
        <Icon icon="mdi:close" class="text-xl" />
      </button>

      <h2 class="text-xl font-bold mb-6">扫码登录</h2>

      <div class="relative w-40 h-40 mb-4">
        <img
          v-if="userStore.qrImg"
          :src="userStore.qrImg"
          class="w-full h-full rounded shadow-lg"
          alt="QR Code"
        />

        <div
          v-if="userStore.qrStatus === 800"
          class="absolute inset-0 bg-black/80 flex items-center justify-center flex-col cursor-pointer"
          @click="refreshQr"
        >
          <div class="text-ncm-red font-bold">二维码已过期</div>
          <div class="text-xs mt-1 text-gray-300">点击刷新</div>
        </div>
      </div>

      <div class="text-sm text-gray-400 text-center h-5">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useUserStore } from '../stores/user'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits(['close'])
const userStore = useUserStore()

let timer: any = null

const statusText = computed(() => {
  switch (userStore.qrStatus) {
    case 800:
      return '二维码过期，请点击刷新'
    case 801:
      return '请使用网易云音乐APP扫码'
    case 802:
      return '扫码成功，请在手机上确认'
    case 803:
      return '登录成功！正在跳转...'
    default:
      return '加载中...'
  }
})

// 刷新二维码
const refreshQr = async () => {
  clearInterval(timer)
  const key = await userStore.getQrKey()
  await userStore.createQrImg(key)
  userStore.qrStatus = 801

  // 开始轮询，每3秒查一次
  timer = setInterval(async () => {
    const code = await userStore.checkQrStatus()
    if (code === 803) {
      clearInterval(timer)
      setTimeout(() => {
        emit('close') // 登录成功关闭弹窗
      }, 1000)
    }
    if (code === 800) {
      clearInterval(timer) // 过期停止轮询
    }
  }, 3000)
}

// 监听弹窗显示，显示时自动加载
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      refreshQr()
    } else {
      clearInterval(timer)
    }
  }
)

onUnmounted(() => {
  clearInterval(timer)
})
</script>
