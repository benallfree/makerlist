const client = new PocketBase(`https://makerlist.pockethost.io`);

function formatNumber(num) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + "b";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + "m";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + "k";
  } else {
    return num.toString();
  }
}

page("/:makerSlug/:appSlug", function (ctx) {
  const { makerSlug, appSlug } = ctx.params;
  client
    .collection(`apps`)
    .getFirstListItem(`slug='${appSlug}'`, { expand: "maker" })
    .then((app) => {
      console.log({ app });
      const {
        expand: { maker },
      } = app;
      render(`app-profile.njk`, {
        maker,
        app,
      });
    });
});

page("/:maker", function (ctx) {
  const { maker } = ctx.params;
  client
    .collection(`makers`)
    .getFirstListItem(`slug='${maker}'`, { expand: "apps_via_maker" })
    .then((maker) => {
      console.log({ maker });
      const {
        expand: { apps_via_maker: apps },
      } = maker;
      render(`maker-profile.njk`, {
        maker,
        apps,
      });
    });
});

page("/", function (ctx) {
  client
    .collection(`makers`)
    .getFullList({ expand: "apps_via_maker" })
    .then((makers) => {
      console.log({ makers });

      render(`makers-list.njk`, {
        makers,
      });
    });
});

const render = (template, data) => {
  const $m = $(`#app`);
  $m.empty();
  $m.append(nunjucks.render(template, data));
};

page();

const env = nunjucks.configure("/templates", {
  autoescape: true,
  web: { useCache: true },
});
env.addFilter("formatNumber", formatNumber);
