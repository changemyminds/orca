import type { GlobalSettings } from '../../../../shared/global-settings-types'
import { Textarea } from '@/components/ui/textarea'
import { translate } from '@/i18n/i18n'
import { SearchableSetting } from './SearchableSetting'
import { SettingsSubsectionHeader, SettingsSwitchRow } from './SettingsFormControls'
import { getTasksLinkedWorkItemPromptSearchEntry } from './tasks-search'

// Why: literal tokens stay outside translate() so i18next never interpolates them.
const PLACEHOLDERS = ['{{url}}', '{{identifier}}', '{{title}}'] as const
const TEMPLATE_EXAMPLE = `/code-review ${PLACEHOLDERS[0]}`

type TasksLinkedWorkItemPromptSettingProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

export function TasksLinkedWorkItemPromptSetting({
  settings,
  updateSettings
}: TasksLinkedWorkItemPromptSettingProps): React.JSX.Element {
  const searchEntry = getTasksLinkedWorkItemPromptSearchEntry()
  return (
    <SearchableSetting {...searchEntry} className="space-y-3">
      <SettingsSubsectionHeader title={searchEntry.title} description={searchEntry.description} />
      <Textarea
        id="linked-work-item-prompt-template"
        value={settings.linkedWorkItemPromptTemplate ?? ''}
        onChange={(event) => updateSettings({ linkedWorkItemPromptTemplate: event.target.value })}
        placeholder={TEMPLATE_EXAMPLE}
        variant="code"
        className="min-h-20"
        spellCheck={false}
        aria-label={searchEntry.title}
      />
      <p className="text-xs text-muted-foreground">
        {translate(
          'auto.components.settings.TasksPane.linkedWorkItemPromptPlaceholders',
          'Placeholders:'
        )}{' '}
        {PLACEHOLDERS.map((placeholder, index) => (
          <span key={placeholder}>
            {index > 0 ? ', ' : null}
            <code className="rounded bg-muted px-1 py-0.5">{placeholder}</code>
          </span>
        ))}
        .{' '}
        {translate(
          'auto.components.settings.TasksPane.linkedWorkItemPromptEmptyHint',
          'Leave empty to keep the default draft. Ticket descriptions and comments are never inserted.'
        )}
      </p>
      <SettingsSwitchRow
        label={translate(
          'auto.components.settings.TasksPane.linkedWorkItemPromptAutoSubmit',
          'Send automatically'
        )}
        description={translate(
          'auto.components.settings.TasksPane.linkedWorkItemPromptAutoSubmitDescription',
          'Submit the rendered template once the agent is ready instead of leaving it as a draft. The title comes from the item author, so avoid it in auto-sent templates.'
        )}
        checked={settings.linkedWorkItemPromptAutoSubmit === true}
        onChange={() =>
          updateSettings({
            linkedWorkItemPromptAutoSubmit: settings.linkedWorkItemPromptAutoSubmit !== true
          })
        }
      />
    </SearchableSetting>
  )
}
