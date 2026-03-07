export type KnowledgeSourceType = 'file' | 'url'

export type KnowledgeSource = {
  id: string
  ownerId: string
  hospitalName: string
  type: KnowledgeSourceType
  name: string
  url: string
  storagePath?: string
  createdAt?: Date
  updatedAt?: Date
  sizeBytes?: number
}
