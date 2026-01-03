<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
  >
    <div class="bg-[#2B2B2B] w-96 rounded-lg shadow-2xl p-6 border border-white/10 relative">
      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-400 hover:text-white">
        <Icon icon="mdi:close" class="text-xl" />
      </button>

      <h2 class="text-xl font-bold mb-6 text-gray-100">个性化皮肤</h2>

      <div class="mb-6">
        <label class="block text-sm text-gray-400 mb-2">背景图片</label>
        <div class="flex items-center space-x-3">
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />

          <button
            @click="triggerUpload"
            class="px-4 py-2 bg-ncm-red text-white rounded hover:bg-red-600 transition text-sm"
          >
            选择图片
          </button>
          <button
            @click="settingsStore.reset()"
            class="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition text-sm"
          >
            恢复默认
          </button>
        </div>
      </div>

      <div class="mb-2">
        <div class="flex justify-between text-sm text-gray-400 mb-2">
          <span>背景不透明度</span>
          <span>{{ Math.round(settingsStore.backgroundOpacity * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model="opacityValue"
          @input="updateOpacity"
          class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ncm-red"
        />
      </div>
      <p class="text-xs text-gray-500">拖动滑块调整图片显示的深浅</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../stores/settings'

const props = defineProps<{ show: boolean }>()
defineEmits(['close'])

const settingsStore = useSettingsStore()
const fileInput = ref<HTMLInputElement | null>(null)
const opacityValue = ref(settingsStore.backgroundOpacity)

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件读取 (转 Base64)
const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 限制一下大小，Localstorage 只有 5MB 左右，太大的图存不进去
  // 生产环境应该存文件路径，这里为了简单直接存 Base64
  if (file.size > 2 * 1024 * 1024) {
    alert('为了性能，请选择 2MB 以内的图片')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      settingsStore.setBackgroundImage(event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
}

// 实时更新透明度
const updateOpacity = () => {
  settingsStore.setOpacity(Number(opacityValue.value))
}

// 监听 store 变化同步到滑块（防止重置时滑块不动）
watch(
  () => settingsStore.backgroundOpacity,
  (val) => {
    opacityValue.value = val
  }
)
</script>
