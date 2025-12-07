'use client'

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StrideScore {
    spoofing: boolean
    tampering: boolean
    reputation: boolean
    informationDisclosure: boolean
    denialOfService: boolean
    elevationOfPrivilege: boolean
}

interface StrideClassifierProps {
    initialValues?: StrideScore
    onChange: (score: StrideScore) => void
}

export function StrideClassifier({ initialValues, onChange }: StrideClassifierProps) {
    const [classification, setClassification] = useState<StrideScore>({
        spoofing: initialValues?.spoofing || false,
        tampering: initialValues?.tampering || false,
        reputation: initialValues?.reputation || false,
        informationDisclosure: initialValues?.informationDisclosure || false,
        denialOfService: initialValues?.denialOfService || false,
        elevationOfPrivilege: initialValues?.elevationOfPrivilege || false,
    })

    useEffect(() => {
        onChange(classification)
    }, [classification, onChange])

    const handleChange = (key: keyof StrideScore, checked: boolean) => {
        setClassification((prev) => ({ ...prev, [key]: checked }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>STRIDE Classification</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                {[
                    { key: "spoofing", label: "Spoofing" },
                    { key: "tampering", label: "Tampering" },
                    { key: "reputation", label: "Repudiation" },
                    { key: "informationDisclosure", label: "Information Disclosure" },
                    { key: "denialOfService", label: "Denial of Service" },
                    { key: "elevationOfPrivilege", label: "Elevation of Privilege" },
                ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                            id={key}
                            checked={classification[key as keyof StrideScore]}
                            onCheckedChange={(checked) => handleChange(key as keyof StrideScore, checked as boolean)}
                        />
                        <Label htmlFor={key}>{label}</Label>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
