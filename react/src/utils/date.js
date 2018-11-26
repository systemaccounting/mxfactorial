import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const fromNow = date => {
  return dayjs(date).fromNow()
}

export const dateString = (date, format) => {
  return date ? dayjs(date).format(format) : null
}

export const maxDate = dates => {
  return dates.reduce((prevValue, currentValue) => {
    if (dayjs(currentValue).isAfter(dayjs(prevValue))) {
      return currentValue
    }
    return prevValue
  })
}
