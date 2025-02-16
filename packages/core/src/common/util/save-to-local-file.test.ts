import { describe, expect, it, vi } from 'vitest'
import {
  saveToLocalFile,
  saveCSVToLocalFile,
  saveObjectToLocalFile,
} from './save-to-local-file'

describe('save-to-local-file', () => {
  describe('saveToLocalFile', () => {
    it('Saves file to local disk', () => {
      const payload = 'hello'
      const link: Partial<HTMLAnchorElement> = {
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockImplementation(
        () => link as HTMLElement
      )

      saveToLocalFile(payload, 'the-file-name', 'application/json')

      expect(link.className).toEqual('download-helper')
      expect(link.download).toEqual('the-file-name')
      expect(link.href).toEqual('data:application/json;charset=utf-8;,hello')
      expect(link.click).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveCSVToLocalFile', () => {
    it('Saves CSV', () => {
      const payload = 'hello,world'
      const link: Partial<HTMLAnchorElement> = {
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockImplementation(
        () => link as HTMLElement
      )
      saveCSVToLocalFile(payload, 'file.csv')
      expect(link.download).toEqual('file.csv')
      expect(link.href).toEqual('data:text/csv;charset=utf-8;,hello%2Cworld')
      expect(link.click).toHaveBeenCalledTimes(1)
    })
  })

  describe('saveObjectToLocalFile', () => {
    it('Saves JSON', () => {
      const payload = {
        name: 'test',
      }
      const link: Partial<HTMLAnchorElement> = {
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockImplementation(
        () => link as HTMLElement
      )
      saveObjectToLocalFile(payload, 'file.json')
      expect(link.download).toEqual('file.json')
      expect(link.href).toEqual(
        'data:application/json;charset=utf-8;,%7B%0A%20%20%22name%22%3A%20%22test%22%0A%7D'
      )
      expect(link.click).toHaveBeenCalledTimes(1)
    })
  })
})
