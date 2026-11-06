import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders header and desktop tool workspace title', async () => {
    render(<App />)
    expect(screen.getByText('Native App Template')).toBeInTheDocument()
    expect(screen.getByText('Desktop Tool Workspace')).toBeInTheDocument()
    expect(screen.getByText('Ready')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText(/darwin \(arm64\)/i)).toBeInTheDocument()
    })
  })

  it('loads and displays system information from window.api', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/darwin \(arm64\)/i)).toBeInTheDocument()
      expect(screen.getByText(/32.0 GB/i)).toBeInTheDocument()
    })
  })

  it('triggers ping IPC when clicking the ping button', async () => {
    const user = userEvent.setup()
    render(<App />)

    const pingButton = screen.getByRole('button', { name: /ping main/i })
    expect(pingButton).toBeInTheDocument()

    await user.click(pingButton)
    expect(window.api.ping).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByText(/latency:/i)).toBeInTheDocument()
    })
  })

  it('triggers file selection dialog when clicking Choose File', async () => {
    const user = userEvent.setup()
    render(<App />)

    const chooseButton = screen.getByRole('button', { name: /choose file/i })
    await user.click(chooseButton)

    expect(window.api.selectFile).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByText('/Users/example/test.txt')).toBeInTheDocument()
    })
  })
})
