'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, AlertTriangle, Shield, TrendingDown } from 'lucide-react'

interface RiskAnalysis {
    regulatoryLegalRisks: {
        title: string
        description: string
        severity: 'low' | 'medium' | 'high' | 'critical'
        relevantText: string
        pageReference?: string
    }[]
    investmentRisks: {
        title: string
        description: string
        severity: 'low' | 'medium' | 'high' | 'critical'
        relevantText: string
        pageReference?: string
    }[]
    potentialDownsides: {
        title: string
        description: string
        severity: 'low' | 'medium' | 'high' | 'critical'
        relevantText: string
        pageReference?: string
    }[]
    summary: {
        overallRiskLevel: 'low' | 'medium' | 'high' | 'critical'
        keyConcerns: string[]
        recommendations: string[]
    }
}

interface PDFAnalysisComponentProps {
    documentName: string
    documentContent: string
    onAnalysisComplete?: (analysis: RiskAnalysis) => void
}

const PDFAnalysisComponent: React.FC<PDFAnalysisComponentProps> = ({
    documentName,
    documentContent,
    onAnalysisComplete
}) => {
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expandedSections, setExpandedSections] = useState<{
        regulatory: boolean
        investment: boolean
        downsides: boolean
    }>({
        regulatory: true,
        investment: true,
        downsides: true
    })

    const systemPrompt = `You are a financial risk analyst specializing in banking and investment documents. Your task is to analyze legal and financial documents for potential risks and concerns.

Analyze the provided document content and identify:

1. REGULATORY AND LEGAL RISKS: Any compliance issues, regulatory violations, legal uncertainties, or potential legal liabilities
2. INVESTMENT RISKS: Financial risks, market risks, credit risks, liquidity issues, or investment-related concerns
3. POTENTIAL DOWNSIDES: Other negative outcomes, operational risks, reputational risks, or business continuity issues

For each identified risk, provide:
- A clear, concise title
- Detailed description of the risk
- Severity level (low, medium, high, critical)
- The exact relevant text from the document
- Page reference if available

Return your analysis in the following JSON format:

{
  "regulatoryLegalRisks": [
    {
      "title": "Risk title",
      "description": "Detailed description",
      "severity": "low|medium|high|critical",
      "relevantText": "Exact text from document",
      "pageReference": "Page number if available"
    }
  ],
  "investmentRisks": [...],
  "potentialDownsides": [...],
  "summary": {
    "overallRiskLevel": "low|medium|high|critical",
    "keyConcerns": ["Key concern 1", "Key concern 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}

Be thorough but concise. Focus on actionable insights that would be relevant for a banking institution evaluating this client or transaction.`

    const analyzeDocument = async () => {
        setIsAnalyzing(true)
        setError(null)

        try {
            const response = await fetch('/api/analyze-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentName,
                    documentContent,
                    systemPrompt
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            
            if (result.error) {
                throw new Error(result.error)
            }

            setAnalysis(result.analysis)
            onAnalysisComplete?.(result.analysis)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during analysis')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'low': return 'bg-green-100 text-green-800 border-green-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🔴'
            case 'high': return '🟠'
            case 'medium': return '🟡'
            case 'low': return '🟢'
            default: return '⚪'
        }
    }

    const toggleSection = (section: 'regulatory' | 'investment' | 'downsides') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const renderRiskSection = (
        title: string,
        risks: any[],
        sectionKey: 'regulatory' | 'investment' | 'downsides',
        icon: React.ReactNode
    ) => {
        if (!risks || risks.length === 0) return null

        return (
            <Card className="mb-4">
                <CardHeader 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection(sectionKey)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {icon}
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <span className="text-sm text-gray-500">({risks.length})</span>
                        </div>
                        {expandedSections[sectionKey] ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </CardHeader>
                
                {expandedSections[sectionKey] && (
                    <CardContent>
                        <div className="space-y-4">
                            {risks.map((risk, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{risk.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(risk.severity)}`}>
                                            {getSeverityIcon(risk.severity)} {risk.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3">{risk.description}</p>
                                    
                                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="text-sm text-gray-700 font-medium mb-1">Relevant Text:</p>
                                        <p className="text-sm text-gray-600 italic">"{risk.relevantText}"</p>
                                        {risk.pageReference && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Page: {risk.pageReference}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {documentName}
                    </CardTitle>
                    <CardDescription>
                        AI-powered risk analysis of uploaded document
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!analysis && !isAnalyzing && (
                        <Button 
                            onClick={analyzeDocument}
                            className="w-full"
                            size="lg"
                        >
                            Analyze Document with AI
                        </Button>
                    )}

                    {isAnalyzing && (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Analyzing document with AI...</p>
                            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 font-medium">Analysis Error</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                            <Button 
                                onClick={analyzeDocument}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-blue-800">
                                        Analysis Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getSeverityColor(analysis.summary.overallRiskLevel).split(' ')[0]} ${getSeverityColor(analysis.summary.overallRiskLevel).split(' ')[1]}`}>
                                                {analysis.summary.overallRiskLevel.toUpperCase()}
                                            </div>
                                            <div className="text-sm text-gray-600">Overall Risk Level</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {analysis.regulatoryLegalRisks.length + analysis.investmentRisks.length + analysis.potentialDownsides.length}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Risks Identified</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {analysis.summary.recommendations.length}
                                            </div>
                                            <div className="text-sm text-gray-600">Recommendations</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-semibold text-blue-800 mb-2">Key Concerns:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {analysis.summary.keyConcerns.map((concern, index) => (
                                                    <li key={index} className="text-sm text-blue-700">{concern}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-blue-800 mb-2">Recommendations:</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {analysis.summary.recommendations.map((rec, index) => (
                                                    <li key={index} className="text-sm text-blue-700">{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Risk Sections */}
                            {renderRiskSection(
                                'Regulatory & Legal Risks',
                                analysis.regulatoryLegalRisks,
                                'regulatory',
                                <Shield className="w-5 h-5 text-red-600" />
                            )}

                            {renderRiskSection(
                                'Investment Risks',
                                analysis.investmentRisks,
                                'investment',
                                <TrendingDown className="w-5 h-5 text-orange-600" />
                            )}

                            {renderRiskSection(
                                'Potential Downsides',
                                analysis.potentialDownsides,
                                'downsides',
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            )}

                            <Button 
                                onClick={analyzeDocument}
                                variant="outline"
                                className="w-full"
                            >
                                🔄 Re-analyze Document
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default PDFAnalysisComponent 