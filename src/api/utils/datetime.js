const persian_tools = require('@persian-tools/persian-tools')


// const modified = new Date(2022, 10, 3, 14, 5, 0)
//   .toLocaleString('fa-IR', { timeZone: 'Asia/Tehran', hour12: false })

const datetime_details = (modified) => {

  const now = new Date()
    .toLocaleString('fa-IR', { timeZone: 'Asia/Tehran', hour12: false })

  const {
    year: n_year,
    month: n_month,
    day: n_day,
    hour: n_hour,
    minutes: n_minutes,
    seconds: n_seconds,
  } = datetime_split(now)

  const {
    year: m_year,
    month: m_month,
    day: m_day,
    hour: m_hour,
    minutes: m_minutes,
    seconds: m_seconds,
  } = datetime_split(modified)

  data = [
    n_year - m_year,
    n_month - m_month,
    n_day - m_day,
    n_hour - m_hour,
    n_minutes - m_minutes,
    n_seconds - m_seconds
  ]


  const pos_items = data.reduce((ret_arr, number, index) => {
    if (number > 0) ret_arr.push(index)
    return ret_arr
  }, [])

  let diff = {}

  switch (pos_items[0]) {
    case 0:
      diff = {
        'typ': 'y',
        'val': data[0],
      }
      break
    case 1:
      diff = {
        'typ': 'M',
        'val': data[1],
      }
      break
    case 2:
      diff = {
        'typ': 'd',
        'val': data[2],
      }
      break
    case 3:
      diff = {
        'typ': 'h',
        'val': data[3],
      }
      break
    case 4:
      diff = {
        'typ': 'm',
        'val': data[4],
      }
      break
    case 5:
      diff = {
        'typ': 's',
        'val': data[5],
      }
      break
  }

  return diff
}


const datetime_split = (datetime) => {
  const splited_datetime = datetime.split(' ')
  const time = splited_datetime[1]
  const date = splited_datetime[0].replace('،', '')

  const splited_date = date.split('/')
  const year = parseInt(persian_tools.digitsFaToEn(splited_date[0]))
  const month = parseInt(persian_tools.digitsFaToEn(splited_date[1]))
  const day = parseInt(persian_tools.digitsFaToEn(splited_date[2]))

  const splited_time = time.split(':')
  const hour = parseInt(persian_tools.digitsFaToEn(splited_time[0]))
  const minutes = parseInt(persian_tools.digitsFaToEn(splited_time[1]))
  const seconds = parseInt(persian_tools.digitsFaToEn(splited_time[2]))

  return {
    year,
    month,
    day,
    hour,
    minutes,
    seconds,
  }
}

module.exports = datetime_details