import * as fs from 'fs'
import * as path from 'path'

const TAG_SECTIONS: {[tag: string]: string} = {
  critical: 'Critical Tasks',
  next: 'Next Actions',
  waiting: 'Waiting For'
}
const DEFAULT_SECTION = 'Notes'

export interface ParsedCapture {
  text: string
  section: string
}

// Extracts a trailing #tag (e.g. "#critical") to determine its target section, keeping the tag in the text.
export function parseCapture(capture: string): ParsedCapture {
  const trimmed = capture.trim()
  const match = trimmed.match(/#(\w+)\s*$/)
  if (match) {
    const section = TAG_SECTIONS[match[1].toLowerCase()]
    if (section) {
      return {text: trimmed, section}
    }
  }
  return {text: trimmed, section: DEFAULT_SECTION}
}

// Inserts `- item` as the last entry of the given `## section`, creating the section if needed.
// A blank line always separates the heading from its first item.
export function insertIntoSection(
  content: string,
  section: string,
  item: string
): string {
  const heading = `## ${section}`
  const lines = content.split('\n')
  const headingIndex = lines.findIndex(line => line.trim() === heading)

  if (headingIndex === -1) {
    const newLines = [...lines]
    if (newLines.length > 0 && newLines[newLines.length - 1].trim() !== '') {
      newLines.push('')
    }
    newLines.push(heading, '', `- ${item}`)
    return newLines.join('\n')
  }

  let sectionEnd = lines.length
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      sectionEnd = i
      break
    }
  }

  let lastItemIndex = -1
  for (let i = headingIndex + 1; i < sectionEnd; i++) {
    if (lines[i].trim().startsWith('- ')) {
      lastItemIndex = i
    }
  }

  const newLines = [...lines]
  if (lastItemIndex !== -1) {
    newLines.splice(lastItemIndex + 1, 0, `- ${item}`)
  } else {
    newLines.splice(headingIndex + 1, 0, '', `- ${item}`)
  }
  return newLines.join('\n')
}

// Reads (or creates) inbox.md and files the capture under the section matching its tag.
export function captureToTaggedInbox(workspace: string, capture: string): void {
  const inboxPath = path.join(workspace, 'docs', '00-dashboard', 'inbox.md')
  const {text, section} = parseCapture(capture)
  const content = fs.existsSync(inboxPath)
    ? fs.readFileSync(inboxPath, 'utf8')
    : '# Inbox'

  fs.mkdirSync(path.dirname(inboxPath), {recursive: true})
  fs.writeFileSync(inboxPath, insertIntoSection(content, section, text))
}
