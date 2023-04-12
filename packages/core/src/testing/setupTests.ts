import matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

console.log = () => {}
expect.extend(matchers)
