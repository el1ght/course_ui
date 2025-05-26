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

interface MNVariant {
    m: number;
    n: number;
}

interface Range {
    min: number;
    max: number;
}

interface EffectParameters {
    count: number;
    alpha: number;
    beta: number;
    cRange: Range;
    bRange: Range;
    omegaRange: Range;
    p: number;
    tau: number;
    mnVariants: MNVariant[];
    probKmax: number;
    antKmax: number;
    l: number;
}

interface AlgorithmResult {
    m: number;
    n: number;
    antValue: number;
    antTime: number;
    probValue: number;
    probTime: number;
    relativeDiff: number;
}

interface WebSocketResponse {
    type: string;
    data: {
        [key: string]: {
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

const Experiment3 = () => {
    const [parameters, setParameters] = useState<EffectParameters>({
        alpha: 1,
        beta: 1,
        count: 1,
        cRange: { min: 1000, max: 10000 },
        bRange: { min: 100, max: 1000 },
        omegaRange: { min: 0.0, max: 1.0 },
        p: 0.5,
        tau: 0.5,
        mnVariants: [{ m: 5, n: 5 }],
        probKmax: 100,
        antKmax: 100,
        l: 10
    });

    const [m, setM] = useState<number>(5);
    const [n, setN] = useState<number>(5);

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

                ws.current = new WebSocket(`${WS_BASE_URL}/ws/experiment3`);

                ws.current.onopen = () => {
                    console.log('Connected to WebSocket');
                    reconnectAttempts = 0;
                };

                ws.current.onmessage = (event) => {
                    const response: WebSocketResponse = JSON.parse(event.data);
                    if (response.type === 'results') {
                        const newResults = Object.entries(response.data)
                            .map(([key, data]) => {
                                const [m, n] = key.split('x').map(Number);
                                return {
                                    m,
                                    n,
                                    antValue: data.ant.avg_value,
                                    antTime: data.ant.avg_time,
                                    probValue: data.prob.avg_value,
                                    probTime: data.prob.avg_time,
                                    relativeDiff: data.relative_difference
                                };
                            })
                            .sort((a, b) => {
                                if (a.m !== b.m) return a.m - b.m;
                                return a.n - b.n;
                            });
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
                mnVariants: parameters.mnVariants,
                p: parameters.p,
                tau: parameters.tau,
                cRange: parameters.cRange,
                bRange: parameters.bRange,
                omegaRange: parameters.omegaRange,
                probKmax: parameters.probKmax,
                antKmax: parameters.antKmax,
                l: parameters.l
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

        const headers = ['#,m,n,Час ЙМ,ЦФ ЙМ,Час МК,ЦФ МК,Відносна різниця\n'];

        const csvData = results.map((result, index) => {
            return `${index + 1},${result.m},${result.n},${result.probTime.toFixed(4)},${result.probValue},${result.antTime.toFixed(4)},${result.antValue},${result.relativeDiff.toFixed(2)}\n`;
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

    const handleAddMNVariant = () => {
        if (parameters.mnVariants[0].m && parameters.mnVariants[0].n) {
            const isDuplicate = parameters.mnVariants.some(
                variant => variant.m === m && variant.n === n
            );

            if (!isDuplicate) {
                setParameters(prev => ({
                    ...prev,
                    mnVariants: [...prev.mnVariants, {
                        m: m,
                        n: n
                    }]
                }));
            }
        }
    };

    const handleDeleteMNVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            mnVariants: prev.mnVariants.filter((_, i) => i !== index)
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
                        />
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
                    <CardTitle>Варіанти m, n</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">m</label>
                                <ValidatedInput
                                    type="number"
                                    value={m}
                                    onChange={(value) => setM(Number(value))}
                                    placeholder="m"
                                    min={1}
                                    step={1}
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">n</label>
                                <ValidatedInput
                                    type="number"
                                    value={n}
                                    onChange={(value) => setN(Number(value))}
                                    placeholder="n"
                                    min={1}
                                    step={1}
                                />
                            </div>

                            <Button
                                onClick={handleAddMNVariant}
                            >
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {parameters.mnVariants.map((variant, index) => (
                                <div key={index}
                                     className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">m: {variant.m}</span>
                                        <span className="text-sm">n: {variant.n}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteMNVariant(index)}
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
                    <CardTitle>Ймовірнісний алгоритм</CardTitle>
                    <CardDescription>Введіть параметри ймовірнісного алгоритму</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="max-w-2xl flex gap-2">
                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">Kmax:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.probKmax}
                                onChange={(value) => setParameters(prev => ({ ...prev, probKmax: Number(value) }))}
                                placeholder="Kmax"
                                min={1}
                                step={100}
                            />
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
                            <label className="text-gray-500 text-[14px]">Kmax:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.antKmax}
                                onChange={(value) => setParameters(prev => ({ ...prev, antKmax: Number(value) }))}
                                placeholder="Kmax"
                                min={1}
                                step={100}
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
                        <h3 className="text-lg font-semibold mb-4">Залежність часу від m*n</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={results.map(r => ({ ...r, size: r.m * r.n }))}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 50,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="size" label={{ value: 'm*n', position: 'insideBottom', offset: -5 }} />
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
                        <h3 className="text-lg font-semibold mb-4">Залежність значення ЦФ від m*n</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={results.map(r => ({ ...r, size: r.m * r.n }))}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 50,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="size" label={{ value: 'm*n', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Значення ЦФ', angle: -90, position: 'insideLeft', offset: -20 }} />
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
                                <TableHead>m</TableHead>
                                <TableHead>n</TableHead>
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
                                    <TableCell>{result.m}</TableCell>
                                    <TableCell>{result.n}</TableCell>
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

export default Experiment3;
