const replacements = {
  "boav": "Bradford on Avon"
};

function replaceLastWordIfNeeded(text) {
  const match = text.match(/(\b\w+)\s$/);
  if (!match) return text;

  const word = match[1];
  const replacement = replacements[word];
  if (!replacement) return text;

  // replace the last word + trailing space with replacement + space
  return text.replace(new RegExp(`${word}\\s$`), `${replacement} `);
}

function handleInput(event) {
  const target = event.target;

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    const value = target.value;
    const updated = replaceLastWordIfNeeded(value);
    if (updated !== value) {
      target.value = updated;
    }
  } else if (target.isContentEditable) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      const updated = replaceLastWordIfNeeded(text);
      if (updated !== text) {
        node.nodeValue = updated;
      }
    }
  }
}

document.addEventListener('input', handleInput, true);
