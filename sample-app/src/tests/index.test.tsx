import { describe, it } from 'vitest'
import MyApp from '@sample/app'
import { render } from '@testing-library/react'

describe('App', () => {
  it('renders without crashing', async () => {
    render(<MyApp />)
    // await waitFor(() => {
    //   expect(
    //     screen.getByRole("heading", { name: "Welcome!" })
    //   ).toBeInTheDocument()
    // })
  })
})
