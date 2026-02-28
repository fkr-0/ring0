import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TranslationApp from '@/app/page'
import type { TranslationProject } from '@/lib/translation-api'
import { TranslationApiClient } from '@/lib/translation-api'

const mockUseWorkspaceSessions = vi.fn()

vi.mock('@/hooks/use-workspace-sessions', () => ({
  useWorkspaceSessions: () =>
    mockUseWorkspaceSessions() ?? { sessions: [], isLoading: false, error: null },
}))

vi.mock('@/components/mode-toggle', () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}))

const SAMPLE_PROJECT: TranslationProject = {
  baseUrl: '/translation',
  metadata: {
    languages: ['fr', 'de'],
    stats: {
      fr: { translated: 3, untranslated: 5, fuzzy: 0, words: 10 },
      de: { translated: 5, untranslated: 1, fuzzy: 0, words: 12 },
    },
  },
  poFiles: new Map([
    ['fr', `msgid ""\nmsgstr ""\n"Language: fr\\n"\n\nmsgid "Hello"\nmsgstr ""\n`],
    ['de', `msgid ""\nmsgstr ""\n"Language: de\\n"\n\nmsgid "Checkout"\nmsgstr ""\n`],
  ]),
}

describe('TranslationApp integration', () => {
  beforeEach(() => {
    mockUseWorkspaceSessions.mockReset()
    mockUseWorkspaceSessions.mockReturnValue({ sessions: [], isLoading: false, error: null })
    vi.spyOn(TranslationApiClient.prototype, 'loadProject').mockResolvedValue(SAMPLE_PROJECT)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lets users switch workspaces without reopening the previous language', async () => {
    const user = userEvent.setup()
    render(<TranslationApp />)

    const findEditButton = async (lang: string) => {
      const buttons = await screen.findAllByRole('button', { name: 'EDIT' })
      return buttons.find((button) => button.closest('tr')?.textContent?.includes(lang))
    }

    const expectWorkspaceHeader = async (lang: string) => {
      await screen.findByText((_, node) => {
        const text = node?.textContent?.replace(/\s+/g, '')
        return text === `WORKSPACE::${lang}`
      })
    }

    const deButton = await findEditButton('DE')
    expect(deButton).toBeDefined()
    await user.click(deButton!)

    await expectWorkspaceHeader('DE')

    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)

    const frButton = await findEditButton('FR')
    expect(frButton).toBeDefined()
    await user.click(frButton!)

    await expectWorkspaceHeader('FR')
  })
})
