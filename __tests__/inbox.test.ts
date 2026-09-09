import {parseCapture, insertIntoSection} from '../src/inbox'

describe('parseCapture', () => {
  test('extracts #critical tag into Critical Tasks section, keeping the tag', () => {
    expect(parseCapture('Fix the outage #critical')).toEqual({
      text: 'Fix the outage #critical',
      section: 'Critical Tasks'
    })
  })

  test('extracts #next tag into Next Actions section, keeping the tag', () => {
    expect(parseCapture('Write the report #next')).toEqual({
      text: 'Write the report #next',
      section: 'Next Actions'
    })
  })

  test('extracts #waiting tag into Waiting For section, keeping the tag', () => {
    expect(parseCapture('Reply from vendor #waiting')).toEqual({
      text: 'Reply from vendor #waiting',
      section: 'Waiting For'
    })
  })

  test('falls back to Notes when there is no tag', () => {
    expect(parseCapture('Just an idea')).toEqual({
      text: 'Just an idea',
      section: 'Notes'
    })
  })

  test('falls back to Notes for an unrecognized tag', () => {
    expect(parseCapture('Some idea #random')).toEqual({
      text: 'Some idea #random',
      section: 'Notes'
    })
  })

  test('tag matching is case-insensitive', () => {
    expect(parseCapture('Fix the outage #CRITICAL')).toEqual({
      text: 'Fix the outage #CRITICAL',
      section: 'Critical Tasks'
    })
  })
})

describe('insertIntoSection', () => {
  test('creates the section when it does not exist', () => {
    const result = insertIntoSection('# Inbox', 'Critical Tasks', 'Fix the outage')
    expect(result).toBe(
      '# Inbox\n\n## Critical Tasks\n\n- Fix the outage'
    )
  })

  test('adds a blank line before the first item of an already-empty section', () => {
    const content = [
      '# Inbox',
      '',
      '## Critical Tasks',
      '',
      '## Notes'
    ].join('\n')

    const result = insertIntoSection(content, 'Critical Tasks', 'Fix the outage')

    expect(result).toBe(
      [
        '# Inbox',
        '',
        '## Critical Tasks',
        '',
        '- Fix the outage',
        '',
        '## Notes'
      ].join('\n')
    )
  })

  test('appends to the end of an existing section', () => {
    const content = [
      '# Inbox',
      '',
      '## Critical Tasks',
      '- Existing item',
      '',
      '## Notes',
      '- Some note'
    ].join('\n')

    const result = insertIntoSection(content, 'Critical Tasks', 'New item')

    expect(result).toBe(
      [
        '# Inbox',
        '',
        '## Critical Tasks',
        '- Existing item',
        '- New item',
        '',
        '## Notes',
        '- Some note'
      ].join('\n')
    )
  })

  test('appends to the last section in the file', () => {
    const content = ['# Inbox', '', '## Notes', '- Some note'].join('\n')

    const result = insertIntoSection(content, 'Notes', 'Another note')

    expect(result).toBe(
      ['# Inbox', '', '## Notes', '- Some note', '- Another note'].join('\n')
    )
  })
})
