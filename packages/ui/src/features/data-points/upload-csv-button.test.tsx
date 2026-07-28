import { it, expect, afterEach, vi } from 'vitest'
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import UploadCSVButton from './upload-csv-button'

afterEach(() => cleanup())

const valueVars = [
  {
    type: 'continuous' as const,
    name: 'A',
    description: '',
    min: 0,
    max: 10,
    enabled: true,
  },
]

const uploadFile = (contents: string) => {
  const input = screen.getByTestId('upload-csv-input') as HTMLInputElement
  const file = new File([contents], 'data.csv', { type: 'text/csv' })
  fireEvent.change(input, { target: { files: [file] } })
}

it('parses using the provided separator', async () => {
  const onUpload = vi.fn()
  render(
    <UploadCSVButton
      onUpload={onUpload}
      separator={'\t'}
      valueVariables={valueVars}
      categoricalVariables={[]}
      scoreVariables={[]}
    />
  )
  uploadFile('id\tA\tenabled\tvalid\n1\t5\ttrue\ttrue')
  await waitFor(() => expect(onUpload).toHaveBeenCalled())
  expect(onUpload.mock.calls[0]?.[0]?.[0]?.data[0]).toMatchObject({
    name: 'A',
    value: 5,
  })
})

it('calls onError (not onUpload) when the CSV cannot be parsed', async () => {
  const onUpload = vi.fn()
  const onError = vi.fn()
  render(
    <UploadCSVButton
      onUpload={onUpload}
      onError={onError}
      valueVariables={valueVars}
      categoricalVariables={[]}
      scoreVariables={[]}
    />
  )
  // header doesn't contain the expected 'A' column (e.g. wrong delimiter) →
  // csvToDataPoints throws → onError, never onUpload
  uploadFile('nope;nada\n1;2')
  await waitFor(() => expect(onError).toHaveBeenCalled())
  expect(onUpload).not.toHaveBeenCalled()
})
