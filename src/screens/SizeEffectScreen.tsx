import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const SizeEffectScreen = () => {
    return (
        <div className="flex flex-col gap-4">
            <Card className="w-full overflow-auto">
                <CardHeader>
                    <CardTitle>Size Effect Screen</CardTitle>
                    <CardDescription>Analysis of size effects on algorithm performance</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Add your content here */}
                </CardContent>
            </Card>
        </div>
    )
}

export default SizeEffectScreen
