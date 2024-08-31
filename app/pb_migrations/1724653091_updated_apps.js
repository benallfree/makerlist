/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("8yrvr9mz8xt2j5d")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "x0zwktiz",
    "name": "maker",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "dt7s71yo04pz2yj",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("8yrvr9mz8xt2j5d")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "x0zwktiz",
    "name": "maker",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "dt7s71yo04pz2yj",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
