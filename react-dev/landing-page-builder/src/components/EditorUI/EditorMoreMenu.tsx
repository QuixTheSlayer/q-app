import { ComponentProps, useState } from 'react'
import { Braces, Code2, HelpCircle, MoreHorizontal, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import editorConfig from '@/configs/editor.config'
import CodeReviewDialog from '@/components/EditorUI/CodeReviewDialog'
import ImportHtmlDialog from '@/components/EditorUI/ImportHtmlDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/DropDownMenu'
import { isMacOS } from '@/utils/platform.utils'

type Dialogs = 'customCode' | 'importHtml' | null

interface EditorMoreMenuProps {
  css: string
  js: string
  hasExistingContent: boolean
  onImportReplace: ComponentProps<typeof ImportHtmlDialog>['onReplace']
  isDark: boolean
  onToggleTheme: () => void
  onStartTour: () => void
}

/**
 * The top bar's "more" menu: the tools most people use rarely (Custom Code, Import HTML) plus help and
 * the theme switch, so the bar itself keeps just Preview and Save. The two dialogs live here, opened
 * from the menu, because a menu item unmounts when the menu closes.
 */
export default function EditorMoreMenu({ css, js, hasExistingContent, onImportReplace, isDark, onToggleTheme, onStartTour }: EditorMoreMenuProps) {
  const { t } = useTranslation('common')
  const { t: ti } = useTranslation('insert')
  const [dialog, setDialog] = useState<Dialogs>(null)

  const showCode = editorConfig.enable_custom_code
  const showImport = editorConfig.enable_import_html
  const showTour = editorConfig.enable_onboarding_tour
  const showTheme = editorConfig.enable_theme_toggle
  if (!showCode && !showImport && !showTour && !showTheme) return null

  const item = 'gap-2 cursor-pointer [&_svg]:size-4 [&_svg]:text-muted-foreground'

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            data-tour="more-menu"
            aria-label={t('navbar.moreActions')}
            title={t('navbar.moreActions')}
            className='w-9 h-9 rounded-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 data-[state=open]:bg-white/10 transition-colors'
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>
        {/* Focus goes to the dialog a choice opens, not back to this button. */}
        <DropdownMenuContent align='end' className='z-[100000] min-w-[220px]' onCloseAutoFocus={(e) => e.preventDefault()}>
          {showCode && (
            <DropdownMenuItem className={item} onSelect={() => setDialog('customCode')}>
              <Braces /> {ti('codeReview.title')}
            </DropdownMenuItem>
          )}
          {showImport && (
            <DropdownMenuItem className={item} onSelect={() => setDialog('importHtml')}>
              <Code2 /> {ti('importHtmlDialog.title')}
            </DropdownMenuItem>
          )}
          {(showCode || showImport) && (showTour || showTheme) && <DropdownMenuSeparator />}
          {showTour && (
            <DropdownMenuItem className={item} onSelect={onStartTour}>
              <HelpCircle /> {t('navbar.openTour')}
            </DropdownMenuItem>
          )}
          {showTheme && (
            <DropdownMenuItem className={item} onSelect={onToggleTheme}>
              {isDark ? <Sun /> : <Moon />} {t('navbar.toggleTheme')}
              <DropdownMenuShortcut>{isMacOS() ? 'Cmd' : 'Ctrl'}+Shift+D</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showCode && (
        <CodeReviewDialog css={css} js={js} hideTrigger open={dialog === 'customCode'} onOpenChange={(open) => setDialog(open ? 'customCode' : null)} />
      )}
      {showImport && (
        <ImportHtmlDialog hasExistingContent={hasExistingContent} onReplace={onImportReplace} hideTrigger open={dialog === 'importHtml'} onOpenChange={(open) => setDialog(open ? 'importHtml' : null)} />
      )}
    </>
  )
}
