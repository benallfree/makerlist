/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dt7s71yo04pz2yj")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_JR6nfyB` ON `makers` (`user`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "snlbunfl",
    "name": "mrr",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ttvurio5",
    "name": "url",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w4s5ixwh",
    "name": "email",
    "type": "email",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dt7s71yo04pz2yj")

  collection.indexes = []

  // remove
  collection.schema.removeField("snlbunfl")

  // remove
  collection.schema.removeField("ttvurio5")

  // remove
  collection.schema.removeField("w4s5ixwh")

  return dao.saveCollection(collection)
})
