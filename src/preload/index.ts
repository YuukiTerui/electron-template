import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { SystemInfo, IElectronAPI } from '../shared/types'

// Custom APIs for renderer
export const api: IElectronAPI = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  getSystemInfo: (): Promise<SystemInfo> => ipcRenderer.invoke('get-system-info'),
  selectFile: (): Promise<string | null> => ipcRenderer.invoke('select-file'),
  showNotification: (title: string, body: string): Promise<boolean> =>
    ipcRenderer.invoke('show-notification', { title, body })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
