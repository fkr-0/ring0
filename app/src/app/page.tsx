import { useCallback, useMemo, useState } from 'react'
import { AppHeader } from '@/components/translation/app-header'
import { LanguageOverview } from '@/components/translation/language-overview'
import { LanguageWorkspace } from '@/components/translation/language-workspace'
import { ReviewSubmit } from '@/components/translation/review-submit'
import { WorkspaceShortcuts } from '@/components/translation/workspace-shortcuts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AppState, TranslationProject } from '@/lib/types'
import type { WorkspaceSnapshot } from '@/lib/workspace-storage'

export default function TranslationApp() {
  const [appState, setAppState] = useState<AppState>('overview')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [currentProject, setCurrentProject] = useState<TranslationProject | null>(null)
  const [overviewProject, setOverviewProject] = useState<TranslationProject | null>(null)
  const [changedFiles, setChangedFiles] = useState<Map<string, string>>(new Map())
  const [activeTab, setActiveTab] = useState('overview')

  // Memoize changedLanguages for stable reference
  const changedLanguages = useMemo(() => [...changedFiles.keys()], [changedFiles])

  const headerStats = useMemo(() => {
    const metadata = overviewProject?.metadata
    if (!metadata) return undefined
    const statEntries = Object.values(metadata.stats ?? {})
    const languages = metadata.languages?.length || Object.keys(metadata.stats ?? {}).length
    const strings =
      metadata.totals?.strings ??
      statEntries.reduce((sum, stat) => sum + stat.translated + stat.untranslated + stat.fuzzy, 0)
    const words =
      metadata.totals?.words ?? statEntries.reduce((sum, stat) => sum + (stat.words ?? 0), 0)
    const completion =
      statEntries.length > 0
        ? Math.round(
            statEntries.reduce((sum, stat) => {
              const total = stat.translated + stat.untranslated + stat.fuzzy
              if (!total) return sum
              return sum + (stat.translated / total) * 100
            }, 0) / statEntries.length
          )
        : undefined
    return { languages, strings, words, completion }
  }, [overviewProject])

  const handleLanguageSelect = useCallback((language: string, project: TranslationProject) => {
    setSelectedLanguage(language)
    setCurrentProject(cloneProject(project))
    setAppState('workspace')
    setActiveTab('workspace')
  }, [])

  const handleSubmitChanges = useCallback((language: string, content: string) => {
    setChangedFiles((prev) => {
      const newChangedFiles = new Map(prev)
      newChangedFiles.set(language, content)
      return newChangedFiles
    })
    setAppState('review')
    setActiveTab('review')
  }, [])

  const handleBackToOverview = useCallback(() => {
    setAppState('overview')
    setActiveTab('overview')
    setSelectedLanguage('')
  }, [])

  const handleBackToWorkspace = useCallback(() => {
    setAppState('workspace')
    setActiveTab('workspace')
  }, [])

  const handleResetChanges = useCallback(() => {
    setChangedFiles(new Map())
    setAppState('overview')
    setActiveTab('overview')
    setSelectedLanguage('')
    setCurrentProject(null)
  }, [])

  const handleWorkspaceShortcutSelect = useCallback(
    (workspace: WorkspaceSnapshot) => {
      let shouldClearChangedFiles = false

      setCurrentProject((prevProject) => {
        const targetBase =
          workspace.projectBaseUrl ??
          prevProject?.baseUrl ??
          overviewProject?.baseUrl ??
          '/translation'

        if (prevProject && prevProject.baseUrl !== targetBase) {
          shouldClearChangedFiles = true
        }

        let nextProject: TranslationProject

        if (prevProject && prevProject.baseUrl === targetBase) {
          nextProject = cloneProject(prevProject)
        } else if (overviewProject && overviewProject.baseUrl === targetBase) {
          nextProject = cloneProject(overviewProject)
        } else {
          nextProject = {
            baseUrl: targetBase,
            metadata: overviewProject?.metadata ?? prevProject?.metadata,
            poFiles: new Map(),
          }
        }

        nextProject.poFiles.set(workspace.language, workspace.baseline)
        return nextProject
      })

      setSelectedLanguage(workspace.language)
      setAppState('workspace')
      setActiveTab('workspace')

      if (shouldClearChangedFiles) {
        setChangedFiles(new Map())
      }
    },
    [overviewProject]
  )

  // getTabState returns "active" for the current tab, "pending" for review if changes exist, "inactive" otherwise
  const getTabState = useCallback(
    (tab: string) => {
      if (tab === appState) return 'active'
      if (tab === 'workspace') return changedFiles.size > 0 ? 'active' : 'inactive'
      if (tab === 'review') return changedFiles.size > 0 ? 'pending' : 'inactive'
      return 'inactive'
    },
    [appState, changedFiles.size]
  )

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="mx-auto space-y-3 max-w-4xl">
        <AppHeader
          activeLanguage={selectedLanguage || undefined}
          unsavedCount={changedFiles.size}
          buildInfo={overviewProject?.metadata?.build}
          stats={headerStats}
        />

        {/* Main Interface with Three-Tab Workflow */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="space-y-2">
            <TabsList className="grid w-full grid-cols-3 terminal-card h-auto p-1">
              <TabsTrigger
                value="overview"
                className={`text-xs font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${getTabState('overview') === 'active' ? 'bg-primary/20' : ''}`}
              >
                [1] OVERVIEW
                {appState === 'overview' && (
                  <span className="ml-2 w-1 h-1 rounded-full bg-green-500 inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="workspace"
                disabled={!selectedLanguage}
                className={`text-xs font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${getTabState('workspace') === 'active' ? 'bg-primary/20' : ''}`}
              >
                [2] WORKSPACE
                {appState === 'workspace' && (
                  <span className="ml-2 w-1 h-1 rounded-full bg-orange-500 inline-block" />
                )}
                {changedFiles.size > 0 && appState !== 'workspace' && (
                  <span className="ml-2 w-1 h-1 rounded-full bg-blue-500 inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="review"
                disabled={changedFiles.size === 0}
                className={`text-xs font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${getTabState('review') === 'pending' ? 'bg-primary/20' : ''}`}
              >
                [3] SUBMIT
                {appState === 'review' && (
                  <span className="ml-2 w-1 h-1 rounded-full bg-green-500 inline-block" />
                )}
                {changedFiles.size > 0 && (
                  <span className="ml-2 px-1 bg-red-500 text-white text-[10px] mono-number rounded">
                    {changedFiles.size}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <WorkspaceShortcuts
              activeLanguage={selectedLanguage}
              baseUrl={currentProject?.baseUrl}
              changedLanguages={changedLanguages}
              onSelect={handleWorkspaceShortcutSelect}
            />
          </div>

          <TabsContent value="overview" className="space-y-3">
            <LanguageOverview
              onLanguageSelect={handleLanguageSelect}
              onProjectLoaded={setOverviewProject}
            />
          </TabsContent>

          <TabsContent value="workspace" className="space-y-3">
            {selectedLanguage && currentProject ? (
              <LanguageWorkspace
                language={selectedLanguage}
                project={currentProject}
                onBack={handleBackToOverview}
                onSubmit={handleSubmitChanges}
              />
            ) : (
              <div className="terminal-card p-8 text-center text-muted-foreground text-sm">
                {'>> select language from overview tab'}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-3">
            {changedFiles.size > 0 && currentProject ? (
              <ReviewSubmit
                changedFiles={changedFiles}
                project={currentProject}
                onBack={handleBackToWorkspace}
                onReset={handleResetChanges}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Make changes to translations to enable review and submission
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function cloneProject(project: TranslationProject): TranslationProject {
  return {
    ...project,
    poFiles: new Map(project.poFiles),
  }
}
