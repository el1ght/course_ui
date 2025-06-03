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

interface BetaVariant {
    beta: number;
}

interface Range {
    min: number;
    max: number;
}

interface EffectParameters {
    count: number;
    cRange: Range;
    bRange: Range;
    omegaRange: Range;
    p: number;
    tau: number;
    alpha: number;
    betaVariants: BetaVariant[];
    antKmax: number;
    m: number;
    n: number;
    l: number;
}

interface AlgorithmResult {
    beta: number;
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

const Experiment2 = () => {
    const [parameters, setParameters] = useState<EffectParameters>({
        count: 1,
        cRange: { min: 1000, max: 10000 },
        bRange: { min: 100, max: 1000 },
        omegaRange: { min: 0.0, max: 1.0 },
        p: 0.5,
        tau: 0.5,
        alpha: 1.0,
        betaVariants: [{ beta: 1.0 }],
        antKmax: 100,
        m: 10,
        n: 10,
        l: 10
    });

    const [beta, setBeta] = useState<number>(1.0);

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

                ws.current = new WebSocket(`${WS_BASE_URL}/ws/experiment2`);

                ws.current.onopen = () => {
                    console.log('Connected to WebSocket');
                    reconnectAttempts = 0;
                };

                ws.current.onmessage = (event) => {
                    const response: WebSocketResponse = JSON.parse(event.data);
                    if (response.type === 'results') {
                        const newResults = Object.entries(response.data)
                            .map(([beta, data]) => ({
                                beta: Number(beta),
                                antValue: data.ant.avg_value,
                                antTime: data.ant.avg_time,
                                probValue: data.prob.avg_value,
                                probTime: data.prob.avg_time,
                                relativeDiff: data.relative_difference
                            }))
                            .sort((a, b) => a.beta - b.beta);
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
                betaVariants: parameters.betaVariants,
                p: parameters.p,
                tau: parameters.tau,
                alpha: parameters.alpha,
                cRange: parameters.cRange,
                bRange: parameters.bRange,
                omegaRange: parameters.omegaRange,
                antKmax: parameters.antKmax,
                m: parameters.m,
                n: parameters.n,
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

        const headers = ['#,β,ЦФ МК,Час МК,ЦФ ЙМ,Час ЙМ,Відносна різниця\n'];

        const csvData = results.map((result, index) => {
            return `${index + 1},${result.beta},${result.antValue},${result.antTime.toFixed(4)},${result.probValue},${result.probTime.toFixed(4)},${result.relativeDiff.toFixed(2)}\n`;
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

    const handleAddBetaVariant = () => {
        if (parameters.betaVariants[0].beta) {
            // Check if variant with same beta already exists
            const isDuplicate = parameters.betaVariants.some(
                variant => variant.beta === beta
            );

            if (!isDuplicate) {
                setParameters(prev => ({
                    ...prev,
                    betaVariants: [...prev.betaVariants, {
                        beta: beta
                    }]
                }));
            }
        }
    };

    const handleDeleteBetaVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            betaVariants: prev.betaVariants.filter((_, i) => i !== index)
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
                    <CardTitle>Варіанти β</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">β</label>
                                <ValidatedInput
                                    type="number"
                                    value={beta}
                                    onChange={(value) => setBeta(Number(value))}
                                    placeholder="β"
                                    min={0}
                                    step={0.1}
                                />
                            </div>

                            <Button
                                onClick={handleAddBetaVariant}
                            >
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {parameters.betaVariants.map((variant, index) => (
                                <div key={index}
                                     className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">β: {variant.beta}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteBetaVariant(index)}
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
                            <label className="text-gray-500 text-[14px]">Kmax:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.antKmax}
                                onChange={(value) => setParameters(prev => ({ ...prev, antKmax: Number(value) }))}
                                placeholder="Kmax"
                                min={1}
                                step={100}
                                isInteger={true}
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">L:</label>
                            <ValidatedInput
                                type="number"
                                value={parameters.l}
                                onChange={(value) => setParameters(prev => ({ ...prev, l: Number(value) }))}
                                placeholder="L"
                                min={1}
                                step={1}
                                isInteger={true}
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
                        <h3 className="text-lg font-semibold mb-4">Залежність значення ЦФ від β</h3>
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
                                    <XAxis dataKey="beta" label={{ value: 'β', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Значення ЦФ', angle: -90, position: 'insideLeft', offset: -10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="antValue" name="ЦФ МК" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>β</TableHead>
                                <TableHead>ЦФ МК</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>{result.beta}</TableCell>
                                    <TableCell>{result.antValue}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

export default Experiment2;
