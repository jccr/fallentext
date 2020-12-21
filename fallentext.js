function walk(root, enter, exit) {
  let node = root
  start: while (node) {
    enter(node)
    if (node.firstChild) {
      node = node.firstChild
      continue
    }
    while (node) {
      exit(node)
      if (node.nextSibling) {
        node = node.nextSibling
        continue start
      }
      if (node === root) node = null
      else node = node.parentNode
    }
  }
}

const phrasingContent = [
  "a",
  "abbr",
  "audio",
  "b",
  "bdo",
  "br",
  "button",
  "canvas",
  "cite",
  "code",
  "command",
  "data",
  "datalist",
  "dfn",
  "em",
  "embed",
  "i",
  "iframe",
  "img",
  "input",
  "kbd",
  "keygen",
  "label",
  "mark",
  "math",
  "meter",
  "noscript",
  "object",
  "output",
  "progress",
  "q",
  "ruby",
  "samp",
  "script",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "svg",
  // "textarea",
  "time",
  "tt",
  "var",
  "video",
  "wbr",
  // special cases
  "map",
  "area",
  "rt",
]

const metadataContent = [
  "base",
  "command",
  "link",
  "meta",
  "noscript",
  "script",
  "style"
]

const ignoredContent = ["rp", "textarea", "iframe", "canvas", "video", "audio"]

const svgTextContent = ["title", "desc", "text", "foreignobject"]

function trimWhitespaceLeft(input) {
  return input.replace(/^[ \t\r\n\f]+/, "")
}

function trimWhitespaceRight(input) {
  return input.replace(/[ \t\r\n\f]+$/, "")
}

function trimSpaces(input) {
  return input.replace(/^[ ]+|[ ]+$/, "")
}

function compressRepeatingWhitespace(input) {
  return input.replace(/[ \t\r\n\f]+/, " ")
}

function compressRepeatingSpaces(input) {
  return input.replace(/[ ]+/, " ")
}

function isElementNodeOfType(node, types) {
  return types.includes(getNodeName(node))
}

function isElement(node) {
  return node.nodeType === 1
}

function isTextNode(node) {
  return node.nodeType === 3
}

function getNodeName(node) {
  return node.nodeName.toLowerCase()
}

export const fallenText = (rootNode) => {
  let runs = []
  let breaks = []
  let text = []

  let shouldSkip = false

  let isPreformatted = false

  let isInSVG = false
  let isInSVGText = false

  let isInMathML = false
  let isInMathMLText = false

  let isInTableRow = false
  let hasEncounteredFirstCell = false

  let isInOptgroup = false
  let isInOptgroupOption = false

  const emptyText = () => {
    text = []
  }

  const processText = (trim) => {
    if (text.length !== 0) {
      let joined = text.join("")
      if (trim) {
        joined = trimSpaces(compressRepeatingSpaces(joined))
      }
      runs = [...runs, joined]
      emptyText()
    }
  }

  const appendNewLine = (doubleBreak) => {
    if (doubleBreak) {
      breaks = [...breaks, "\n", "\n"]
    } else {
      breaks = [...breaks, "\n"]
    }
  }

  const processBreaks = () => {
    if (breaks.length !== 0) {
      runs = [...runs, ...breaks]
      breaks = []
    }
  }

  const isMiddleOfContent = () => {
    return runs.length !== 0 && runs[runs.length - 1] !== "\n"
  }

  const shouldBreak = () => {
    return breaks.length === 0 && isMiddleOfContent()
  }

  const handleParagraphBreaks = () => {
    if (breaks.length === 0) {
      appendNewLine(true)
    } else if (breaks.length === 1) {
      appendNewLine(false)
    }
  }

  const visitElement = (node, enter) => {
    const nodeName = getNodeName(node)
    const isNonPhrasing = !isElementNodeOfType(node, phrasingContent)
    const isSVGText = isElementNodeOfType(node, svgTextContent)

    if (enter) {
      if (nodeName === "pre") {
        processText(true)
        isPreformatted = true
        if (shouldBreak()) {
          appendNewLine(false)
        }
        processBreaks()
      }

      if (nodeName === "tr") {
        isInTableRow = true
      }

      if (nodeName === "svg") {
        isInSVG = true
      }

      if (isInSVG && !isSVGText) {
        return
      }

      if (isInSVG && isSVGText) {
        isInSVGText = true
      }

      if (nodeName === "math") {
        isInMathML = true
      }

      if (isInMathML && nodeName !== "mtext") {
        return
      }

      if (isInMathML && nodeName === "mtext") {
        isInMathMLText = true
      }

      if (nodeName === "optgroup") {
        isInOptgroup = true
      }

      if (isInOptgroup && nodeName !== "option") {
        return
      }

      if (isInOptgroup && nodeName === "option") {
        isInOptgroupOption = true
      }

      if (isNonPhrasing) {
        processText(true)
        if ((isInTableRow && nodeName === "td") || nodeName === "th") {
          processBreaks()
          if (hasEncounteredFirstCell) {
            runs = [...runs, "\t"]
          } else {
            hasEncounteredFirstCell = true
          }
        } else if (nodeName === "p" && isMiddleOfContent()) {
          handleParagraphBreaks()
        } else if (shouldBreak()) {
          appendNewLine(false)
        }
      } else {
        processBreaks()
        if (nodeName === "br") {
          if (text[text.length - 1] === " ") {
            text = text.slice(0, -1)
          }
          if (text[text.length - 1]) {
            text[text.length - 1] = trimWhitespaceRight(text[text.length - 1])
          }
          text = [...text, "\n"]
        }
        if (nodeName === "wbr") {
          text = [...text, "\u200B"]
        }
      }
    } else {
      if (node.hasAttribute("alt")) {
        text = [...text, node.getAttribute("alt")]
      }

      if (nodeName === "pre") {
        isPreformatted = false
        processText(false)
        appendNewLine(false)
      } else if (isNonPhrasing) {
        processText(true)
        if (shouldBreak() && node !== rootNode) {
          if (nodeName == "p") {
            appendNewLine(true)
          } else if (nodeName !== "td" && nodeName !== "th") {
            appendNewLine(false)
          }
        }
      }

      if (nodeName === "tr") {
        isInTableRow = false
        hasEncounteredFirstCell = false
      }

      if (isInSVG && isSVGText) {
        isInSVGText = false
      }

      if (nodeName === "svg") {
        isInSVG = false
      }

      if (isInMathML && nodeName === "mtext") {
        isInMathMLText = false
      }

      if (nodeName === "math") {
        isInMathML = false
      }

      if (isInOptgroup && nodeName === "option") {
        isInOptgroupOption = false
      }

      if (nodeName === "optgroup") {
        isInOptgroup = false
      }
    }
  }

  const visitText = (node, enter) => {
    const textContent = node.textContent

    if (isInSVG && !isInSVGText) {
      return
    }

    if (isInMathML && !isInMathMLText) {
      return
    }

    if (isInOptgroup && !isInOptgroupOption) {
      return
    }

    if (enter) {
      if (!isPreformatted) {
        let trimmed = compressRepeatingWhitespace(textContent)
        if (text[text.length - 1] === "\n") {
          trimmed = trimWhitespaceLeft(trimmed)
        }
        if ((text.length !== 0 && trimmed.length !== 0) || trimmed !== " ") {
          processBreaks()

          text = [...text, trimmed]
        }
      } else {
        text = [...text, textContent]
      }
    }
  }

  walk(
    rootNode,
    (node) => {
      if (
        isElementNodeOfType(node, metadataContent) ||
        isElementNodeOfType(node, ignoredContent)
      ) {
        shouldSkip = true
      }

      if (shouldSkip) {
        return
      }

      if (isElement(node)) {
        visitElement(node, true)
      }

      if (isTextNode(node)) {
        visitText(node, true)
      }
    },
    (node) => {
      if (
        isElementNodeOfType(node, metadataContent) ||
        isElementNodeOfType(node, ignoredContent)
      ) {
        shouldSkip = false
        return
      }

      if (shouldSkip) {
        return
      }

      if (isElement(node)) {
        visitElement(node, false)
      }
    }
  )

  if (runs.length === 1 && runs[0] === "\n") {
    runs = []
  }

  return runs.join("")
}
