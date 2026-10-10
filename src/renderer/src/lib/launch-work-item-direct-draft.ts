import { getLaunchableWorkItemDraftContent } from '@/lib/linked-work-item-context'
import type { LaunchableWorkItem } from '@/lib/launch-work-item-direct-types'

export async function getDirectWorkItemDraftContent(
  item: LaunchableWorkItem,
  _repoConnectionId: string | null,
  promptTemplate?: string
): Promise<string> {
  return getLaunchableWorkItemDraftContent({ ...item, promptTemplate })
}
