/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dt7s71yo04pz2yj")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_JR6nfyB` ON `makers` (`user`)",
    "CREATE UNIQUE INDEX `idx_GprvDg2` ON `makers` (`slug`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dt7s71yo04pz2yj")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_JR6nfyB` ON `makers` (`user`)"
  ]

  return dao.saveCollection(collection)
})
