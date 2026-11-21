import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ScoreNames } from './score-names'
import {
  defaultScoreNameRows,
  ScoreNameRow,
  validateScoreNames,
} from './score-names.utils'

afterEach(cleanup)

const quality: ScoreNameRow = {
  name: 'quality',
  label: 'Quality (0-5)',
  maximize: true,
}
const cost: ScoreNameRow = { name: 'cost', label: 'Cost', maximize: false }

describe('validateScoreNames', () => {
  it('accepts distinct, non-empty names', () => {
    expect(validateScoreNames([{ ...quality, label: 'Yield' }, cost])).toEqual({
      valid: true,
      errors: {},
    })
  })
  it('rejects a name that is empty after trimming', () => {
    const result = validateScoreNames([{ ...quality, label: '  ' }])
    expect(result.valid).toBe(false)
    expect(result.errors.quality).toBe('empty')
  })
  it('rejects duplicate names, ignoring case and surrounding spaces', () => {
    const result = validateScoreNames([
      { ...quality, label: 'Yield' },
      { ...cost, label: ' yield ' },
    ])
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual({ quality: 'duplicate', cost: 'duplicate' })
  })
})

describe('defaultScoreNameRows', () => {
  it('single objective: quality, maximized', () => {
    expect(defaultScoreNameRows(false)).toEqual([quality])
  })
  it('multi objective: quality maximized and cost minimized', () => {
    expect(defaultScoreNameRows(true)).toEqual([quality, cost])
  })
})

describe('ScoreNames card', () => {
  it('read-only: shows names as text with the direction, and an Edit button', () => {
    render(<ScoreNames scores={[quality, cost]} />)
    expect(screen.getByText('Score names')).toBeDefined()
    expect(screen.getByText('Quality (0-5)')).toBeDefined()
    expect(screen.getByText('Cost')).toBeDefined()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined()
    const toggles = screen.getAllByRole('button', { name: 'Maximize' })
    expect(toggles).toHaveLength(2)
    toggles.forEach(t => expect((t as HTMLButtonElement).disabled).toBe(true))
    expect(toggles[0]?.getAttribute('aria-pressed')).toBe('true')
    expect(toggles[1]?.getAttribute('aria-pressed')).toBe('false')
  })

  it('shows one row for a single score', () => {
    render(<ScoreNames scores={[quality]} />)
    expect(screen.getAllByRole('button', { name: 'Maximize' })).toHaveLength(1)
  })

  it('edit, rename, change direction, save: reports the new rows and returns to read-only', () => {
    const onSave = vi.fn()
    render(<ScoreNames scores={[quality, cost]} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    fireEvent.change(inputs[0] as HTMLElement, { target: { value: ' Yield ' } })
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Minimize' })[0] as HTMLElement
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith([
      { name: 'quality', label: 'Yield', maximize: false },
      cost,
    ])
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('clicking the selected direction again keeps it selected', () => {
    const onSave = vi.fn()
    render(<ScoreNames scores={[quality]} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Yield' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith([{ ...quality, label: 'Yield' }])
  })

  it('saving without changes reports nothing and returns to read-only', () => {
    const onSave = vi.fn()
    render(<ScoreNames scores={[quality, cost]} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('cannot save an empty name', () => {
    const onSave = vi.fn()
    render(<ScoreNames scores={[quality]} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' ' } })
    expect(screen.getByText('A score needs a name.')).toBeDefined()
    const save = screen.getByRole('button', { name: 'Save' })
    expect((save as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(save)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cannot save duplicate names', () => {
    render(<ScoreNames scores={[quality, cost]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getAllByRole('textbox')[1] as HTMLElement, {
      target: { value: 'quality (0-5)' },
    })
    expect(screen.getAllByText('Score names must be different.')).toHaveLength(
      2
    )
    expect(
      (screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
  })

  it('follows scores changed from outside while not editing', () => {
    const { rerender } = render(<ScoreNames scores={[quality]} />)
    rerender(<ScoreNames scores={[{ ...quality, label: 'Yield' }]} />)
    expect(screen.getByText('Yield')).toBeDefined()
  })

  it('disabled: no editing', () => {
    render(<ScoreNames scores={[quality]} disabled />)
    expect(
      (screen.getByRole('button', { name: 'Edit' }) as HTMLButtonElement)
        .disabled
    ).toBe(true)
  })

  it('uses overridden texts', () => {
    render(<ScoreNames scores={[quality]} texts={{ title: 'Målnavne' }} />)
    expect(screen.getByText('Målnavne')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined()
  })
})

describe('ScoreNames bare', () => {
  it('is always editable, without card title or buttons', () => {
    render(<ScoreNames variant="bare" scores={[quality, cost]} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    expect(screen.queryByText('Score names')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('reports every change with its validity', () => {
    const onChange = vi.fn()
    render(<ScoreNames variant="bare" scores={[quality]} onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Yield' },
    })
    expect(onChange).toHaveBeenLastCalledWith(
      [{ ...quality, label: 'Yield' }],
      true
    )
    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }))
    expect(onChange).toHaveBeenLastCalledWith(
      [{ ...quality, maximize: false }],
      true
    )
  })

  it('reports an invalid change as invalid', () => {
    const onChange = vi.fn()
    render(<ScoreNames variant="bare" scores={[quality]} onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith(
      [{ ...quality, label: '' }],
      false
    )
  })
})
