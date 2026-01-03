import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startMusicServer } from './musicServer'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
// 默认关闭行为：最小化
let closeAction = 'minimize'

function createTray(win: BrowserWindow) {
  const icon = nativeImage.createFromPath(join(__dirname, '../../build/icon.png'))
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主界面', click: () => win.show() },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
  tray.setToolTip('Bestows Music')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => win.show())
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  // === 关键：关闭行为判断 ===
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      if (closeAction === 'minimize') {
        event.preventDefault()
        mainWindow?.hide()
        return false
      }
      // 如果是 'quit'，则正常走退出流程
    }
  })

  createTray(mainWindow)

  ipcMain.on('window-min', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize())
  ipcMain.on('window-max', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win === mainWindow) {
      win.close() // 触发上面的 close 事件
    } else {
      win?.close()
    }
  })

  // === 设置相关 IPC ===
  // 1. 开机自启
  ipcMain.on('set-login-item-settings', (event, openAtLogin) => {
    app.setLoginItemSettings({
      openAtLogin: openAtLogin,
      path: process.execPath
    })
  })

  // 2. 关闭按钮行为
  ipcMain.on('set-close-action', (event, action) => {
    closeAction = action
  })

  // 3. 歌词样式转发 (主窗口 -> 歌词窗口)
  ipcMain.on('update-lyric-style', (event, style) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      if (win.webContents.getURL()?.includes('desktop-lyric')) {
        win.webContents.send('style-update', style)
      }
    })
  })

  ipcMain.on('toggle-desktop-lyric', () => {
    const windows = BrowserWindow.getAllWindows()
    const lyricWin = windows.find((w) => w.webContents.getURL()?.includes('desktop-lyric'))
    if (lyricWin) lyricWin.close()
    else mainWindow?.webContents.send('start-desktop-lyric')
  })

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setIgnoreMouseEvents(ignore, options)
  })

  ipcMain.on('desktop-lyric-reset', () => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      if (win.webContents.getURL()?.includes('desktop-lyric')) {
        win.setIgnoreMouseEvents(false)
        win.show()
        win.setAlwaysOnTop(true)
        win.webContents.send('lyric-reset-state')
      }
    })
  })

  ipcMain.on('lyric-control', (_event, data) =>
    mainWindow?.webContents.send('lyric-control-action', data)
  )

  ipcMain.on('sync-lyric', (_event, data) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      if (win.webContents.getURL()?.includes('desktop-lyric')) {
        win.webContents.send('lyric-update', data)
      }
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.includes('desktop-lyric')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 800,
          height: 120,
          minHeight: 80,
          frame: false,
          transparent: true,
          alwaysOnTop: true,
          resizable: false,
          hasShadow: false,
          skipTaskbar: true,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webSecurity: false
          }
        }
      }
    }
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.bestows.music')
  startMusicServer()
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  isQuitting = true
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
