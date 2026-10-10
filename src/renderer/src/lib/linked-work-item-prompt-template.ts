/**
 * User-authored template for the agent draft Orca writes when a workspace is
 * started from a linked work item (GitHub, GitLab, Linear, Jira).
 *
 * Contract:
 * - A blank template means "no template": callers keep their built-in draft.
 * - Only identity/link fields are exposed. Ticket bodies and comments are
 *   untrusted prose and are never placeholders.
 * - `{{title}}` is third-party text, so it is flattened to one line, stripped
 *   of control characters, and length-capped before substitution.
 * - Unknown `{{…}}` tokens are left as typed so a typo stays visible in the
 *   draft instead of silently disappearing.
 */
import type { TaskProvider } from '../../../shared/task-providers'

export type LinkedWorkItemPromptTemplateItem = {
  provider?: TaskProvider
  type?: 'issue' | 'pr' | 'mr'
  number?: number | null
  url?: string
  title?: string
  linearIdentifier?: string
  jiraIdentifier?: string
}

export const LINKED_WORK_ITEM_PROMPT_TITLE_MAX_CHARS = 200

const PLACEHOLDER_PATTERN = /\{\{(url|identifier|title)\}\}/g
const TITLE_UNSAFE_CHARS_PATTERN = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+/gu

function resolveIdentifier(item: LinkedWorkItemPromptTemplateItem): string {
  const named = item.linearIdentifier?.trim() || item.jiraIdentifier?.trim()
  if (named) {
    return named
  }
  // Why: Linear/Jira use sentinel numbers (0) that are not real item numbers.
  if (
    item.provider === 'linear' ||
    item.provider === 'jira' ||
    typeof item.number !== 'number' ||
    item.number <= 0
  ) {
    return ''
  }
  return item.type === 'mr' ? `!${item.number}` : `#${item.number}`
}

function sanitizeTitle(title: string | undefined): string {
  const flattened = (title ?? '').replace(TITLE_UNSAFE_CHARS_PATTERN, ' ').replace(/\s+/g, ' ')
  return Array.from(flattened.trim())
    .slice(0, LINKED_WORK_ITEM_PROMPT_TITLE_MAX_CHARS)
    .join('')
    .trimEnd()
}

/** Returns null when the template is blank or renders to whitespace, so the caller falls back. */
export function renderLinkedWorkItemPromptTemplate(
  template: string | null | undefined,
  item: LinkedWorkItemPromptTemplateItem | null | undefined
): string | null {
  if (!template?.trim() || !item) {
    return null
  }
  const values = {
    url: item.url?.trim() ?? '',
    identifier: resolveIdentifier(item),
    title: sanitizeTitle(item.title)
  }
  const rendered = template.replace(
    PLACEHOLDER_PATTERN,
    (_match, name: keyof typeof values) => values[name]
  )
  return rendered.trim() ? rendered.trim() : null
}
