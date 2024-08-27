/// <reference path="../pb_data/types.d.ts" />

function pbhHandler(next) {
  const dbg = (...objs) => {
    console.log(JSON.stringify(objs, null, 2));
  };
  const log = dbg;

  const ejs = require(`${__hooks}/ejs`);
  const { existsSync } = require(`${__hooks}/ejs/fs`);

  const files = [
    ...$filepath.glob($filepath.join(__hooks, `routes`, `**/*.ejs`)),
    ...$filepath.glob($filepath.join(__hooks, `routes`, `*.ejs`)),
  ].map((f) => f.replace(__hooks, "").replace(`/routes/`, ""));

  const routes = files.map((f) => {
    const parts = f.split("/");
    log({ parts });
    return parts.map((part) => {
      return {
        nodeName: part,
        paramName: part.match(/\[.*\]/)
          ? part.replace(/\[(.*)\]/g, "$1")
          : null,
      };
    });
  });

  return (/** @type {echo.Context} */ c) => {
    const { url } = c.request();
    if (url?.path.startsWith("/_") || url?.path.startsWith(`/api`)) {
      return next(c); // proceed with the request chain
    }

    const params = {};

    const urlPath = url.path.slice(1);
    dbg({ urlPath });
    const parts = [...urlPath.split("/"), `index.ejs`].filter((p) => p);
    dbg({ parts });

    const matchedRoute = (() => {
      const routeCandidates = routes.filter((r) => r.length === parts.length);
      dbg({ routeCandidates });
      for (const route of routeCandidates) {
        const matched = route.every((r, i) => {
          if (r.paramName) {
            params[r.paramName] = parts[i];
            return true;
          }
          return r.nodeName === parts[i];
        });
        if (matched) {
          dbg(`Matched route`, route);
          return route;
        }
      }
      return null;
    })();
    if (!matchedRoute) {
      return next(c);
    }
    const fname = $filepath.join(
      __hooks,
      `routes`,
      ...matchedRoute.map((r) => r.nodeName),
    );
    dbg({ matchedRoute, fname });

    const renderInLayout = (fname, slot, finalCb) => {
      dbg(`renderInLayout`, { fname, slot });
      if (!fname.startsWith(__hooks)) {
        finalCb(null, slot);
        return;
      }
      const tryFile = $filepath.join($filepath.dir(fname), `+layout.ejs`);
      const layoutExists = existsSync(tryFile);
      dbg({ tryFile, layoutExists });
      if (layoutExists) {
        dbg(`layout found`, { tryFile });
        ejs.renderFile(
          tryFile,
          { ctx: c, params, slot },
          {},
          function (err, str) {
            if (err) {
              finalCb(new BadRequestError(`${err}`), str);
            }
            renderInLayout($filepath.dir(tryFile), str, finalCb);
          },
        );
      } else {
        dbg(`layout not found`, { tryFile });
        renderInLayout($filepath.dir(tryFile), slot, finalCb);
      }
    };

    ejs.renderFile(fname, { ctx: c, params }, {}, function (err, str) {
      if (err) {
        throw new BadRequestError(`${err}`);
      }
      try {
        const parsed = JSON.parse(str);
        c.json(200, parsed);
      } catch {
        renderInLayout(fname, str, (err, finalOutput) => {
          if (err) {
            throw new BadRequestError(`${err}`);
          }
          return c.html(200, finalOutput);
        });
      }
    });
  };
}

routerUse(pbhHandler);
