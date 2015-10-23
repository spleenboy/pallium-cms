---
title: File
---
This field allows you to upload files into the entry's directory. You can limit the allowed files using an `accept` key in the `attributes` field.

- *rename*: This can be a callback that takes one parameter, the upload object. It should return a valid filename. The full path for the file will be determined using the same rules as how an entry gets saved.
- *multiple*: If set to true, this field will allow multiple file uploads.