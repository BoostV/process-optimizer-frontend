export const getRowId = (
  newestFirst: boolean,
  rowIndex: number,
  rowsLength: number
) => (newestFirst ? rowsLength - rowIndex : rowIndex + 1)

export const getRowIndex = (
  newestFirst: boolean,
  rowIndex: number,
  rowsLength: number
) => (newestFirst ? rowsLength - rowIndex - 1 : rowIndex)
