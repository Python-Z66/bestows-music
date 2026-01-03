<template>
  <div class="p-10 max-w-4xl mx-auto pb-24 scroll-smooth">
    <h1 class="text-3xl font-bold mb-8">设置</h1>

    <section class="mb-12">
      <h2 class="text-lg font-bold mb-4 text-gray-300">常规设置</h2>
      <div class="bg-white/5 rounded-2xl p-6 space-y-6 border border-white/5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-medium">开机自动启动</div>
            <div class="text-sm text-gray-500 mt-1">系统启动时自动运行 Bestows Music</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="launchAtStartup"
              class="sr-only peer"
              @change="updateLaunch"
            />
            <div
              class="w-12 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-ncm-red transition-colors"
            ></div>
          </label>
        </div>

        <div class="pt-4 border-t border-white/5">
          <div class="text-base font-medium mb-3">点击关闭按钮时</div>
          <div class="flex gap-6">
            <label
              class="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition"
            >
              <input
                type="radio"
                value="minimize"
                v-model="closeOption"
                @change="updateCloseOption"
                class="w-4 h-4 accent-ncm-red cursor-pointer"
              />
              <span class="ml-3 text-sm text-gray-400 group-hover:text-white transition"
                >最小化到托盘</span
              >
            </label>
            <label
              class="flex items-center cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition"
            >
              <input
                type="radio"
                value="quit"
                v-model="closeOption"
                @change="updateCloseOption"
                class="w-4 h-4 accent-ncm-red cursor-pointer"
              />
              <span class="ml-3 text-sm text-gray-400 group-hover:text-white transition"
                >直接退出应用</span
              >
            </label>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-lg font-bold mb-4 text-gray-300">桌面歌词样式</h2>
      <div class="bg-white/5 rounded-2xl p-6 space-y-8 border border-white/5">
        <div class="grid grid-cols-2 gap-8">
          <div>
            <label class="block text-sm text-gray-400 mb-3">字体系列</label>
            <div class="relative">
              <select
                v-model="lyricFontFamily"
                @change="updateLyric"
                class="w-full bg-[#2B2B2B] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-ncm-red appearance-none cursor-pointer"
              >
                <option value='"Arial Rounded MT Bold", "Microsoft YaHei", sans-serif'>
                  默认圆体
                </option>
                <option value='"Microsoft YaHei", sans-serif'>微软雅黑</option>
                <option value='"Times New Roman", serif'>衬线宋体</option>
                <option value="cursive">艺术手写</option>
                <option value="monospace">极客等宽</option>
              </select>
              <Icon
                icon="mdi:chevron-down"
                class="absolute right-3 top-3 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-3">对齐方式</label>
            <div class="flex bg-[#2B2B2B] rounded-lg p-1 border border-white/10">
              <button
                v-for="align in ['left', 'center', 'right']"
                :key="align"
                @click="lyricTextAlign = align;
                  updateLyric()
                "
                class="flex-1 py-1.5 rounded-md transition-all flex items-center justify-center"
                :class="
                  lyricTextAlign === align
                    ? 'bg-white/10 text-ncm-red shadow-sm'
                    : 'text-gray-500 hover:text-white'
                "
              >
                <Icon :icon="`mdi:format-align-${align}`" class="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">字体大小</span>
              <span class="font-mono text-ncm-red">{{ lyricFontSize }}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="2"
              v-model="lyricFontSize"
              @input="updateLyric"
              class="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ncm-red hover:bg-gray-600 transition"
            />
          </div>
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">描边粗细</span>
              <span class="font-mono text-ncm-red">{{ lyricStrokeWidth }}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              v-model="lyricStrokeWidth"
              @input="updateLyric"
              class="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-ncm-red hover:bg-gray-600 transition"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 pt-2">
          <div
            class="flex items-center justify-between bg-[#2B2B2B] p-4 rounded-xl border border-white/5"
          >
            <span class="text-sm font-medium">高亮颜色</span>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500 font-mono">{{ lyricColor }}</span>
              <div
                class="relative w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer hover:scale-110 transition shadow-inner"
                :style="{ backgroundColor: lyricColor }"
              >
                <input
                  type="color"
                  v-model="lyricColor"
                  @change="updateLyric"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between bg-[#2B2B2B] p-4 rounded-xl border border-white/5"
          >
            <span class="text-sm font-medium">描边颜色</span>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500 font-mono">{{ lyricStrokeColor }}</span>
              <div
                class="relative w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden cursor-pointer hover:scale-110 transition shadow-inner"
                :style="{ backgroundColor: lyricStrokeColor }"
              >
                <input
                  type="color"
                  v-model="lyricStrokeColor"
                  @change="updateLyric"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-lg font-bold mb-4 text-gray-300">外观与主题</h2>
      <div class="bg-white/5 rounded-2xl p-6 border border-white/5">
        <div class="text-base font-medium mb-4">全局主题色</div>
        <div class="flex flex-wrap gap-4">
          <div
            v-for="color in presetColors"
            :key="color"
            class="w-10 h-10 rounded-full cursor-pointer border-2 transition-all hover:scale-110 flex items-center justify-center shadow-lg"
            :style="{
              backgroundColor: color,
              borderColor: themeColor === color ? 'white' : 'transparent',
              boxShadow: themeColor === color ? `0 0 10px ${color}` : 'none'
            }"
            @click="setTheme(color)"
          >
            <Icon
              icon="mdi:check"
              class="text-white text-xl drop-shadow-md"
              v-if="themeColor === color"
            />
          </div>
          <label
            class="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-white hover:bg-white/10 relative overflow-hidden transition-all text-gray-400 hover:text-white"
          >
            <Icon icon="mdi:plus" class="text-xl" />
            <input
              type="color"
              v-model="customColor"
              @input="setTheme(customColor)"
              class="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h2 class="text-xl font-bold mb-4 border-b border-white/10 pb-2">背景设置</h2>
      <div class="bg-white/5 rounded-xl p-6">
        <div class="flex items-start mb-6">
          <div class="flex-1">
            <div class="text-base font-medium mb-1">自定义背景图</div>
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
              class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition border border-white/10"
            >
              上传图片
            </button>
            <button
              @click="settingsStore.reset()"
              class="px-4 py-2 text-gray-400 hover:text-white text-sm transition"
            >
              重置
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const fileInput = ref<HTMLInputElement | null>(null)
const opacityValue = ref(settingsStore.backgroundOpacity)

const launchAtStartup = ref(settingsStore.launchAtStartup)
const closeOption = ref(settingsStore.closeOption)
const themeColor = ref(settingsStore.themeColor)
const customColor = ref('#ec4141')
const lyricColor = ref(settingsStore.lyricColor)
const lyricFontSize = ref(settingsStore.lyricFontSize)
const lyricFontFamily = ref(settingsStore.lyricFontFamily)
const lyricStrokeColor = ref(settingsStore.lyricStrokeColor)
const lyricStrokeWidth = ref(settingsStore.lyricStrokeWidth)
const lyricTextAlign = ref(settingsStore.lyricTextAlign)

const presetColors = [
  '#ec4141',
  '#C20C0C',
  '#4ade80',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
  '#fbbf24',
  '#9ca3af'
]

const updateLaunch = () => settingsStore.setLaunchAtStartup(launchAtStartup.value)
const updateCloseOption = () => settingsStore.setCloseOption(closeOption.value)
const setTheme = (color: string) => {
  themeColor.value = color
  settingsStore.setThemeColor(color)
}

const updateLyric = () => {
  settingsStore.updateLyricConfig({
    color: lyricColor.value,
    fontSize: Number(lyricFontSize.value),
    fontFamily: lyricFontFamily.value,
    strokeColor: lyricStrokeColor.value,
    strokeWidth: Number(lyricStrokeWidth.value),
    textAlign: lyricTextAlign.value as any
  })
}

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
