/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("8yrvr9mz8xt2j5d")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_E7YKhfn` ON `apps` (`slug`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("8yrvr9mz8xt2j5d")

  collection.indexes = []

  return dao.saveCollection(collection)
})
