import { ElectronAPI } from '@electron-toolkit/preload'
import type { IElectronAPI } from '../shared/types'

export * from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}
