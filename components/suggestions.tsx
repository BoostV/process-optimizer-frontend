import useStyles from "../styles/suggestions"

interface SuggestionsProps {
    values: any[][]
    headers: string[]
}

export const Suggestions = ({values, headers} : SuggestionsProps) => {
    const classes = useStyles()
    
    return (
    <table>
        <thead className={classes.header} >{headers.map(it => <td>{it}</td> )}</thead>
        {values.map(row => (
            <tr>
                {row.map(it => <td>{it}</td> )}
            </tr>
        ))}
    </table>
)}
