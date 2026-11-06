import { ElectronAPI } from '@electron-toolkit/preload'

export interface SystemInfo {
  platform: string
  arch: string
  osVersion: string
  totalMemoryGb: string
  freeMemoryGb: string
  electronVersion: string
  chromeVersion: string
  nodeVersion: string
}

export interface IElectronAPI {
  ping: () => Promise<string>
  getSystemInfo: () => Promise<SystemInfo>
  selectFile: () => Promise<string | null>
  showNotification: (title: string, body: string) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}
