/// <reference path="../../pb_data/types.d.ts" />

const records = arrayOf(new Record());

$app.dao().recordQuery("makers").all(records);
