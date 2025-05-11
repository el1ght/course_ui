import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { X } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Variant {
    kmax1: number;
    kmax2: number;
}

const EffectScreen = () => {
    const [kmax1, setKmax1] = useState<string>("");
    const [kmax2, setKmax2] = useState<string>("");
    const [variants, setVariants] = useState<Variant[]>([]);

    const handleAddVariant = () => {
        if (kmax1 && kmax2) {
            setVariants([...variants, {
                kmax1: Number(kmax1),
                kmax2: Number(kmax2)
            }]);
            setKmax1("");
            setKmax2("");
        }
    };

    const handleDeleteVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const isAddButtonDisabled = !kmax1 || !kmax2;

    return (
        <div className="flex flex-col gap-4">
            <Card>
            <CardHeader>
                    <CardTitle>Межі матриць</CardTitle>
                </CardHeader>

                <CardContent>

                <div className="flex gap-2 items-center max-w-82 mb-4">
                                <label className="text-gray-500 text-[14px]">N</label>
                                <Input
                                    type="number"
                                    // value={kmax1}
                                    // onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="N"
                                />
                            </div>

                            <div className="flex flex-col gap-4 mb-2">

                    
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">m</label>
                                <Input
                                    type="number"
                                    // value={kmax1}
                                    // onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="m"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">n</label>
                                <Input
                                    type="number"
                                    // value={kmax2}
                                    // onChange={(e) => setKmax2(e.target.value)}
                                    placeholder="n"
                                />
                            </div>
                        </div>

                
                </div>

                <div className="flex flex-col gap-4 mb-2">

                    
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmin</label>
                                <Input
                                    type="number"
                                    // value={kmax1}
                                    // onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="Cmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Cmax</label>
                                <Input
                                    type="number"
                                    // value={kmax2}
                                    // onChange={(e) => setKmax2(e.target.value)}
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
                                    // value={kmax1}
                                    // onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="Bmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">Bmax</label>
                                <Input
                                    type="number"
                                    // value={kmax2}
                                    // onChange={(e) => setKmax2(e.target.value)}
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
                                    // value={kmax1}
                                    // onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="ωmin"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-40">
                                <label className="text-gray-500 text-[14px]">ωmax</label>
                                <Input
                                    type="number"
                                    // value={kmax2}
                                    // onChange={(e) => setKmax2(e.target.value)}
                                    placeholder="ωmax"
                                />
                            </div>
                        </div>

                
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Варіанти</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="max-w-sm flex gap-2">
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">α</label>
                                <Input
                                    type="number"
                                    value={kmax1}
                                    onChange={(e) => setKmax1(e.target.value)}
                                    placeholder="α"
                                />
                            </div>
                            <div className="flex gap-2 items-center max-w-30">
                                <label className="text-gray-500 text-[14px]">β</label>
                                <Input
                                    type="number"
                                    value={kmax2}
                                    onChange={(e) => setKmax2(e.target.value)}
                                    placeholder="β"
                                />
                            </div>

                            <Button 
                                onClick={handleAddVariant}
                                disabled={isAddButtonDisabled}
                            >
                                Add
                            </Button>
                        </div>

                        {/* List of added variants */}
                        <div className="flex flex-col gap-2">
                            {variants.map((variant, index) => (
                                <div key={index} className="flex gap-2 items-center justify-between bg-secondary/20 p-2 rounded-md">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-sm text-gray-500">#{index + 1}:</span>
                                        <span className="text-sm">α: {variant.kmax1}</span>
                                        <span className="text-sm">β: {variant.kmax2}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteVariant(index)}
                                        className="h-8 w-8"
                                    >
                                        <X className="h-4 w-4" />
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
                </CardHeader>

                <CardContent>
                    <div className="max-w-sm flex gap-2">
                        <div className="flex gap-2 items-center max-w-30">
                            <label className="text-gray-500 text-[14px]">Kmax</label>
                            <Input
                                type="number"
                                // value={probabilisticParams.Kmax}
                                // onChange={(e) => setProbabilisticParams({
                                //     Kmax: Number(e.target.value)
                                // })}
                                placeholder="Kmax"
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
                        <label className="text-gray-500 text-[14px]">Kmax:</label>
                            <Input
                                type="number"
                                // value={antColonyParams.Kmax}
                                // onChange={(e) => setAntColonyParams(prev => ({
                                //     ...prev,
                                //     Kmax: Number(e.target.value)
                                // }))}
                                placeholder="Kmax"
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                        <label className="text-gray-500 text-[14px]">L:</label>
                            <Input
                                type="number"
                                // value={antColonyParams.num_ants}
                                // onChange={(e) => setAntColonyParams(prev => ({
                                //     ...prev,
                                //     num_ants: Number(e.target.value)
                                // }))}
                                placeholder="Кількість мурах"
                            />
                        </div>

                       

                      

                        <div className="flex gap-2 items-center max-w-30">
                        <label className="text-gray-500 text-[14px]">p:</label>
                            <Input
                                type="number"
                                // value={antColonyParams.p}
                                // onChange={(e) => setAntColonyParams(prev => ({
                                //     ...prev,
                                //     p: Number(e.target.value)
                                // }))}
                                placeholder="Випаровування"
                            />
                        </div>

                        <div className="flex gap-2 items-center max-w-30">
                        <label className="text-gray-500 text-[14px]">τ0:</label>
                            <Input
                                type="number"
                                // value={antColonyParams.tau}
                                // onChange={(e) => setAntColonyParams(prev => ({
                                //     ...prev,
                                //     tau: Number(e.target.value)
                                // }))}
                                placeholder="Початковий феромон"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                    <div className="m-5"> 
                    <Button>Solve</Button>

                    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))} */}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
                    </div>
                   
                    
         
            </Card>
        </div>
    )
}

export default EffectScreen;