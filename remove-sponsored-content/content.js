// Site rules describing how to find sponsored / promoted content, and which
// element to remove for it.
//
// - `hosts`      hostnames (suffix match) the rule applies to
// - `labels`     selectors for the "Sponsored" / "Ad" marker itself
// - `containers` selectors for the thing to remove, nearest match wins
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
    // 'article' is the last-resort container: each feed post sits in its own
    // one, so it still isolates a single ad if the inner markup changes
    containers: ['shreddit-ad-post', 'shreddit-post', '[data-testid="post-container"]', 'article'],
    wrappers: ['article'],
    // old.reddit.com marks promoted links on the post container directly
    remove: ['.thing.promotedlink']
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

// The nearest ancestor (or self) matching one of `containers`, widened to
// include any single-child layout wrapper around it.
function findContainer(labelEl, rule) {
  const containers = rule.containers || [];
  const wrappers = rule.wrappers || [];

  let container = containers.length ? labelEl.closest(containers.join(', ')) : null;
  if (!isRemovable(container)) return null;

  // A container holding other labelled ads spans more of the page than one ad,
  // so it isn't the post - leave it alone.
  if (container.querySelectorAll(rule.labels.join(', ')).length > 1) return null;

  while (wrappers.length) {
    const parent = container.parentElement;
    const onlyChild = parent && parent.children.length === 1;
    if (!onlyChild || !isRemovable(parent) || !parent.matches(wrappers.join(', '))) break;
    container = parent;
  }

  return container;
}

function removeSponsoredContent() {
  for (const rule of activeRules) {
    for (const selector of rule.remove || []) {
      document.querySelectorAll(selector).forEach(el => {
        if (isRemovable(el)) el.remove();
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
