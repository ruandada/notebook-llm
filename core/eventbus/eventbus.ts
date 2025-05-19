import { Injectable } from '../di'

export interface EventbusEvent<T = any> {
  event: string
  data: T
}

export type EventbusEventListener<E extends EventbusEvent<any>> = (
  ev: E
) => void

@Injectable()
export class Eventbus {
  protected readonly listeners: Map<
    string,
    Set<EventbusEventListener<EventbusEvent>>
  > = new Map()

  public addEventListener<E extends EventbusEvent<any>>(
    event: E['event'],
    listener: EventbusEventListener<E>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event) as Set<EventbusEventListener<E>>
    listeners.add(listener)

    return () => this.removeEventListener(event, listener)
  }

  public removeEventListener<E extends EventbusEvent<any>>(
    event: E['event'],
    listener: EventbusEventListener<E>
  ) {
    const listeners = this.listeners.get(event) as Set<EventbusEventListener<E>>
    if (listeners) {
      listeners.delete(listener)
    }
  }

  public emit<E extends EventbusEvent<any>>(ev: E) {
    const listeners = this.listeners.get(ev.event) as Set<
      EventbusEventListener<any>
    >
    if (!listeners?.size) {
      return
    }

    listeners.forEach((listener) => {
      try {
        listener(ev)
      } catch (e) {
        console.error(e)
      }
    })
  }
}
