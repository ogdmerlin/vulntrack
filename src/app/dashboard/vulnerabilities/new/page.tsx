import { VulnerabilityForm } from "@/components/vulnerability/VulnerabilityForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewVulnerabilityPage() {
    return (
        <div className="mx-auto max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Vulnerability</CardTitle>
                </CardHeader>
                <CardContent>
                    <VulnerabilityForm />
                </CardContent>
            </Card>
        </div>
    )
}
