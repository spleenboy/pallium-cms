---
title: 'Configuration: Fields'
path: /configuration/fields/
filename: index
---
Each entry screen in Pallium will display a form with editable fields. The value for each of these fields, along with the key you specify in your config for the entry, get saved somewhere. Pallium supports a lot of fields out of the box. Each field definition may require different keys, but at a minimum, each field requires the following.

- *type*: This is used to identify the field and determines its behavior.
- *name*: This is the internal name of the field, used as the key when saving an entry.
- *label*: This is a human-friendly version of the name. It usually gets displays on the entry edit page as the label for a form field.


Some fields also allow the following optional keys.

- *attributes*: This is javascript object with keys and values. Anything set here usually gets added to the input field as HTML attributes.
- *defaultValue*: The default value to use for the field. Some fields don't support this option.
- *placeHolder*: This is used as a placeholder attribute (if applicable.)

If you're curious how a particular field will be rendered on the edit page, check out the `app/views/fields/` folder. The `type` value will map directly to a template in that directory.

 **Neat Trick** Some fields have an `option` attribute that allows the field to display a list of options. Because config values can be functions, you can use this field to display a dynamic list of items!