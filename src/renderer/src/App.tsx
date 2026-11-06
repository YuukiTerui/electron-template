import { useEffect, useState } from 'react'
import electronLogo from './assets/electron.svg'
import type { SystemInfo } from '../../preload'

function App(): React.JSX.Element {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null)
  const [pingLatency, setPingLatency] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const platform = window.electron.process.platform
  const isMac = platform === 'darwin'
  const isWin = platform === 'win32'

  useEffect(() => {
    // Load system info on startup
    window.api
      .getSystemInfo()
      .then((info) => setSystemInfo(info))
      .catch((err) => console.error('Failed to get system info:', err))
  }, [])

  const handleSelectFile = async (): Promise<void> => {
    try {
      const path = await window.api.selectFile()
      if (path) setSelectedFilePath(path)
    } catch (err) {
      console.error('File selection error:', err)
    }
  }

  const handleSendNotification = async (): Promise<void> => {
    try {
      const success = await window.api.showNotification(
        'Electron Native Template',
        'デスクトップ通知が正常にトリガーされました！'
      )
      setNotificationStatus(success ? '通知を送信しました' : '通知非対応環境です')
      setTimeout(() => setNotificationStatus(null), 3000)
    } catch (err) {
      console.error('Notification error:', err)
      setNotificationStatus('通知エラー')
    }
  }

  const handlePing = async (): Promise<void> => {
    const start = performance.now()
    try {
      await window.api.ping()
      const elapsed = Math.round((performance.now() - start) * 10) / 10
      setPingLatency(elapsed)
    } catch (err) {
      console.error('Ping error:', err)
    }
  }

  const handleCopySystemInfo = (): void => {
    if (!systemInfo) return
    const text = `Platform: ${systemInfo.platform} (${systemInfo.arch})
OS: ${systemInfo.osVersion}
Memory: ${systemInfo.freeMemoryGb}GB free / ${systemInfo.totalMemoryGb}GB total
Electron: v${systemInfo.electronVersion}
Chrome: v${systemInfo.chromeVersion}
Node: v${systemInfo.nodeVersion}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100 select-none">
      {/* Modern Integrated Titlebar (macOS traffic lights & Windows Window Controls Overlay compatible) */}
      <header
        className={`app-drag flex h-10 w-full shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 ${
          isMac ? 'pr-4 pl-20' : isWin ? 'pr-36 pl-4' : 'px-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <img alt="App Logo" className="h-4 w-4" src={electronLogo} />
          <span className="text-xs font-medium tracking-wide text-zinc-300">
            Native App Template
          </span>
        </div>
        <div className="app-no-drag flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            F12
          </span>
          <span>DevTools</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto p-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
              <span>Desktop Tool Workspace</span>
              <span className="rounded-full border border-cyan-800/50 bg-cyan-950 px-2 py-0.5 font-mono text-xs font-medium text-cyan-400">
                Ready
              </span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              electron-vite • React 19 • TypeScript • Tailwind CSS v4
            </p>
          </div>
          <a
            href="https://electron-vite.org/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-cyan-400"
          >
            Docs ↗
          </a>
        </div>

        {/* 2-Column Grid: System Info & Quick Actions */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* System Info Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">System Overview</h2>
                </div>
                <button
                  onClick={handleCopySystemInfo}
                  className="cursor-pointer rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-zinc-700 active:scale-95"
                >
                  {copied ? 'Copied!' : 'Copy Info'}
                </button>
              </div>

              {systemInfo ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                    <span className="mb-1 block text-zinc-500">Platform / Arch</span>
                    <span className="font-mono font-medium text-zinc-200">
                      {systemInfo.platform} ({systemInfo.arch})
                    </span>
                  </div>
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                    <span className="mb-1 block text-zinc-500">Available Memory</span>
                    <span className="font-mono font-medium text-zinc-200">
                      {systemInfo.freeMemoryGb} GB / {systemInfo.totalMemoryGb} GB
                    </span>
                  </div>
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                    <span className="mb-1 block text-zinc-500">Electron / Chromium</span>
                    <span className="font-mono font-medium text-zinc-200">
                      v{systemInfo.electronVersion} / {systemInfo.chromeVersion}
                    </span>
                  </div>
                  <div className="rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                    <span className="mb-1 block text-zinc-500">Node.js Engine</span>
                    <span className="font-mono font-medium text-zinc-200">
                      v{systemInfo.nodeVersion}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500">
                  Loading hardware data...
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800/40 pt-3 font-mono text-[11px] text-zinc-500">
              <span>OS: {systemInfo?.osVersion ?? 'detecting...'}</span>
              <span className="text-emerald-400/80">● IPC Online</span>
            </div>
          </div>

          {/* Quick Actions (Native IPC Tools) */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <span>Native Actions (IPC Samples)</span>
              </h2>

              <div className="space-y-3">
                {/* File Dialog Action */}
                <div className="flex flex-col gap-2 rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">Native File Dialog</span>
                    <button
                      onClick={handleSelectFile}
                      className="cursor-pointer rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-cyan-500 active:scale-95"
                    >
                      Choose File...
                    </button>
                  </div>
                  <p className="truncate font-mono text-[11px] text-zinc-500">
                    {selectedFilePath ? selectedFilePath : 'No file chosen yet'}
                  </p>
                </div>

                {/* Desktop Notification Action */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                  <div>
                    <span className="block text-xs font-medium text-zinc-300">OS Notification</span>
                    <span className="text-[11px] text-zinc-500">
                      {notificationStatus ? notificationStatus : 'Trigger a desktop notification'}
                    </span>
                  </div>
                  <button
                    onClick={handleSendNotification}
                    className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
                  >
                    Send Push
                  </button>
                </div>

                {/* Ping IPC Action */}
                <div className="flex items-center justify-between rounded-xl border border-zinc-800/40 bg-zinc-950/60 p-3">
                  <div>
                    <span className="block text-xs font-medium text-zinc-300">IPC Roundtrip</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {pingLatency !== null ? `Latency: ${pingLatency} ms` : 'Measure IPC response'}
                    </span>
                  </div>
                  <button
                    onClick={handlePing}
                    className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
                  >
                    Ping Main
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-4 border-t border-zinc-800/40 pt-3 text-[11px] text-zinc-500">
              Code located in <code className="text-cyan-400">src/main</code> &amp;{' '}
              <code className="text-cyan-400">src/preload</code>
            </p>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="flex items-center justify-between rounded-xl border border-cyan-800/30 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4 text-xs text-zinc-300">
          <div className="flex items-center gap-3">
            <span className="rounded border border-cyan-700/40 bg-cyan-900/60 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
              Vite 8 + React 19
            </span>
            <span>HMR is enabled. Edit this component to start building your desktop app.</span>
          </div>
        </div>
      </main>

      {/* Status Bar Footer */}
      <footer className="flex h-7 w-full shrink-0 items-center justify-between border-t border-zinc-800/60 bg-zinc-900/80 px-4 font-mono text-[11px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span>Template: Electron + Tailwind v4</span>
          <span>•</span>
          <span className="text-zinc-400">Ready to build</span>
        </div>
        <div>
          <span>Press Cmd+R / Ctrl+R to reload</span>
        </div>
      </footer>
    </div>
  )
}

export default App
