import { render, screen, waitFor } from '@testing-library/react'
import { WorkspaceShortcuts } from '@/components/translation/workspace-shortcuts'
import type { WorkspaceSnapshot } from '@/lib/workspace-storage'

const mockUseWorkspaceSessions = vi.fn()

vi.mock('@/hooks/use-workspace-sessions', () => ({
  useWorkspaceSessions: (options?: { baseUrl?: string }) =>
    mockUseWorkspaceSessions(options) ?? { sessions: [], isLoading: false, error: null },
}))

const baseSession: WorkspaceSnapshot = {
  key: 'default::fr',
  language: 'fr',
  content: 'content',
  baseline: 'baseline',
  stats: { translated: 0, fuzzy: 0, untranslated: 1, total: 1 },
  updatedAt: Date.now(),
  changeCount: 0,
  dirty: false,
  preview: 'sample preview',
  projectBaseUrl: '/translation',
}

describe('WorkspaceShortcuts', () => {
  beforeEach(() => {
    mockUseWorkspaceSessions.mockReset()
  })

  it('auto-selects the single saved workspace when none is active', async () => {
    mockUseWorkspaceSessions.mockReturnValue({
      sessions: [baseSession],
      isLoading: false,
      error: null,
    })
    const handleSelect = vi.fn()

    render(
      <WorkspaceShortcuts
        activeLanguage={undefined}
        baseUrl="/translation"
        changedLanguages={[]}
        onSelect={handleSelect}
      />
    )

    await waitFor(() => expect(handleSelect).toHaveBeenCalledWith(baseSession))
  })

  it('does not override an already active workspace and shows review badge', async () => {
    mockUseWorkspaceSessions.mockReturnValue({
      sessions: [baseSession],
      isLoading: false,
      error: null,
    })
    const handleSelect = vi.fn()

    render(
      <WorkspaceShortcuts
        activeLanguage="fr"
        baseUrl="/translation"
        changedLanguages={['fr']}
        onSelect={handleSelect}
      />
    )

    await waitFor(() => expect(handleSelect).not.toHaveBeenCalled())
    expect(screen.getByText('REVIEW')).toBeInTheDocument()
  })
})
