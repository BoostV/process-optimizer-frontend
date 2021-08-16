import { saveToLocalFile } from './save-to-local-file'

describe('save-to-local-file', () => {
  describe('saveToLocalFile', () => {
    it('download file', () => {
      const objectToSave = {}
      const link: any = {
        click: jest.fn(),
      }
      jest.spyOn(document, 'createElement').mockImplementation(() => link)

      saveToLocalFile(objectToSave, 'the-file-name', 'application/json')

      expect(link.className).toEqual('download-helper')
      expect(link.download).toEqual('the-file-name')
      expect(link.href).toEqual('data:application/json;charset=utf-8;,%7B%7D')
      expect(link.click).toHaveBeenCalledTimes(1)
    })
  })
})
