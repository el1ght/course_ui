import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ValidatedInput} from "@/components/ui/validated-input"
import {useState, useEffect, useRef} from "react"
import {X} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface KmaxVariant {
    kmax: number;
}

interface Range {
    min: number;
    max: number;
}

interface Experiment1Parameters {
    count: number;
    n: number;
    m: number;
    cRange: Range;
    bRange: Range;
    omegaRange: Range;
    p: number;
    tau: number;
    alpha: number;
    beta: number;
    kmaxVariants: KmaxVariant[];
    l: number;
}

interface AlgorithmResult {
    kmax: number;
    antValue: number;
    antTime: number;
    probValue: number;
    probTime: number;
    relativeDiff: number;
}

interface WebSocketResponse {
    type: string;
    data: {
        [kmax: string]: {
            ant: {
                avg_value: number;
                avg_time: number;
            };
            prob: {
                avg_value: number;
                avg_time: number;
            };
            relative_difference: number;
        };
    };
}

const Experiment1 = () => {
    const [parameters, setParameters] = useState<Experiment1Parameters>({
        count: 1,
        n: 10,
        m: 10,
        cRange: { min: 1000, max: 10000 },
        bRange: { min: 100, max: 1000 },
        omegaRange: { min: 0.0, max: 1.0 },
        p: 0.5,
        tau: 0.5,
        alpha: 1.0,
        beta: 1.0,
        kmaxVariants: [{ kmax: 100 }],
        l: 10
    });

    const [kmax, setKmax] = useState<number>(100);

    const [results, setResults] = useState<AlgorithmResult[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000;

    useEffect(() => {
        let reconnectAttempts = 0;

        const connectWebSocket = () => {
            try {
                const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

                ws.current = new WebSocket(`${WS_BASE_URL}/ws/experiment1`);

                ws.current.onopen = () => {
                    console.log('Connected to WebSocket');
                    reconnectAttempts = 0;
                };

                ws.current.onmessage = (event) => {
                    const response: WebSocketResponse = JSON.parse(event.data);
                    if (response.type === 'results') {
                        const newResults = Object.entries(response.data)
                            .map(([kmax, data]) => ({
                                kmax: Number(kmax),
                                antValue: data.ant.avg_value,
                                antTime: data.ant.avg_time,
                                probValue: data.prob.avg_value,
                                probTime: data.prob.avg_time,
                                relativeDiff: data.relative_difference
                            }))
                            .sort((a, b) => a.kmax - b.kmax);
                        setResults(newResults);
                    }
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                ws.current.onclose = () => {
                    console.log('WebSocket connection closed');

                    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectAttempts++;
                            console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
                            connectWebSocket();
                        }, RECONNECT_DELAY);
                    }
                };
            } catch (error) {
                console.error('Failed to connect:', error);
            }
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const handleSolve = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const dataToSend = {
                count: parameters.count,
                n: parameters.n,
                m: parameters.m,
                kmaxVariants: parameters.kmaxVariants,
                l: parameters.l,
                p: parameters.p,
                tau: parameters.tau,
                alpha: parameters.alpha,
                beta: parameters.beta,
                cRange: parameters.cRange,
                bRange: parameters.bRange,
                omegaRange: parameters.omegaRange
            };

            ws.current.send(JSON.stringify(dataToSend));
        } else {
            console.error('WebSocket is not connected');
        }
    };

    const handleClear = () => {
        setResults([]);
    };

    const exportToCSV = () => {
        if (results.length === 0) return;

        const headers = ['#,K,Час ЙМ,ЦФ ЙМ,Час МК,ЦФ МК,Відносна різниця\n'];

        const csvData = results.map((result, index) => {
            return `${index + 1},${result.kmax},${result.probTime.toFixed(4)},${result.probValue},${result.antTime.toFixed(4)},${result.antValue},${result.relativeDiff.toFixed(2)}\n`;
        });

        const csvString = headers.concat(csvData).join('');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'results.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddKmaxVariant = () => {
        if (parameters.kmaxVariants[0].kmax) {
            const isDuplicate = parameters.kmaxVariants.some(
                variant => variant.kmax === kmax
            );

            if (!isDuplicate) {
                setParameters(prev => ({
                    ...prev,
                    kmaxVariants: [...prev.kmaxVariants, {
                        kmax: kmax
                    }]
                }));
            }
        }
    };

    const handleDeleteKmaxVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            kmaxVariants: prev.kmaxVariants.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Параметри експерименту</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex gap-2 items-center max-w-82 mb-4">
                        <label className="text-gray-500 text-[14px]">N</label>
                        <ValidatedInput
                            type="number"
                            value={parameters.count}
                            onChange={(value) => setParameters(prev => ({ ...prev, count: Number(value) }))}
                            placeholder="N"
                            min={1}
                            step={1}
                            max={1000}
                            isInteger={true}
                        />
                    </div>

                    <div className="flex flex-col gap-4 mb-2">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">n</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.n}
                                    onChange={(value) => setParameters(prev => ({ ...prev, n: Number(value) }))}
                                    placeholder="n"
                                    min={1}
                                    step={1}
                                    max={100}
                                    isInteger={true}
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">m</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.m}
                                    onChange={(value) => setParameters(prev => ({ ...prev, m: Number(value) }))}
                                    placeholder="m"
                                    min={1}
                                    step={1}
                                    max={100}
                                    isInteger={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-2">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmin</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.cRange.min}
                                    onChange={(value) => setParameters(prev => ({ ...prev, cRange: { ...prev.cRange, min: Number(value) } }))}
                                    placeholder="Cmin"
                                    min={1}
                                    step={100}
                                    max={parameters.cRange.max}
                                    isInteger={true}
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmax</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.cRange.max}
                                    onChange={(value) => setParameters(prev => ({ ...prev, cRange: { ...prev.cRange, max: Number(value) } }))}
                                    placeholder="Cmax"
                                    min={parameters.cRange.min}
                                    step={100}
                                    isInteger={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-2">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Bmin</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.bRange.min}
                                    onChange={(value) => setParameters(prev => ({ ...prev, bRange: { ...prev.bRange, min: Number(value) } }))}
                                    placeholder="Bmin"
                                    min={1}
                                    step={100}
                                    max={parameters.bRange.max}
                                    isInteger={true}
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Bmax</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.bRange.max}
                                    onChange={(value) => setParameters(prev => ({ ...prev, bRange: { ...prev.bRange, max: Number(value) } }))}
                                    placeholder="Bmax"
                                    min={parameters.bRange.min}
                                    step={100}
                                    isInteger={true}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">ωmin</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.omegaRange.min}
                                    onChange={(value) => setParameters(prev => ({ ...prev, omegaRange: { ...prev.omegaRange, min: Number(value) } }))}
                                    step={0.01}
                                    placeholder="ωmin"
                                    min={0}
                                    max={parameters.omegaRange.max}
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">ωmax</label>
                                <ValidatedInput
                                    type="number"
                                    value={parameters.omegaRange.max}
                                    onChange={(value) => setParameters(prev => ({ ...prev, omegaRange: { ...prev.omegaRange, max: Number(value) } }))}
                                    step={0.01}
                                    placeholder="ωmax"
                                    min={parameters.omegaRange.min}
                                    max={1}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти Kmax</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">Kmax</label>
                                <ValidatedInput
                                    type="number"
                                    value={kmax}
                                    onChange={(value) => setKmax(Number(value))}
                                    placeholder="Kmax"
                                    min={1}
                                    step={100}
                                />
                            </div>

                            <Button
                                onClick={handleAddKmaxVariant}
                            >
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {parameters.kmaxVariants.map((variant, index) => (
                                <div key={index}
                                     className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">Kmax: {variant.kmax}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteKmaxVariant(index)}
                                        className="h-8 w-8"
                                    >
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Алгоритм мурашиних колоній</CardTitle>
                    <CardDescription>Введіть параметри алгоритму</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="max-w-2xl flex gap-2">
                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">L:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.l}
                                onChange={(value) => setParameters(prev => ({ ...prev, l: Number(value) }))}
                                placeholder="L"
                                min={1}
                                step={1}
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">α:</label>
                            <ValidatedInput
                                value={parameters.alpha}
                                onChange={(value) => {
                                    setParameters(prev => ({ ...prev, alpha: value }));
                                }}
                                placeholder="Альфа"
                                step={0.1}
                                min={0}
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">β:</label>
                            <ValidatedInput
                                value={parameters.beta}
                                onChange={(value) => {
                                    setParameters(prev => ({ ...prev, beta: value }));
                                }}
                                placeholder="Бета"
                                step={0.1}
                                min={0}
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">p:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.p}
                                onChange={(value) => setParameters(prev => ({ ...prev, p: Number(value) }))}
                                placeholder="Випаровування"
                                min={0}
                                step={0.1}
                                max={1}
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">τ0:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.tau}
                                onChange={(value) => setParameters(prev => ({ ...prev, tau: Number(value) }))}
                                placeholder="Початковий феромон"
                                min={0}
                                step={0.1}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <div className="m-5">
                    <Button onClick={handleSolve}>Solve</Button>
                    <Button variant="outline" onClick={handleClear} className="mx-5">Clear</Button>
                    <Button
                        variant="secondary"
                        onClick={exportToCSV}
                        disabled={results.length === 0}
                    >
                        Export to CSV
                    </Button>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Залежність часу від Kmax</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={results}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 50,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="kmax" label={{ value: 'Kmax', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Час (с)', angle: -90, position: 'insideLeft', offset: -10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="probTime" name="Час ЙМ" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="antTime" name="Час МК" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Залежність значення ЦФ від Kmax</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={results}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 50,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="kmax" label={{ value: 'Kmax', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Значення ЦФ', angle: -90, position: 'insideLeft', offset: -10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="probValue" name="ЦФ ЙМ" stroke="#8884d8" />
                                    <Line type="monotone" dataKey="antValue" name="ЦФ МК" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>K</TableHead>
                                <TableHead>Час ЙМ</TableHead>
                                <TableHead>ЦФ ЙМ</TableHead>
                                <TableHead>Час МК</TableHead>
                                <TableHead>ЦФ МК</TableHead>
                                <TableHead>Відносна різниця</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>{result.kmax}</TableCell>
                                    <TableCell>{result.probTime.toFixed(4)}с</TableCell>
                                    <TableCell>{result.probValue}</TableCell>
                                    <TableCell>{result.antTime.toFixed(4)}с</TableCell>
                                    <TableCell>{result.antValue}</TableCell>
                                    <TableCell>{result.relativeDiff.toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

export default Experiment1;