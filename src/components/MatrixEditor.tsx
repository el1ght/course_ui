import {Card, CardHeader, CardTitle, CardDescription, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {useState} from "react"

import {Matrix} from "@/components/Matrix.tsx";
import {Chart} from "@/components/Chart.tsx";

const chartData = Array.from({length: 100}, (_, i) => ({
    iteration: i + 1,
    aco: Math.floor(Math.random() * 200) + 20,
    prob: Math.floor(Math.random() * 300) + 50,
}))

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


    return (
        <div className="flex flex-col gap-4">
            <div className="mt-4 flex justify-between">
                <div className=" flex flex-col gap-2 min-w-xl">
                    <div className="flex gap-2 items-center">
                        <Input type="text" id="x" placeholder="Company" value={newColumnLabel}
                               onChange={e => setNewColumnLabel(e.target.value)}/>
                        <div className="flex justify-end">
                            <Button onClick={addColumn} className="min-w-40">Add Company</Button>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Input type="text" id="y" placeholder="Technics" value={newRowLabel}
                               onChange={e => setNewRowLabel(e.target.value)}/>
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
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                    />
                </CardContent>
            </Card>

            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Матриця Знижок</CardTitle>
                    <CardDescription>Enter numeric values in the matrix below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                    />
                </CardContent>
            </Card>

            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Матриця Знижок</CardTitle>
                    <CardDescription>Enter numeric values in the matrix below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                    />
                </CardContent>
            </Card>

            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Матриця Технічного Ресурсу</CardTitle>
                    <CardDescription>Enter numeric values in the matrix below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                    />
                </CardContent>
            </Card>

            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Алгоритм 1</CardTitle>
                    <CardDescription>Enter numeric values in the matrix below.</CardDescription>
                </CardHeader>

                <CardContent>


                    <div className="mt-6 max-w-sm flex gap-2">
                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

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

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>

                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>

                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>

                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>

                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>

                        <div className="flex gap-2 items-center max-w-30">

                            <Input type="text" id="input" placeholder="Input"/>

                        </div>
                    </div>
                </CardContent>

            </Card>

            <Card className="w-full overflow-auto">
                <div className="mx-6 max-w-2xl flex-col gap-2">
                    <div className="flex">
                        <Button>Solve</Button>
                    </div>

                    <h2 className="mt-6 mb-4">ймовірнісний алгоритм</h2>
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                        isDisabled={true}
                        showControls={false}
                    />


                    <div className="flex gap-2 mt-6 items-center max-w-30">
                        <Input type="text" disabled id="output" placeholder="Output"/>
                    </div>

                    <h2 className="mt-6 mb-4">Алгоритм мурашиних колоній</h2>
                    <Matrix
                        matrix={matrix}
                        setMatrix={setMatrix}
                        columnLabels={columnLabels}
                        setColumnLabels={setColumnLabels}
                        rowLabels={rowLabels}
                        setRowLabels={setRowLabels}
                        isDisabled={true}
                        showControls={false}
                    />

                    <div className="flex gap-2 mt-6 items-center max-w-30">

                        <Input type="text" disabled id="output" placeholder="Output"/>

                    </div>


                </div>

            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Графік порівняння алгоритмів</CardTitle>
                    <CardDescription>
                        Порівняння результатів роботи алгоритмів по ітераціях
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Chart data={chartData}/>
                </CardContent>
            </Card>
        </div>
    )
}
