/// <reference path="../../../pb_data/types.d.ts" />

module.exports = (context) => {
  const { dbg } = context

  const makers = (() => {
    const makers = arrayOf(new Record())
    $app.dao().recordQuery('makers').all(makers)
    $app.dao().expandRecords(makers, ['apps_via_maker'], null)
    return JSON.parse(JSON.stringify(makers))
  })()

  return { makers }
}
