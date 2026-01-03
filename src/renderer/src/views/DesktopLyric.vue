<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center overflow-hidden select-none relative group"
    :class="{ 'bg-black/60 rounded-xl border border-white/10 shadow-2xl': !isLocked }"
    @mouseenter="handleMouseEnterWindow"
    @mouseleave="handleMouseLeaveWindow"
  >
    <div v-if="!isLocked" class="absolute inset-0 z-0 drag-region"></div>

    <div
      v-if="!isLocked"
      class="absolute top-0 left-0 right-0 h-9 flex items-center justify-between px-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <div class="flex items-center space-x-1 no-drag">
        <button
          @click="toggleLock"
          class="text-gray-300 hover:text-green-400 p-1 rounded hover:bg-white/10 transition"
        >
          <Icon icon="mdi:lock-open-outline" />
        </button>
        <div class="flex items-center bg-white/10 rounded ml-2 scale-90">
          <button
            @click="adjustOffset(-500)"
            class="px-1.5 py-0.5 text-[10px] text-gray-300 hover:text-white hover:bg-white/20"
          >
            -0.5s
          </button>
          <div class="w-[1px] h-3 bg-white/20"></div>
          <button
            @click="adjustOffset(500)"
            class="px-1.5 py-0.5 text-[10px] text-gray-300 hover:text-white hover:bg-white/20"
          >
            +0.5s
          </button>
        </div>
      </div>
      <div class="flex items-center space-x-3 text-gray-200 no-drag">
        <Icon
          icon="mdi:skip-previous"
          class="hover:text-white cursor-pointer hover:scale-110"
          @click="control('prev')"
        />
        <Icon
          :icon="isPlaying ? 'mdi:pause' : 'mdi:play'"
          class="hover:text-white cursor-pointer hover:scale-110 text-lg"
          @click="control('toggle')"
        />
        <Icon
          icon="mdi:skip-next"
          class="hover:text-white cursor-pointer hover:scale-110"
          @click="control('next')"
        />
      </div>
      <div class="no-drag">
        <button
          @click="closeWindow"
          class="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-white/10 transition"
        >
          <Icon icon="mdi:close" />
        </button>
      </div>
    </div>

    <div
      v-if="isLocked"
      class="absolute top-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 p-1.5 rounded-full text-green-400 border border-green-500/30 backdrop-blur-md no-drag shadow-lg"
      @click="toggleLock"
      @mouseenter="setIgnore(false)"
      @mouseleave="setIgnore(true)"
    >
      <Icon icon="mdi:lock" class="text-sm" />
    </div>

    <div class="relative z-10 w-full px-4 text-center pointer-events-none mt-3">
      <div class="relative inline-block max-w-full">
        <div
          class="font-bold text-white whitespace-nowrap transition-all duration-300"
          :style="{
            fontSize: lyricFontSize + 'px',
            lineHeight: lyricFontSize * 1.2 + 'px',
            textShadow:
              '2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 1px 1px 2px black'
          }"
        >
          {{ currentText }}
        </div>

        <div
          class="absolute top-0 left-0 font-bold whitespace-nowrap overflow-hidden text-transparent bg-clip-text transition-all duration-300"
          :style="{
            fontSize: lyricFontSize + 'px',
            lineHeight: lyricFontSize * 1.2 + 'px',
            width: animationWidth + '%',
            transition: `width ${duration}ms linear`,
            textShadow: 'none',
            backgroundImage: `linear-gradient(to bottom, #ffffff 0%, ${lyricColor} 100%)`
          }"
        >
          {{ currentText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const currentText = ref('桌面歌词就绪')
const isLocked = ref(false)
const isPlaying = ref(false)
const duration = ref(0)
const animationWidth = ref(0)

// 默认样式
const lyricColor = ref('#4ade80')
const lyricFontSize = ref(36)

const adjustOffset = (ms: number) => {
  if (window.electron)
    window.electron.ipcRenderer.send('lyric-control', { type: 'offset', value: ms })
}
const control = (type: string) => {
  if (window.electron) {
    window.electron.ipcRenderer.send('lyric-control', { type: 'control', value: type })
    if (type === 'toggle') isPlaying.value = !isPlaying.value
  }
}
const toggleLock = () => {
  isLocked.value = !isLocked.value
  setIgnore(isLocked.value)
}
const setIgnore = (ignore: boolean) => {
  if (window.electron)
    window.electron.ipcRenderer.send('set-ignore-mouse-events', ignore, { forward: true })
}
const handleMouseEnterWindow = () => {
  if (isLocked.value) setIgnore(true)
}
const handleMouseLeaveWindow = () => {
  if (isLocked.value) setIgnore(true)
}
const closeWindow = () => {
  if (window.electron) window.electron.ipcRenderer.send('window-close')
}

onMounted(() => {
  document.documentElement.style.background = 'transparent'
  document.body.style.background = 'transparent'

  const cached = localStorage.getItem('current-lyric-text')
  if (cached) currentText.value = cached

  // 初始化读取样式
  const c = localStorage.getItem('lyric-color')
  const s = localStorage.getItem('lyric-font-size')
  if (c) lyricColor.value = c
  if (s) lyricFontSize.value = Number(s)

  if (window.electron) {
    window.electron.ipcRenderer.on('lyric-update', (_event, data: any) => {
      animationWidth.value = 0
      duration.value = 0
      requestAnimationFrame(() => {
        if (typeof data === 'object') {
          currentText.value = data.text
          isPlaying.value = true
          requestAnimationFrame(() => {
            duration.value = data.duration || 3000
            animationWidth.value = 100
          })
        } else {
          currentText.value = data
        }
      })
    })

    window.electron.ipcRenderer.on('lyric-reset-state', () => {
      isLocked.value = false
      setIgnore(false)
    })

    // 监听样式更新
    window.electron.ipcRenderer.on('style-update', (_event, style: any) => {
      lyricColor.value = style.color
      lyricFontSize.value = style.fontSize
    })
  }
})
</script>

<style>
html,
body,
#app {
  background: transparent !important;
  height: 100%;
  overflow: hidden;
}
.drag-region {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
