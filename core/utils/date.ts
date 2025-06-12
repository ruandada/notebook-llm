import dayjs from 'dayjs'

export const formatRelativeTime = (time: Date): string => {
  const now = dayjs()
  const diff = now.diff(dayjs(time), 'day')

  if (diff <= 1) {
    return dayjs(time).fromNow()
  }

  if (diff <= 7) {
    return dayjs(time).format('ddd, HH:mm:ss')
  }

  if (diff <= 365) {
    return dayjs(time).format('MM/DD, HH:mm:ss')
  }

  return dayjs(time).format('YYYY-MM-DDTHH:mm:ssZ[Z]')
}
