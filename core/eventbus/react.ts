import { useEffect } from 'react'
import { useInstance } from '../di'
import { Eventbus, EventbusEvent, EventbusEventListener } from './eventbus'

export const useEventbus = () => useInstance(Eventbus)

export const useEventListener = <E extends EventbusEvent<any>>(
  event: E['event'],
  listener: EventbusEventListener<E>
): void => {
  const eventbus = useEventbus()

  useEffect(() => {
    return eventbus.addEventListener(event, listener)
  }, [eventbus, event, listener])
}
