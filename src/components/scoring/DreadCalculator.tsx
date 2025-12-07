'use client'

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DreadScore {
    damage: number
    reproducibility: number
    exploitability: number
    affectedUsers: number
    discoverability: number
    total: number
}

interface DreadCalculatorProps {
    initialValues?: DreadScore
    onChange?: (score: DreadScore) => void
    readOnly?: boolean
}

export function DreadCalculator({ initialValues, onChange, readOnly = false }: DreadCalculatorProps) {
    const [scores, setScores] = useState({
        damage: initialValues?.damage || 0,
        reproducibility: initialValues?.reproducibility || 0,
        exploitability: initialValues?.exploitability || 0,
        affectedUsers: initialValues?.affectedUsers || 0,
        discoverability: initialValues?.discoverability || 0,
    })

    const total = Object.values(scores).reduce((a, b) => a + b, 0) / 5

    useEffect(() => {
        if (onChange) {
            onChange({ ...scores, total })
        }
    }, [scores, total, onChange])

    const handleScoreChange = (key: keyof typeof scores, value: number) => {
        setScores((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <span>DREAD Score</span>
                    <span className="text-2xl font-bold text-primary">{total.toFixed(1)}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {[
                    { key: "damage", label: "Damage Potential" },
                    { key: "reproducibility", label: "Reproducibility" },
                    { key: "exploitability", label: "Exploitability" },
                    { key: "affectedUsers", label: "Affected Users" },
                    { key: "discoverability", label: "Discoverability" },
                ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                            <Label>{label}</Label>
                            <span className="text-sm text-muted-foreground">{scores[key as keyof typeof scores]}</span>
                        </div>
                        <Slider
                            value={[scores[key as keyof typeof scores]]}
                            max={10}
                            step={1}
                            onValueChange={(val) => handleScoreChange(key as keyof typeof scores, val[0])}
                            disabled={readOnly}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
