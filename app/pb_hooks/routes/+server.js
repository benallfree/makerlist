/// <reference path="../../../pb_data/types.d.ts" />

function formatNumber(num) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'b'
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'm'
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'k'
  } else {
    return num.toString()
  }
}

const makers = arrayOf(new Record())
$app.dao().recordQuery('makers').all(makers)
$app.dao().expandRecords(makers, ['apps_via_maker'], null)

module.exports = {
  makers,
  formatNumber,
}
