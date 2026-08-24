import { app, dialog, ipcMain } from 'electron'
import { setToolbarOpacity, syncToolbarSettings } from './toolbar-window'

ipcMain.handle('getAppSettings', () => {
  return settings
})

ipcMain.handle('updateAppSettings', (_event, _settings) => {
  // 渲染端会全量上报设置，主题/悬停延迟仅在真正变化时才转发给工具条，
  // 否则两个窗口经主进程中转互相触发，形成无限推送循环
  const hoverDelayChanged =
    'toolbarHoverDelay' in _settings && _settings.toolbarHoverDelay !== settings.toolbarHoverDelay
  const themeChanged =
    ('themeId' in _settings && _settings.themeId !== settings.themeId) ||
    ('customThemeColors' in _settings &&
      JSON.stringify(_settings.customThemeColors ?? {}) !==
        JSON.stringify(settings.customThemeColors ?? {}))

  Object.assign(settings, _settings)
  if ('hideDockIcon' in _settings) {
    applyDockVisibility(settings.hideDockIcon)
  }
  if ('opacity' in _settings) {
    setToolbarOpacity(settings.opacity)
  }
  if (hoverDelayChanged || themeChanged) {
    syncToolbarSettings({
      hoverDelay: settings.toolbarHoverDelay,
      ...(themeChanged
        ? { themeId: settings.themeId, customThemeColors: settings.customThemeColors }
        : {})
    })
  }
})

/** Show/hide the macOS dock icon. No-op on other platforms. */
export function applyDockVisibility(hidden: boolean): void {
  if (process.platform !== 'darwin') return
  if (hidden) {
    app.dock?.hide()
  } else {
    app.dock?.show()
  }
}

ipcMain.handle('selectScreenshotDir', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: '选择截图保存目录'
  })
  if (result.canceled || result.filePaths.length === 0) {
    return null
  }
  return result.filePaths[0]
})

export const settings = {
  apiBaseURL: process.env.API_BASE_URL || '',
  apiKey: process.env.API_KEY || '',
  model: process.env.MODEL || '',
  customPrompt: '',
  /** Kept in sync with the renderer so the overlay toolbar can match the main window */
  opacity: 0.8,
  /**
   * Dwell time in ms before hovering a toolbar button fires it; 0 disables hover
   * triggering. The real default lives in the renderer store: App.tsx fills blank
   * renderer fields from here, so a truthy default would overwrite a user's "off".
   */
  toolbarHoverDelay: 0,
  screenshotAutoSave: false,
  screenshotDir: '',
  dashscopeApiKey: '',
  hideDockIcon: false,
  audioInputDeviceId: '',
  audioOutputDeviceId: '',
  /** 渲染端主题设置的镜像，仅用于转发给悬浮工具条的独立窗口 */
  themeId: 'vscode-dark',
  customThemeColors: {}
}

export type AppSettings = typeof settings
