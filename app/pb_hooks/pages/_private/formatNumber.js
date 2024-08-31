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

module.exports = { formatNumber }
