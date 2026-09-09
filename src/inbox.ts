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

// Extracts a trailing #tag (e.g. "#critical") and maps it to its target section.
export function parseCapture(capture: string): ParsedCapture {
  const trimmed = capture.trim()
  const match = trimmed.match(/#(\w+)\s*$/)
  if (match) {
    const section = TAG_SECTIONS[match[1].toLowerCase()]
    if (section) {
      return {text: trimmed.slice(0, match.index).trim(), section}
    }
  }
  return {text: trimmed, section: DEFAULT_SECTION}
}

// Inserts `- item` as the last entry of the given `## section`, creating the section if needed.
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
    newLines.push(heading, `- ${item}`)
    return newLines.join('\n')
  }

  let insertIndex = lines.length
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) {
      insertIndex = i
      break
    }
  }
  while (
    insertIndex > headingIndex + 1 &&
    lines[insertIndex - 1].trim() === ''
  ) {
    insertIndex--
  }

  const newLines = [...lines]
  newLines.splice(insertIndex, 0, `- ${item}`)
  return newLines.join('\n')
}

// Reads (or creates) inbox.md and files the capture under the section matching its tag.
export function captureToTaggedInbox(workspace: string, capture: string): void {
  const inboxPath = path.join(workspace, 'inbox.md')
  const {text, section} = parseCapture(capture)
  const content = fs.existsSync(inboxPath)
    ? fs.readFileSync(inboxPath, 'utf8')
    : '# Inbox'

  fs.writeFileSync(inboxPath, insertIntoSection(content, section, text))
}
