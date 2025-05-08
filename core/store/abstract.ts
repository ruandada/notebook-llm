export interface StorageProvider<T> {
  save(data: T): Promise<void>
  load(): Promise<T>
  isPresent(): Promise<boolean>
}
