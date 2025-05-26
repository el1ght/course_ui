import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ValidatedInput } from "@/components/ui/validated-input"
import { Dispatch, SetStateAction } from "react"

interface MatrixProps {
    matrix: number[][]
    setMatrix: Dispatch<SetStateAction<number[][]>>
    columnLabels: string[]
    setColumnLabels: Dispatch<SetStateAction<string[]>>
    rowLabels: string[]
    setRowLabels: Dispatch<SetStateAction<string[]>>
    isDisabled?: boolean
    showControls?: boolean
    onRemoveColumn?: (colIndex: number) => void
    onRemoveRow?: (rowIndex: number) => void
    min?: number
    max?: number
    step?: number
}

export function Matrix({
                           matrix,
                           setMatrix,
                           columnLabels,
                           setColumnLabels,
                           rowLabels,
                           setRowLabels,
                           isDisabled = false,
                           showControls = true,
                           onRemoveColumn,
                           onRemoveRow,
                           min,
                           max,
                           step = 1,
                       }: MatrixProps) {

    const handleChange = (row: number, col: number, value: number) => {
        setMatrix((prev: number[][]) => {
            const updated = [...prev]
            updated[row] = [...updated[row]]
            updated[row][col] = value
            return updated
        })
    }

    const handleColumnLabelChange = (index: number, value: string) => {
        setColumnLabels((prev: string[]) => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const handleRowLabelChange = (index: number, value: string) => {
        setRowLabels((prev: string[]) => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const removeColumn = (colIndex: number) => {
        if (onRemoveColumn) {
            onRemoveColumn(colIndex)
        }
        setColumnLabels((prev: string[]) => prev.filter((_: string, index: number) => index !== colIndex))
    }

    const removeRow = (rowIndex: number) => {
        if (onRemoveRow) {
            onRemoveRow(rowIndex)
        }
        setRowLabels((prev: string[]) => prev.filter((_: string, index: number) => index !== rowIndex))
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
                            <ValidatedInput
                                key={`${rowIndex}-${colIndex}`}
                                type="number"
                                step={step}
                                min={min}
                                max={max}
                                placeholder="0"
                                value={value}
                                disabled={isDisabled}
                                onValueChange={(newValue) => handleChange(rowIndex, colIndex, newValue)}
                            />
                        ))}
                        <div></div>
                    </>
                ))}
            </div>
        </div>
    )
}