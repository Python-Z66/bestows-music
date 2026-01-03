<template>
  <div class="p-10 max-w-4xl mx-auto pb-24 scroll-smooth">
    <h1 class="text-3xl font-bold mb-8">设置</h1>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">常规</h2>
      <div class="bg-white/5 rounded-xl p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-medium">开机自动启动</div>
            <div class="text-sm text-gray-400">系统启动时自动运行 Bestows Music</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="launchAtStartup"
              class="sr-only peer"
              @change="updateLaunch"
            />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ncm-red"
            ></div>
          </label>
        </div>

        <div>
          <div class="text-base font-medium mb-3">点击关闭按钮时</div>
          <div class="flex space-x-6">
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                value="minimize"
                v-model="closeOption"
                @change="updateCloseOption"
                class="w-4 h-4 text-ncm-red bg-gray-700 border-gray-600 focus:ring-ncm-red"
              />
              <span class="ml-2 text-sm text-gray-300">最小化到系统托盘</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                value="quit"
                v-model="closeOption"
                @change="updateCloseOption"
                class="w-4 h-4 text-ncm-red bg-gray-700 border-gray-600 focus:ring-ncm-red"
              />
              <span class="ml-2 text-sm text-gray-300">退出应用</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">桌面歌词</h2>
      <div class="bg-white/5 rounded-xl p-6 space-y-6">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span>字体大小</span>
            <span>{{ lyricFontSize }}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            step="2"
            v-model="lyricFontSize"
            @input="updateLyricStyle"
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ncm-red"
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-medium">高亮颜色</div>
            <div class="text-sm text-gray-400">歌词播放时的渐变主色调</div>
          </div>
          <div class="flex items-center space-x-2 bg-white/10 p-2 rounded-lg">
            <input
              type="color"
              v-model="lyricColor"
              @change="updateLyricStyle"
              class="h-8 w-14 bg-transparent border-0 cursor-pointer rounded"
            />
            <span class="text-xs text-gray-300 font-mono w-16 text-center">{{ lyricColor }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">个性化</h2>
      <div class="bg-white/5 rounded-xl p-6">
        <div class="flex items-start mb-6">
          <div class="flex-1">
            <div class="text-base font-medium mb-1">自定义背景</div>
            <div class="text-sm text-gray-400">选择一张图片作为应用背景</div>
          </div>
          <div class="flex space-x-3">
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
            <button
              @click="triggerUpload"
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition"
            >
              上传图片
            </button>
            <button
              @click="settingsStore.reset()"
              class="px-4 py-2 text-gray-400 hover:text-white text-sm transition"
            >
              恢复默认
            </button>
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2">
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
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-ncm-red"
          />
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">关于 & 支持</h2>
      <div class="bg-white/5 rounded-xl p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div
            class="w-16 h-16 bg-ncm-red rounded-full flex items-center justify-center text-3xl text-white shadow-lg"
          >
            B
          </div>
          <div>
            <div class="text-xl font-bold">Bestows Music</div>
            <div class="text-sm text-gray-400">Version 1.0.0 (Electron + Vue3)</div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://github.com/Python-Z66"
            target="_blank"
            class="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer group"
          >
            <Icon icon="mdi:github" class="text-3xl mr-4 text-gray-300 group-hover:text-white" />
            <div>
              <div class="font-medium group-hover:text-ncm-red">GitHub</div>
              <div class="text-xs text-gray-500">查看源码，提交 Issue</div>
            </div>
          </a>
          <a
            href="https://gitee.com/bestows_zth"
            class="flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer group"
          >
            <Icon icon="mdi:coffee" class="text-3xl mr-4 text-gray-300 group-hover:text-white" />
            <div>
              <div class="font-medium group-hover:text-ncm-red">Gitee</div>
              <div class="text-xs text-gray-500">查看源码，提交 Issue</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const fileInput = ref<HTMLInputElement | null>(null)
const opacityValue = ref(settingsStore.backgroundOpacity)

// 绑定状态
const launchAtStartup = ref(settingsStore.launchAtStartup)
const closeOption = ref(settingsStore.closeOption)
const lyricColor = ref(settingsStore.lyricColor)
const lyricFontSize = ref(settingsStore.lyricFontSize)

// 更新处理
const updateLaunch = () => settingsStore.setLaunchAtStartup(launchAtStartup.value)
const updateCloseOption = () => settingsStore.setCloseOption(closeOption.value)
const updateLyricStyle = () =>
  settingsStore.setLyricStyle(lyricColor.value, Number(lyricFontSize.value))

const triggerUpload = () => fileInput.value?.click()
const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) return alert('请选择 5MB 以内的图片')
  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) settingsStore.setBackgroundImage(event.target.result as string)
  }
  reader.readAsDataURL(file)
}
const updateOpacity = () => settingsStore.setOpacity(Number(opacityValue.value))
watch(
  () => settingsStore.backgroundOpacity,
  (val) => (opacityValue.value = val)
)
</script>
