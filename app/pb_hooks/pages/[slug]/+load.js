module.exports = (context) => {
  const {
    dbg,
    params: { slug },
    stringify,
  } = context

  const app = (() => {
    try {
      const app = $app.dao().findFirstRecordByData('apps', 'slug', slug)
      dbg({ app })
      $app.dao().expandRecord(app, ['maker'], null)
      return JSON.parse(stringify(app))
    } catch (e) {
      dbg(`${e}`)
    }
  })()

  const maker = (() => {
    try {
      const maker = $app.dao().findFirstRecordByData('makers', 'slug', slug)
      dbg({ maker })
      $app.dao().expandRecord(maker, ['apps_via_maker'], null)
      return JSON.parse(stringify(maker))
    } catch (e) {
      dbg(`${e}`)
    }
  })()

  return { maker, app }
}
