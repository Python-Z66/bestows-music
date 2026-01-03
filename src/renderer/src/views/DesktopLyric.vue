<template>
  <div
    class="w-full h-full flex flex-col justify-center overflow-hidden select-none relative group"
    :class="{ 'bg-black/20 backdrop-blur-sm rounded-xl border border-white/10': !isLocked }"
    :style="{ alignItems: alignMap[style.textAlign] || 'center' }"
    @mouseenter="handleMouseEnterWindow"
    @mouseleave="handleMouseLeaveWindow"
  >
    <div v-if="!isLocked" class="absolute inset-0 z-0 drag-region"></div>

    <div
      v-if="!isLocked"
      class="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-3 z-50 opacity-40 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-md rounded-t-xl"
    >
      <div class="flex items-center space-x-2 no-drag">
        <button
          @click="toggleLock"
          class="text-gray-200 hover:text-green-400 p-1.5 rounded-full hover:bg-white/10 transition"
          title="锁定歌词 (鼠标穿透)"
        >
          <Icon icon="mdi:lock-open-outline" class="text-lg" />
        </button>
        <div class="flex items-center bg-white/10 rounded ml-2 scale-90 border border-white/10">
          <button
            @click="adjustOffset(-500)"
            class="px-2 py-0.5 hover:bg-white/10 text-gray-300 text-xs rounded-l"
          >
            -0.5s
          </button>
          <div class="w-[1px] h-3 bg-white/20"></div>
          <button
            @click="adjustOffset(500)"
            class="px-2 py-0.5 hover:bg-white/10 text-gray-300 text-xs rounded-r"
          >
            +0.5s
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-4 text-gray-200 no-drag">
        <button class="hover:text-white hover:scale-110 transition p-1" @click="control('prev')">
          <Icon icon="mdi:skip-previous" class="text-xl" />
        </button>
        <button class="hover:text-white hover:scale-110 transition p-1" @click="control('toggle')">
          <Icon :icon="isPlaying ? 'mdi:pause' : 'mdi:play'" class="text-2xl" />
        </button>
        <button class="hover:text-white hover:scale-110 transition p-1" @click="control('next')">
          <Icon icon="mdi:skip-next" class="text-xl" />
        </button>
      </div>

      <div class="no-drag">
        <button
          @click="closeWindow"
          class="text-gray-200 hover:text-white hover:bg-red-500/80 p-1.5 rounded-full transition duration-200"
          title="关闭歌词"
        >
          <Icon icon="mdi:close" class="text-lg" />
        </button>
      </div>
    </div>

    <div
      v-if="isLocked"
      class="absolute top-2 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-black/60 p-2 rounded-full text-green-400 border border-green-500/30 backdrop-blur-md no-drag shadow-lg hover:scale-110 hover:bg-black/80"
      @click="toggleLock"
      @mouseenter="setIgnore(false)"
      @mouseleave="setIgnore(true)"
      title="点击解锁"
    >
      <Icon icon="mdi:lock" class="text-base" />
    </div>

    <div
      class="relative z-10 w-full px-8 pointer-events-none mt-2"
      :style="{ textAlign: style.textAlign }"
    >
      <div class="relative inline-block max-w-full leading-none">
        <div
          class="font-bold whitespace-nowrap text-transparent select-none"
          :style="{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize + 'px',
            WebkitTextStroke: `${style.strokeWidth}px ${style.strokeColor}`,
            opacity: 0.8
          }"
        >
          {{ currentText }}
        </div>

        <div
          class="absolute top-0 left-0 font-bold whitespace-nowrap text-white select-none"
          :style="{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize + 'px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }"
        >
          {{ currentText }}
        </div>

        <div
          class="absolute top-0 left-0 font-bold whitespace-nowrap overflow-hidden text-transparent bg-clip-text select-none"
          :style="{
            fontFamily: style.fontFamily,
            fontSize: style.fontSize + 'px',
            width: animationWidth + '%',
            transition: `width ${duration}ms linear`,
            backgroundImage: `linear-gradient(to bottom, #ffffff 20%, ${style.color} 80%)`,
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.5))'
          }"
        >
          {{ currentText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'

const currentText = ref('Bestows Music')
const isLocked = ref(false)
const isPlaying = ref(false)
const duration = ref(0)
const animationWidth = ref(0)

const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }

const style = reactive({
  color: '#4ade80',
  fontSize: 40,
  fontFamily: '"Arial Rounded MT Bold", "Microsoft YaHei", sans-serif',
  strokeColor: '#000000',
  strokeWidth: 4,
  textAlign: 'center' as 'left' | 'center' | 'right'
})

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

  const ls = localStorage
  style.color = ls.getItem('lyric-color') || style.color
  style.fontSize = Number(ls.getItem('lyric-font-size')) || style.fontSize
  style.fontFamily = ls.getItem('lyric-font-family') || style.fontFamily
  style.strokeColor = ls.getItem('lyric-stroke-color') || style.strokeColor
  style.strokeWidth = Number(ls.getItem('lyric-stroke-width')) || style.strokeWidth
  style.textAlign = (ls.getItem('lyric-text-align') as any) || style.textAlign

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

    window.electron.ipcRenderer.on('style-update', (_event, newStyle: any) => {
      Object.assign(style, newStyle)
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
