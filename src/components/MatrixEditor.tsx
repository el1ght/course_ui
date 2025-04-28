import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

export default function MatrixEditor() {
  const [matrix, setMatrix] = useState<string[][]>([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ])
  const [columnLabels, setColumnLabels] = useState<string[]>(["Company 1", "Company 2", "Company 3"])
  const [rowLabels, setRowLabels] = useState<string[]>(["Technic 1", "Technic 2", "Technic 3"])
  const [newColumnLabel, setNewColumnLabel] = useState("")
  const [newRowLabel, setNewRowLabel] = useState("")

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

  const addColumn = () => {
    setMatrix(prev => prev.map(row => [...row, ""]))
    setColumnLabels(prev => [...prev, newColumnLabel || `Company ${prev.length + 1}`])
    setNewColumnLabel("")
  }

  const addRow = () => {
    setMatrix(prev => [...prev, Array(prev[0]?.length || 0).fill("")])
    setRowLabels(prev => [...prev, newRowLabel || `Technic ${prev.length + 1}`])
    setNewRowLabel("")
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
    <div className="flex flex-col gap-4">
        <div className="mt-4 flex justify-between">
            <div className=" flex flex-col gap-2 min-w-xl">
                <div className="flex gap-2 items-center">
                    <Input type="text" id="x" placeholder="Company" value={newColumnLabel} onChange={e => setNewColumnLabel(e.target.value)} />
                    <div className="flex justify-end">
                        <Button onClick={addColumn} className="min-w-40">Add Company</Button>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Input type="text" id="y" placeholder="Technics" value={newRowLabel} onChange={e => setNewRowLabel(e.target.value)} />
                    <div className="flex justify-end">
                        <Button onClick={addRow} className="min-w-40">Add Technics</Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Dialog>
                <DialogTrigger asChild>
                <Button onClick={addRow}>Algorithm 1</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
                </Dialog>
                
                <Button onClick={addRow}>Algorithm 2</Button>
            </div>
        </div>
     

      <Card className="w-full overflow-auto">
        <CardHeader>
          <CardTitle>Матриця Цін</CardTitle>
          <CardDescription>Enter numeric values in the matrix below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`, gap: '0.5rem' }}>
              <div></div>
              {columnLabels.map((label, index) => (
                <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                  <Input value={label} onChange={e => handleColumnLabelChange(index, e.target.value)} />
                  <Button  size="sm" onClick={() => removeColumn(index)}>X</Button>
                </div>
              ))}
              <div></div>
              {matrix.map((row, rowIndex) => (
                <>
                  <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                    <Input value={rowLabels[rowIndex]} onChange={e => handleRowLabelChange(rowIndex, e.target.value)} />
                    <Button  size="sm" onClick={() => removeRow(rowIndex)}>X</Button>
                  </div>
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      placeholder="0"
                      value={value}
                      onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}
                  <div></div>
                </>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="mx-6 max-w-sm flex gap-2">
            <div className="flex gap-2 items-center max-w-30">
          
                <Input type="text" id="min" placeholder="Min"  />
   
            </div>
            <div className="flex gap-2 items-center max-w-30">
      
                <Input type="text" id="max" placeholder="Max" />
            </div>
            <div className="flex justify-end">
                    <Button>Randomize</Button>
                </div>
        </div>

       
      </Card>

      <Card className="w-full overflow-auto">
        <CardHeader>
          <CardTitle>Матриця Знижок</CardTitle>
          <CardDescription>Enter numeric values in the matrix below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`, gap: '0.5rem' }}>
              <div></div>
              {columnLabels.map((label, index) => (
                <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                  <Input value={label} onChange={e => handleColumnLabelChange(index, e.target.value)} />
                  <Button  size="sm" onClick={() => removeColumn(index)}>X</Button>
                </div>
              ))}
              <div></div>
              {matrix.map((row, rowIndex) => (
                <>
                  <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                    <Input value={rowLabels[rowIndex]} onChange={e => handleRowLabelChange(rowIndex, e.target.value)} />
                    <Button  size="sm" onClick={() => removeRow(rowIndex)}>X</Button>
                  </div>
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      placeholder="0"
                      value={value}
                      onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}
                  <div></div>
                </>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="mx-6 max-w-sm flex gap-2">
            <div className="flex gap-2 items-center max-w-30">
          
                <Input type="text" id="min" placeholder="Min"  />
   
            </div>
            <div className="flex gap-2 items-center max-w-30">
      
                <Input type="text" id="max" placeholder="Max" />
            </div>
            <div className="flex justify-end">
                    <Button>Randomize</Button>
                </div>
        </div>

       
      </Card>

      <Card className="w-full overflow-auto">
        <CardHeader>
          <CardTitle>Матриця Технічного Ресурсу</CardTitle>
          <CardDescription>Enter numeric values in the matrix below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`, gap: '0.5rem' }}>
              <div></div>
              {columnLabels.map((label, index) => (
                <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                  <Input value={label} onChange={e => handleColumnLabelChange(index, e.target.value)} />
                  <Button  size="sm" onClick={() => removeColumn(index)}>X</Button>
                </div>
              ))}
              <div></div>
              {matrix.map((row, rowIndex) => (
                <>
                  <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                    <Input value={rowLabels[rowIndex]} onChange={e => handleRowLabelChange(rowIndex, e.target.value)} />
                    <Button  size="sm" onClick={() => removeRow(rowIndex)}>X</Button>
                  </div>
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      placeholder="0"
                      value={value}
                      onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}
                  <div></div>
                </>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="mx-6 max-w-sm flex gap-2">
            <div className="flex gap-2 items-center max-w-30">
          
                <Input type="text" id="min" placeholder="Min"  />
   
            </div>
            <div className="flex gap-2 items-center max-w-30">
      
                <Input type="text" id="max" placeholder="Max" />
            </div>
            <div className="flex justify-end">
                    <Button>Randomize</Button>
                </div>
        </div>

       
      </Card>
    </div>
  )
}
