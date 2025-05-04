import { Card, CardHeader, CardTitle, CardDescription, CardContent,  CardFooter, } from "@/components/ui/card"
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

  import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
  } from "@/components/ui/chart"

  import { TrendingUp } from "lucide-react"
  import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

  const chartData = Array.from({ length: 100 }, (_, i) => ({
    index: i + 1,
    desktop: Math.floor(Math.random() * 300) + 50, // random value between 50 and 349
    mobile: Math.floor(Math.random() * 200) + 20,  // random value between 20 and 219
  }))

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#dddddd",
    },
    mobile: {
      label: "Mobile",
      color: "#000000",
    },
  } satisfies ChartConfig

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

      <Card className="w-full overflow-auto">
      <CardHeader>
          <CardTitle>Алгоритм 1</CardTitle>
          <CardDescription>Enter numeric values in the matrix below.</CardDescription>
        </CardHeader>

        <CardContent>


          <div className="mt-6 max-w-sm flex gap-2">
              <div className="flex gap-2 items-center max-w-30">
              
                <Input type="text" id="input" placeholder="Input"  />

              </div>
          </div>
        </CardContent>

      </Card>

      <Card className="w-full overflow-auto">
      <CardHeader>
          <CardTitle>Алгоритм 2</CardTitle>
          <CardDescription>Enter numeric values in the matrix below.</CardDescription>
        </CardHeader>

        <CardContent>


          <div className="mt-6 max-w-2xl flex gap-2">
              <div className="flex gap-2 items-center max-w-30">
              
                <Input type="text" id="input" placeholder="Input"  />

              </div>

              <div className="flex gap-2 items-center max-w-30">
              
              <Input type="text" id="input" placeholder="Input"  />

            </div>

            <div className="flex gap-2 items-center max-w-30">
              
              <Input type="text" id="input" placeholder="Input"  />

            </div>

            <div className="flex gap-2 items-center max-w-30">
              
              <Input type="text" id="input" placeholder="Input"  />

            </div>

            <div className="flex gap-2 items-center max-w-30">
              
              <Input type="text" id="input" placeholder="Input"  />

            </div>

            <div className="flex gap-2 items-center max-w-30">
              
              <Input type="text" id="input" placeholder="Input"  />

            </div>
          </div>
        </CardContent>

      </Card>

      <Card className="w-full overflow-auto">
        <div className="mx-6 max-w-2xl flex-col gap-2">
                <div className="flex">
                    <Button>Solve</Button>
                </div>

                <h1 className="mt-6 mb-4">Алгоритм 1</h1>

                <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`, gap: '0.5rem' }}>
              <div></div>
              {columnLabels.map((label, index) => (
                <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                  <Input value={label} disabled onChange={e => handleColumnLabelChange(index, e.target.value)} />
                </div>
              ))}
              <div></div>
              {matrix.map((row, rowIndex) => (
                <>
                  <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                    <Input value={rowLabels[rowIndex]} disabled onChange={e => handleRowLabelChange(rowIndex, e.target.value)} />
    
                  </div>
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      placeholder="0"
                      value={value}
                      disabled
                      onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}
                  <div></div>
                </>
              ))}
            </div>
          </div>


            <div className="flex gap-2 mt-6 items-center max-w-30">
          
                <Input type="text" disabled id="output" placeholder="Output"  />
   
            </div>

            <h1 className="mt-6 mb-4">Алгоритм 2</h1>

                <div className="inline-block">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${matrix[0]?.length || 0}, 1fr) 50px`, gap: '0.5rem' }}>
              <div></div>
              {columnLabels.map((label, index) => (
                <div key={`col-wrap-${index}`} className="flex items-center gap-2">
                  <Input value={label} disabled onChange={e => handleColumnLabelChange(index, e.target.value)} />
                </div>
              ))}
              <div></div>
              {matrix.map((row, rowIndex) => (
                <>
                  <div key={`row-wrap-${rowIndex}`} className="flex items-center gap-2">
                    <Input value={rowLabels[rowIndex]} disabled onChange={e => handleRowLabelChange(rowIndex, e.target.value)} />
    
                  </div>
                  {row.map((value, colIndex) => (
                    <Input
                      key={`${rowIndex}-${colIndex}`}
                      type="text"
                      placeholder="0"
                      value={value}
                      disabled
                      onChange={e => handleChange(rowIndex, colIndex, e.target.value)}
                    />
                  ))}
                  <div></div>
                </>
              ))}
            </div>
          </div>


            <div className="flex gap-2 mt-6 items-center max-w-30">
          
                <Input type="text" disabled id="output" placeholder="Output"  />
   
            </div>


        </div>

      </Card>

      <Card>
      <CardHeader>
        <CardTitle>Area Chart - Stacked</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="index"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<h1>Hey</h1>}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
    </div>
  )
}
