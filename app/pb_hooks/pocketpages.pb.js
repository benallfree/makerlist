/// <reference path="../../pb_data/types.d.ts" />

onAfterBootstrap((e) => {
  const { dbg } = require(`${__hooks}/pocketpages/log`)

  dbg(`pocketpages startup`)

  const pagesRoot = $filepath.join(__hooks, `pages`)

  const physicalFiles = []
  $filepath.walkDir(pagesRoot, (path, d, err) => {
    const isDir = d.isDir()
    if (isDir) {
      return
    }
    physicalFiles.push(path.slice(pagesRoot.length + 1))
  })

  const addressableFiles = physicalFiles.filter(
    (f) => !$filepath.base(f).startsWith(`+`)
  )

  // dbg({ addressableFiles })

  const routes = addressableFiles
    .map((f) => {
      // dbg(`Examining route`, f)
      const parts = f.split('/').filter((p) => !p.startsWith(`(`))
      // dbg({ parts })
      return {
        relativePath: f,
        segments: parts.map((part) => {
          return {
            nodeName: part,
            paramName: part.match(/\[.*\]/)
              ? part.replace(/\[(.*)\]/g, '$1')
              : undefined,
          }
        }),
      }
    })
    .filter((r) => r.segments.length > 0)

  const data = { pagesRoot, routes }
  // dbg({ data })
  $app.cache().set(`pocketpages`, data)
})

function PocketPages(next) {
  const { dbg } = require(`${__hooks}/pocketpages/log`)

  const { pagesRoot, routes } = $app.cache().get(`pocketpages`)
  // dbg(`pocketpages handler`)

  const { existsSync, readFileSync } = require(`${__hooks}/pocketpages/fs`)
  const { marked } = require(`${__hooks}/pocketpages/marked`)

  marked.use({
    useNewRenderer: true,
    renderer: {
      heading({ tokens, depth }) {
        const id = tokens[0].text
          .toLowerCase() // Convert to lowercase
          .trim() // Remove leading/trailing spaces
          .replace(/[^a-z0-9\-_ ]/g, '') // Remove invalid characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        // dbg({ tokens, depth, id })
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
    },
  })
  const ejs = require(`${__hooks}/pocketpages/ejs`)
  const oldCompile = ejs.compile
  ejs.compile = (template, opts) => {
    const fn = oldCompile(template, { ...opts })

    if ($filepath.ext(opts.filename) === '.md') {
      return (data) => {
        // dbg(`***compiling markdown ${opts.filename}`, { data, opts }, fn(data))
        return marked(fn(data))
      }
    }
    return fn
  }

  return (/** @type {echo.Context} */ c) => {
    const { url } = c.request()
    const params = {}

    const urlPath = url.path.slice(1)
    // dbg({ urlPath })

    /**
     * If the URL path is a file, serve it
     */
    const physicalFname = $filepath.join(pagesRoot, urlPath)
    if (existsSync(physicalFname)) {
      // dbg(`Found a file at ${physicalFname}`)
      return c.file(physicalFname)
    }

    const matchedRoute = (() => {
      const tryFnames = [
        `${urlPath}`,
        `${urlPath}.ejs`,
        `${urlPath}.md`,
        `${urlPath}/index.ejs`,
        `${urlPath}/index.md`,
      ]
      // dbg({ tryFnames })
      for (const maybeFname of tryFnames) {
        const parts = maybeFname.split('/').filter((p) => p)
        // dbg({ parts })

        // dbg({ routes })
        const routeCandidates = routes.filter(
          (r) => r.segments.length === parts.length
        )
        // dbg({ routeCandidates })
        for (const route of routeCandidates) {
          const matched = route.segments.every((r, i) => {
            if (r.paramName) {
              params[r.paramName] = parts[i]
              return true
            }
            return r.nodeName === parts[i]
          })
          if (matched) {
            // dbg(`Matched route`, route)
            return route
          }
        }
      }
      return null
    })()

    if (!matchedRoute) {
      return next(c)
    }
    dbg(`Found a matching route`, { matchedRoute })

    const fname = $filepath.join(pagesRoot, matchedRoute.relativePath)
    dbg(`Entry point filename is`, { fname })

    const context = { ctx: c, params, dbg }

    {
      const toVisit = $filepath.dir(matchedRoute.relativePath)
      dbg({ toVisit })
      const parts = toVisit.split('/').filter((p) => p)
      dbg({ parts })
      let current = []
      while (parts.length > 0) {
        current.push(parts.shift())
        const tryFname = $filepath.join(pagesRoot, ...current, `+server.js`)
        dbg({ tryFname })
        if (existsSync(tryFname)) {
          const mod = require(tryFname)
          for (const k in mod) {
            dbg({ k })
            context[k] = mod[k]
          }
        }
      }
    }
    dbg({ context })
    const renderInLayout = (fname, slot) => {
      // dbg(`renderInLayout`, { fname, slot })
      if (!fname.startsWith(pagesRoot)) {
        return slot
      }
      const tryFile = $filepath.join($filepath.dir(fname), `+layout.ejs`)
      const layoutExists = existsSync(tryFile)
      // dbg({ tryFile, layoutExists })
      if (layoutExists) {
        // dbg(`layout found`, { tryFile })
        try {
          const str = ejs.renderFile(tryFile, { ...context, slot })
          return renderInLayout($filepath.dir(tryFile), str)
        } catch (e) {
          throw new BadRequestError(`${e}`)
        }
      } else {
        // dbg(`layout not found`, { tryFile })
        return renderInLayout($filepath.dir(tryFile), slot)
      }
    }

    try {
      var str = ejs.renderFile(fname, context)
      // dbg(`***rendering`, { fname, str })
      if (fname.endsWith('.md')) {
        str = marked(str)
      }
      try {
        const parsed = JSON.parse(str)
        return c.json(200, parsed)
      } catch (e) {}
      str = renderInLayout(fname, str)
      return c.html(200, str)
    } catch (e) {
      const errStr = e.toString().replaceAll(pagesRoot, '')
      return c.html(
        500,
        `<html><body><h1>PocketPages Error</h1>${marked(`\`\`\`\n${errStr}\n\`\`\``)}</body></html>`
      )
    }
  }
}

routerUse(PocketPages)
