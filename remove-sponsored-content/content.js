// Site rules describing how to find sponsored / promoted content, and which
// element to remove for it.
//
// - `hosts`      hostnames (suffix match) the rule applies to
// - `labels`     selectors for the "Sponsored" / "Ad" marker itself
// - `containers` selectors for the thing to remove, nearest match wins
// - `fallback`   a last-resort container selector, used only when no
//                `containers` selector matches; being generic it is trusted
//                only when it holds a single label
// - `wrappers`   selectors for layout wrappers around a container; a wrapper
//                is removed too, but only when it holds nothing else
// - `remove`     selectors for elements removable outright, i.e. where the ad
//                is identifiable without a separate label
const rules = [
  {
    name: 'Amazon',
    hosts: ['amazon.co.uk', 'amazon.com'],
    labels: ['.puis-sponsored-label-text'],
    containers: ['[data-component-type="s-search-result"]', '.s-result-item']
  },
  {
    name: 'Reddit',
    hosts: ['reddit.com'],
    labels: ['span.promoted-label'],
    containers: ['shreddit-ad-post', 'shreddit-post', '[data-testid="post-container"]'],
    // each feed post sits in its own <article>, so this still isolates a single
    // ad if the post element above is renamed again
    fallback: 'article',
    wrappers: ['article'],
    // Both UIs put the ad's identity on the post element itself, so these need
    // no label: shreddit-ad-post is the current feed's ad element, and
    // old.reddit.com marks promoted links with a class on the post container
    remove: ['shreddit-ad-post', '.thing.promotedlink']
  }
];

// Never remove these, however a rule matches - a stale selector shouldn't be
// able to blank the page.
const protectedTags = new Set(['HTML', 'HEAD', 'BODY', 'MAIN']);

function appliesToThisSite(rule) {
  return rule.hosts.some(host =>
    location.hostname === host || location.hostname.endsWith(`.${host}`)
  );
}

function isRemovable(el) {
  return el && !protectedTags.has(el.tagName);
}

// Widen a removal target to take in any layout wrapper that holds nothing but
// it, so removing an ad doesn't leave an empty shell behind.
function widen(el, wrappers) {
  while (wrappers.length) {
    const parent = el.parentElement;
    const onlyChild = parent && parent.children.length === 1;
    if (!onlyChild || !isRemovable(parent) || !parent.matches(wrappers.join(', '))) break;
    el = parent;
  }
  return el;
}

// The nearest ancestor (or self) matching one of `containers`, widened to
// include any single-child layout wrapper around it.
function findContainer(labelEl, rule) {
  const containers = rule.containers || [];
  const wrappers = rule.wrappers || [];

  let container = containers.length ? labelEl.closest(containers.join(', ')) : null;

  // Nothing post-specific matched, so fall back to the generic container. It
  // isn't specific to a post, so trust it only when it holds this one ad -
  // holding several means it spans more of the page, e.g. the whole feed.
  if (!container && rule.fallback) {
    container = labelEl.closest(rule.fallback);
    if (container && container.querySelectorAll(rule.labels.join(', ')).length > 1) return null;
  }

  if (!isRemovable(container)) return null;

  return widen(container, wrappers);
}

function removeSponsoredContent() {
  for (const rule of activeRules) {
    for (const selector of rule.remove || []) {
      document.querySelectorAll(selector).forEach(el => {
        if (isRemovable(el)) widen(el, rule.wrappers || []).remove();
      });
    }

    for (const selector of rule.labels || []) {
      document.querySelectorAll(selector).forEach(labelEl => {
        const container = findContainer(labelEl, rule);
        if (container) container.remove();
      });
    }
  }
}

const activeRules = rules.filter(appliesToThisSite);

if (activeRules.length > 0) {
  removeSponsoredContent();

  // Removing elements triggers the observer again, so coalesce mutations into
  // a single pass per frame rather than running on every one.
  let scheduled = false;

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      removeSponsoredContent();
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
