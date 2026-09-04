# Remove sponsored content

Firefox add-on to remove sponsored / promoted content from supported sites.

## Supported sites

| Site | What gets removed |
| --- | --- |
| `amazon.co.uk`, `amazon.com` | Search result items carrying a "Sponsored" label |
| `reddit.com` | `<shreddit-ad-post>` feed ads, plus any post carrying an "Ad" / promoted label (both the current UI and `old.reddit.com`) |

## Adding a site

Site handling lives in the `rules` array at the top of [content.js](content.js). Each rule
declares the hostnames it applies to, the selector(s) for the sponsored label, and the
selector(s) for the surrounding element to remove:

```js
{
  name: 'Example',
  hosts: ['example.com'],
  labels: ['.sponsored-label'],
  containers: ['.result-item']
}
```

The nearest ancestor (or self) of the label matching `containers` is what gets removed.
Optional extras:

- `fallback` - a last-resort container selector, tried only when nothing in `containers`
  matches. Being generic it is trusted only when it holds a single label, so a stale
  selector can't take out a whole feed.
- `wrappers` - layout elements around a container that should go too, but only when they
  hold nothing else (e.g. Reddit wraps each post in its own `<article>`).
- `remove` - selectors for elements that can be removed outright, where the ad is
  identifiable without a separate label (e.g. Reddit's `<shreddit-ad-post>`, and the
  `promotedlink` class `old.reddit.com` puts straight onto the post). These are widened by
  `wrappers` in the same way as containers.

New hostnames also need adding to `content_scripts.matches` in [manifest.json](manifest.json).

## Note on the add-on ID

The gecko ID is still `remove-amazon-sponsored@gregannandale.com` from when this add-on was
Amazon-only. It is deliberately unchanged so signed builds keep updating in place rather
than installing alongside the old one.
