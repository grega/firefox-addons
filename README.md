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

Signing and review should be automated, and the XPI file will be available for download once the review is complete (go to "Manage Status and Versions" for the relevant add-on, then select a version and the XPI should be linked to towards the top of the page).

Download the XPI file for the relevant version of the addon - Firefox should automatically prompt to install it.

### Host permissions after an update

Firefox treats each host an MV3 add-on matches as a separate permission the user can grant or
revoke. Permissions granted at install time carry over on update, but hosts *added* by an
update are not prompted for and arrive **not granted** ([bug 1893232]) - the add-on silently
does nothing on the new site while continuing to work on the old ones.

After an update that adds a site, check `about:addons` -> the add-on -> **Permissions** and
enable the new host.

[bug 1893232]: https://bugzilla.mozilla.org/show_bug.cgi?id=1893232

