import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { startMusicServer } from './musicServer'

let mainWindow: BrowserWindow | null = null
let lyricWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let closeAction = 'minimize'

function getIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'icon.png')
  }
  return join(__dirname, '../../build/icon.png')
}

function createTray(win: BrowserWindow) {
  const icon = nativeImage.createFromPath(getIconPath())
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

function createLyricWindow() {
  if (lyricWindow && !lyricWindow.isDestroyed()) {
    lyricWindow.show()
    return
  }

  lyricWindow = new BrowserWindow({
    width: 800,
    height: 150, //稍微增高一点以容纳大字体
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
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/desktop-lyric`)
  } else {
    lyricWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'desktop-lyric' })
  }

  lyricWindow.on('closed', () => {
    lyricWindow = null
  })

  lyricWindow.setIgnoreMouseEvents(false)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon: getIconPath() } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  // === 核心修复：关闭逻辑 ===
  mainWindow.on('close', (event) => {
    // 如果已经触发了退出流程，不再拦截
    if (isQuitting) return

    if (closeAction === 'minimize') {
      // 最小化模式：阻止关闭，隐藏窗口
      event.preventDefault()
      mainWindow?.hide()
    } else {
      // 直接退出模式：标记退出，并调用 app.quit()
      // 注意：这里如果不设 isQuitting=true，app.quit() 会再次触发 close 事件导致死循环
      isQuitting = true
      app.quit()
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
      win.close() // 触发 close 事件
    } else {
      win?.close()
    }
  })

  // === 设置 IPC ===
  ipcMain.on('set-login-item-settings', (event, openAtLogin) => {
    app.setLoginItemSettings({ openAtLogin, path: process.execPath })
  })

  ipcMain.on('set-close-action', (event, action) => {
    closeAction = action
  })

  ipcMain.on('update-lyric-style', (event, style) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      if (win.webContents.getURL()?.includes('desktop-lyric')) {
        win.webContents.send('style-update', style)
      }
    })
  })

  ipcMain.on('toggle-desktop-lyric', () => {
    if (lyricWindow && !lyricWindow.isDestroyed()) {
      lyricWindow.close()
    } else {
      createLyricWindow()
    }
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
          height: 150,
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
