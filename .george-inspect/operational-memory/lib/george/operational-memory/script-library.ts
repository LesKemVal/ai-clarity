import type { OperationalScript } from './types'

export type OperationalScriptLibrary = {
  getById(id: string): Promise<OperationalScript | null>
  save(script: OperationalScript): Promise<void>
  delete(id: string, ownerId: string): Promise<void>
  listByOwner(ownerId: string): Promise<OperationalScript[]>
}
