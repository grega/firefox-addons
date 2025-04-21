function removeSponsoredItems() {
  const sponsoredElements = document.querySelectorAll('a.puis-sponsored-label-text');

  sponsoredElements.forEach(el => {
    let container = el.closest('[data-component-type="s-search-result"]');
    if (container) {
      container.remove();
    }
  });
}

removeSponsoredItems();

const observer = new MutationObserver(() => {
  removeSponsoredItems();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
