import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageWorkspace } from '@/components/translation/language-workspace'
import type { TranslationProject } from '@/lib/translation-api'

const mockUseWorkspaceSessions = vi.fn()

vi.mock('@/hooks/use-workspace-sessions', () => ({
  useWorkspaceSessions: () =>
    mockUseWorkspaceSessions() ?? { sessions: [], isLoading: false, error: null },
}))

const SAMPLE_PO = `msgid ""
msgstr ""
"Language: fr\\n"

msgid "Hello"
msgstr ""
`

const baseProject: TranslationProject = {
  baseUrl: '/translation',
  metadata: undefined,
  poFiles: new Map([['fr', SAMPLE_PO]]),
}

describe('LanguageWorkspace integration', () => {
  beforeEach(() => {
    mockUseWorkspaceSessions.mockReset()
    mockUseWorkspaceSessions.mockReturnValue({ sessions: [], isLoading: false, error: null })
  })

  it('tracks dirty and frozen state transitions', async () => {
    const user = userEvent.setup()
    render(
      <LanguageWorkspace language="fr" project={baseProject} onBack={vi.fn()} onSubmit={vi.fn()} />
    )

    await screen.findByText(/STATE::CLEAN/)

    const textarea = await screen.findByPlaceholderText(/enter translation/i)
    await user.type(textarea, 'Bonjour')

    await screen.findByText(/STATE::DIRTY/)

    const freezeButton = screen.getByRole('button', { name: /freeze baseline/i })
    await user.click(freezeButton)

    await screen.findByText(/STATE::FROZEN/)
  })
})
