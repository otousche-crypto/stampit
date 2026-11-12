import { describe, expect, it } from 'vitest'
import { parseContributions } from './github'

const day = (date: string, level: number) =>
  `<td tabindex="0" style="width: 11px" data-date="${date}" id="contribution-day-component-0-0" data-level="${level}" role="gridcell" class="ContributionCalendar-day"></td>`

describe('GitHub contributions', () => {
  it('reads one level per day, in date order, and the yearly total', () => {
    // The page lists days row by row (by weekday): out of date order.
    const html = `<h2 id="js-contribution-activity-description">\n  1,204\n  contributions\n  in the last year\n</h2>
      <tr>${day('2025-11-09', 0)}${day('2025-11-16', 4)}</tr><tr>${day('2025-11-10', 2)}</tr>`
    expect(parseContributions(html)).toEqual({ start: '2025-11-09', levels: '024', total: 1204 })
  })

  it('gives up on a page without a calendar', () => {
    expect(parseContributions('<html>Not found</html>')).toBeNull()
  })
})
