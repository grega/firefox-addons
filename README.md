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

Head to https://addons.mozilla.org/en-GB/developers/addons and submit a new add-on for signing / review, or update an existing one.

Select "On your own" when asked "How to Distribute this Version" (as we don't want to publish it publicly).

Signing and review should be automated, and the XPI file will be available for download once the review is complete.

Download the XPI file for the relevant version of the addon - Firefox should automatically prompt to install it.

