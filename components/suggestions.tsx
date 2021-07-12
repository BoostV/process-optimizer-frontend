import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core"
interface SuggestionsProps {
    values: string[][]
    headers: string[]
}

export const Suggestions = ({values, headers} : SuggestionsProps) => {
    return (
        <>
            {values[0] !== undefined && values[0].length > 0 &&
                <Box mt={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {headers.map((h, i) => <TableCell key={i}>{h}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {values.map((row, ir) => (
                                <TableRow key={ir}>
                                    {row.map((v, iv) => <TableCell key={iv}>{v}</TableCell>)}        
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            }
        </>
)}
