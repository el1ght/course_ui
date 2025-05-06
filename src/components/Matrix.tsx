import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MatrixProps {
    matrix: number[][]
    setMatrix: (matrix: string[][]) => void
    columnLabels: string[]
    setColumnLabels: (labels: string[]) => void
    rowLabels: string[]
    setRowLabels: (labels: string[]) => void
    isDisabled?: boolean
    showControls?: boolean
}

export function Matrix({
                           matrix,
                           setMatrix,
                           columnLabels,
                           setColumnLabels,
                           rowLabels,
                           setRowLabels,
                           isDisabled = false,
                           showControls = true
                       }: MatrixProps) {

    const handleChange = (row: number, col: number, value: string) => {
        setMatrix(prev => {
            const updated = [...prev]
            updated[row] = [...updated[row]]
            updated[row][col] = value
            return updated
        })
    }

    const handleColumnLabelChange = (index: number, value: string) => {
        setColumnLabels(prev => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const handleRowLabelChange = (index: number, value: string) => {
        setRowLabels(prev => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const removeColumn = (colIndex: number) => {
        setMatrix(prev => prev.map(row => row.filter((_, index) => index !== colIndex)))
        setColumnLabels(prev => prev.filter((_, index) => index !== colIndex))
    }

    const removeRow = (rowIndex: number) => {
        setMatrix(prev => prev.filter((_, index) => index !== rowIndex))
        setRowLabels(prev => prev.filter((_, index) => index !== rowIndex))
    }

    return (
        <div className="inline-block">
            <div className="grid" style={{
                gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`,
                gap: '0.5rem'
            }}>
                <div></div>
                {columnLabels.map((label, index) => (
                    <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                        <Input
                            value={label}
                            disabled={isDisabled}
                            onChange={e => handleColumnLabelChange(index, e.target.value)}
                        />
                        {showControls && (
                            <Button size="sm" onClick={() => removeColumn(index)}>X</Button>
                        )}
                    </div>
                ))}
                <div></div>
                {matrix.map((row, rowIndex) => (
                    <>
                        <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                            <Input
                                value={rowLabels[rowIndex]}
                                disabled={isDisabled}
                                onChange={e => handleRowLabelChange(rowIndex, e.target.value)}
                            />
                            {showControls && (
                                <Button size="sm" onClick={() => removeRow(rowIndex)}>X</Button>
                            )}
                        </div>
                        {row.map((value, colIndex) => (
                            <Input
                                key={`${rowIndex}-${colIndex}`}
                                type="number"
                                step="any"
                                placeholder="0"
                                value={value}
                                disabled={isDisabled}
                                onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                            />
                        ))}
                        <div></div>
                    </>
                ))}
            </div>
        </div>
    )
}