import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
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

interface Variant {
    alpha: number;
    beta: number;
}

interface MNVariant {
    m: number;
    n: number;
}

interface KmaxVariant {
    kmax: number;
}

interface LVariant {
    l: number;
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
    variants: Variant[];
    mnVariants: MNVariant[];
    kmaxVariants: KmaxVariant[];
    lVariants: LVariant[];
}

interface AlgorithmResult {
    m: number;
    n: number;
    alpha: number;
    beta: number;
    kmax: number;
    l: number;
    probTime: number;
    probValue: number;
    antTime: number;
    antValue: number;
    relativeDiff: number;
}

const EffectScreen = () => {
    const [parameters, setParameters] = useState<EffectParameters>({
        count: 1,
        cRange: { min: 1000, max: 10000 },
        bRange: { min: 100, max: 1000 },
        omegaRange: { min: 0.0, max: 1.0 },
        p: 0.5,
        tau: 0.5,
        variants: [{ alpha: 1, beta: 1 }],
        mnVariants: [{ m: 5, n: 5 }],
        kmaxVariants: [{ kmax: 100 }],
        lVariants: [{ l: 10 }]
    });

    const [alpha, setAlpha] = useState<number>(1);
    const [beta, setBeta] = useState<number>(1);
    const [m, setM] = useState<number>(5);
    const [n, setN] = useState<number>(5);
    const [kmax, setKmax] = useState<number>(100);
    const [l, setL] = useState<number>(10);

    const [results, setResults] = useState<AlgorithmResult[]>([]);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000;

    useEffect(() => {
        let reconnectAttempts = 0;

        const connectWebSocket = () => {
            try {
                const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

                ws.current = new WebSocket(`${WS_BASE_URL}/ws/experiment`);

                ws.current.onopen = () => {
                    console.log('Connected to WebSocket');
                    setIsConnected(true);
                    reconnectAttempts = 0;
                };

                ws.current.onmessage = (event) => {
                    const { results: data } = JSON.parse(event.data);
                    const newResult: AlgorithmResult = {
                        m: data[0],
                        n: data[1],
                        alpha: data[2],
                        beta: data[3],
                        kmax: data[4],
                        l: data[5],
                        probTime: data[6],
                        probValue: data[7],
                        antTime: data[8],
                        antValue: data[9],
                        relativeDiff: data[10]
                    };
                    setResults(prev => [...prev, newResult]);
                };

                ws.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setIsConnected(false);
                };

                ws.current.onclose = () => {
                    console.log('WebSocket connection closed');
                    setIsConnected(false);

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
                setIsConnected(false);
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
            // Send all parameters as a single object
            const dataToSend = {
                count: parameters.count,
                variants: parameters.variants,
                mnVariants: parameters.mnVariants,
                kmaxVariants: parameters.kmaxVariants,
                lVariants: parameters.lVariants,
                p: parameters.p,
                tau: parameters.tau,
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

        // Створюємо заголовки колонок
        const headers = ['#,m,n,α,β,Kmax,L,Час ЙМ,ЦФ ЙМ,Час МК,ЦФ МК,Відносна різниця\n'];

        // Форматуємо дані
        const csvData = results.map((result, index) => {
            return `${index + 1},${result.m},${result.n},${result.alpha},${result.beta},${result.kmax},${result.l},${result.probTime.toFixed(4)},${result.probValue},${result.antTime.toFixed(4)},${result.antValue},${result.relativeDiff.toFixed(2)}\n`;
        });

        // Об'єднуємо все в один рядок
        const csvString = headers.concat(csvData).join('');

        // Створюємо Blob з даними
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        // Створюємо посилання для завантаження
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'results.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddVariant = () => {
        if (parameters.variants[0].alpha && parameters.variants[0].beta) {
            setParameters(prev => ({
                ...prev,
                variants: [...prev.variants, {
                    alpha: alpha,
                    beta: beta
                }]
            }));
        }
    };

    const handleDeleteVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleAddMNVariant = () => {
        if (parameters.mnVariants[0].m && parameters.mnVariants[0].n) {
            setParameters(prev => ({
                ...prev,
                mnVariants: [...prev.mnVariants, {
                    m: m,
                    n: n
                }]
            }));
        }
    };

    const handleDeleteMNVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            mnVariants: prev.mnVariants.filter((_, i) => i !== index)
        }));
    };

    const handleAddKmaxVariant = () => {
        if (parameters.kmaxVariants[0].kmax) {
            setParameters(prev => ({
                ...prev,
                kmaxVariants: [...prev.kmaxVariants, {
                    kmax: kmax
                }]
            }));
        }
    };

    const handleDeleteKmaxVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            kmaxVariants: prev.kmaxVariants.filter((_, i) => i !== index)
        }));
    };

    const handleAddLVariant = () => {
        if (parameters.lVariants[0].l) {
            setParameters(prev => ({
                ...prev,
                lVariants: [...prev.lVariants, {
                    l: l
                }]
            }));
        }
    };

    const handleDeleteLVariant = (index: number) => {
        setParameters(prev => ({
            ...prev,
            lVariants: prev.lVariants.filter((_, i) => i !== index)
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
                        <Input
                            type="number"
                            value={parameters.count}
                            onChange={(e) => setParameters(prev => ({ ...prev, count: Number(e.target.value) }))}
                            placeholder="N"
                        />
                    </div>

                    <div className="flex flex-col gap-4 mb-2">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmin</label>
                                <Input
                                    type="number"
                                    value={parameters.cRange.min}
                                    onChange={(e) => setParameters(prev => ({ ...prev, cRange: { ...prev.cRange, min: Number(e.target.value) } }))}
                                    placeholder="Cmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmax</label>
                                <Input
                                    type="number"
                                    value={parameters.cRange.max}
                                    onChange={(e) => setParameters(prev => ({ ...prev, cRange: { ...prev.cRange, max: Number(e.target.value) } }))}
                                    placeholder="Cmax"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-2">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Bmin</label>
                                <Input
                                    type="number"
                                    value={parameters.bRange.min}
                                    onChange={(e) => setParameters(prev => ({ ...prev, bRange: { ...prev.bRange, min: Number(e.target.value) } }))}
                                    placeholder="Bmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Bmax</label>
                                <Input
                                    type="number"
                                    value={parameters.bRange.max}
                                    onChange={(e) => setParameters(prev => ({ ...prev, bRange: { ...prev.bRange, max: Number(e.target.value) } }))}
                                    placeholder="Bmax"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">ωmin</label>
                                <Input
                                    type="number"
                                    value={parameters.omegaRange.min}
                                    onChange={(e) => setParameters(prev => ({ ...prev, omegaRange: { ...prev.omegaRange, min: Number(e.target.value) } }))}
                                    step="0.01"
                                    placeholder="ωmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">ωmax</label>
                                <Input
                                    type="number"
                                    value={parameters.omegaRange.max}
                                    onChange={(e) => setParameters(prev => ({ ...prev, omegaRange: { ...prev.omegaRange, max: Number(e.target.value) } }))}
                                    step="0.01"
                                    placeholder="ωmax"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти α, β</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">α</label>
                                <Input
                                    type="number"
                                    value={alpha}
                                    onChange={(e) => setAlpha(Number(e.target.value))}
                                    placeholder="α"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">β</label>
                                <Input
                                    type="number"
                                    value={beta}
                                    onChange={(e) => setBeta(Number(e.target.value))}
                                    placeholder="β"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            <Button
                                onClick={handleAddVariant}
                            >
                                Add
                            </Button>
                        </div>

                        {/* List of added variants */}
                        <div className="flex flex-col gap-2">
                            {parameters.variants.map((variant, index) => (
                                <div key={index}
                                     className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">α: {variant.alpha}</span>
                                        <span className="text-sm">β: {variant.beta}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteVariant(index)}
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

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти m, n</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">m</label>
                                <Input
                                    type="number"
                                    value={m}
                                    onChange={(e) => setM(Number(e.target.value))}
                                    placeholder="m"
                                    min="1"
                                    step="1"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">n</label>
                                <Input
                                    type="number"
                                    value={n}
                                    onChange={(e) => setN(Number(e.target.value))}
                                    placeholder="n"
                                    min="1"
                                    step="1"
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

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти Kmax</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">Kmax</label>
                                <Input
                                    type="number"
                                    value={kmax}
                                    onChange={(e) => setKmax(Number(e.target.value))}
                                    placeholder="Kmax"
                                    min="1"
                                    step="100"
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

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти L</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">L</label>
                                <Input
                                    type="number"
                                    value={l}
                                    onChange={(e) => setL(Number(e.target.value))}
                                    placeholder="L"
                                    min="1"
                                    step="1"
                                />
                            </div>

                            <Button
                                onClick={handleAddLVariant}
                            >
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {parameters.lVariants.map((variant, index) => (
                                <div key={index}
                                     className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">L: {variant.l}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteLVariant(index)}
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
                            <label className="text-gray-500 text-[14px]">p:</label>
                            <Input
                                type="number"
                                value={parameters.p}
                                onChange={(e) => setParameters(prev => ({ ...prev, p: Number(e.target.value) }))}
                                placeholder="Випаровування"
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">τ0:</label>
                            <Input
                                type="number"
                                value={parameters.tau}
                                onChange={(e) => setParameters(prev => ({ ...prev, tau: Number(e.target.value) }))}
                                placeholder="Початковий феромон"
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

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>m</TableHead>
                                <TableHead>n</TableHead>
                                <TableHead>α</TableHead>
                                <TableHead>β</TableHead>
                                <TableHead>Kmax</TableHead>
                                <TableHead>L</TableHead>
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
                                    <TableCell>{result.alpha}</TableCell>
                                    <TableCell>{result.beta}</TableCell>
                                    <TableCell>{result.kmax}</TableCell>
                                    <TableCell>{result.l}</TableCell>
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

export default EffectScreen;