# Firefox add-ons

Various Firefox add-ons...

## Development

In order to install and test add-ons temporarily, zip the contents of any of the add-on folders (not the folder itself) and install them as temporary add-ons:

```
zip -r "$(basename "$PWD").zip" ./*
```

(will overwrite any existing zip file with the same name)

Head to: `about:debugging#/runtime/this-firefox`

Load the zip file as a "Temporary add-on".

## Signing and installation

TBC

