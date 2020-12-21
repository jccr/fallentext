[![npm](https://img.shields.io/npm/v/fallentext)](https://www.npmjs.com/package/fallentext)
[![Node.js CI](https://github.com/jccr/fallentext/workflows/Node.js%20CI/badge.svg)](https://github.com/jccr/fallentext/actions?query=workflow%3A%22Node.js+CI%22)

# 🍂fallentext
A mimic implementation of [`HTMLElement.innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) 

Important notes:
- Does not take CSS styling or layout into account .
- Treats `<title>` value as text, if given `<html>` as the root node.
- Treats `alt` attribute values as text.
- Treats SVG [`<title>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title), [`<desc>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/desc), [`<text>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text) values as text, regardless if contained in [`<defs>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs).
- Treats MathML [`<mtext>`](https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtext) values as text.
- Can be used with [jsdom](https://github.com/jsdom/jsdom), for use with Node.js
