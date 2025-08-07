'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth-context'

// PDF.js will be imported dynamically on the client side
let pdfjsLib: any = null

interface BankGroup {
    id: string
    name: string
    description: string
    specialties: string[]
    confidence: number
    icon?: string
}

interface TaskSubmission {
    id: string
    briefDescription: string
    selectedGroup: BankGroup
    detailedDescription: string
    hasWorkedWithSMBC: boolean
    smbcRelationship: string
    contactPerson: string
    contactEmail: string
    contactPhone: string
    companyName: string
    isSponsor: boolean
    aum: string
    fundStrategy: string
    dealDocuments: string[]
    investorDocuments: string[]
    dealDocumentsContent?: { [filename: string]: string }
    investorDocumentsContent?: { [filename: string]: string }
    otherProblems: string
    futureTeams: string
    submittedAt: Date
    status?: 'pending' | 'reviewed' | 'assigned' | 'completed'
    employeeNotes?: string
}

const TaskSubmissionPage = () => {
    const { logout, switchRole } = useAuth()
    const [step, setStep] = useState<'brief' | 'group-selection' | 'detailed'>('brief')
    
    // Brief description step
    const [briefDescription, setBriefDescription] = useState('')
    const [aiGroups, setAiGroups] = useState<BankGroup[]>([])
    const [selectedGroup, setSelectedGroup] = useState<BankGroup | null>(null)
    const [showAllGroups, setShowAllGroups] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    
    // Detailed submission step
    const [detailedDescription, setDetailedDescription] = useState('')
    const [hasWorkedWithSMBC, setHasWorkedWithSMBC] = useState<boolean | null>(null)
    const [smbcRelationship, setSmbcRelationship] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [isSponsor, setIsSponsor] = useState<boolean | null>(null)
    const [aum, setAum] = useState('')
    const [fundStrategy, setFundStrategy] = useState('')
    const [dealDocuments, setDealDocuments] = useState<File[]>([])
    const [investorDocuments, setInvestorDocuments] = useState<File[]>([])
    const [dealDocumentsContent, setDealDocumentsContent] = useState<{ [filename: string]: string }>({})
    const [investorDocumentsContent, setInvestorDocumentsContent] = useState<{ [filename: string]: string }>({})
    const [otherProblems, setOtherProblems] = useState('')
    const [futureTeams, setFutureTeams] = useState('')
    
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([])

    // Load submissions from localStorage
    useEffect(() => {
        const savedSubmissions = localStorage.getItem('taskSubmissions')
        if (savedSubmissions) {
            const parsed = JSON.parse(savedSubmissions)
            const submissionsWithDates = parsed.map((sub: any) => ({
                ...sub,
                submittedAt: new Date(sub.submittedAt),
                status: sub.status || 'pending',
                employeeNotes: sub.employeeNotes || ''
            }))
            setSubmissions(submissionsWithDates)
        }
    }, [])

    // AI Group Analysis
    // TOOD: We would use the result from `generateAIReasoning` to populate this
    // list. However, I do not want to keep querying the AI model to test so I will
    // just 'cache' it and display it.
    const analyzeTask = async () => {
        if (!briefDescription.trim()) return

        setIsAnalyzing(true)

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 3500))

        // Mock AI analysis based on keywords in the brief description
        const description = briefDescription.toLowerCase()
        const suggestedGroups: BankGroup[] = []

        if (description.includes('fund') || description.includes('private equity') || description.includes('subscription line')) {
            suggestedGroups.push({
                id: 'fund-finance',
                name: 'Fund Finance Solutions',
                description: 'Specialized in private equity fund financing, subscription lines of credit, and fund-level debt solutions.',
                specialties: ['Subscription Lines of Credit', 'Fund-Level Financing', 'Private Equity Support'],
                confidence: 95
            })
        }

        if (description.includes('liquidity') || description.includes('working capital') || description.includes('cash management')) {
            suggestedGroups.push({
                id: 'cash-management',
                name: 'Cash Management & Treasury',
                description: 'Comprehensive cash management solutions, liquidity optimization, and treasury services.',
                specialties: ['Liquidity Management', 'Cash Flow Optimization', 'Treasury Services'],
                confidence: 88
            })
        }

        if (description.includes('acquisition') || description.includes('m&a') || description.includes('buyout')) {
            suggestedGroups.push({
                id: 'm&a-finance',
                name: 'M&A Finance',
                description: 'Financing solutions for mergers, acquisitions, and leveraged buyouts.',
                specialties: ['Acquisition Financing', 'Leveraged Buyouts', 'M&A Advisory'],
                confidence: 73
            })
        }

        if (description.includes('real estate') || description.includes('property') || description.includes('reit')) {
            suggestedGroups.push({
                id: 'real-estate',
                name: 'Real Estate Finance',
                description: 'Real estate financing, REIT support, and property investment solutions.',
                specialties: ['Real Estate Financing', 'REIT Support', 'Property Investment'],
                confidence: 70
            })
        }

        // Add default groups if no specific matches
        if (suggestedGroups.length === 0) {
            suggestedGroups.push({
                id: 'general-banking',
                name: 'General Banking Solutions',
                description: 'Comprehensive banking services for various business needs.',
                specialties: ['General Banking', 'Business Services', 'Financial Solutions'],
                confidence: 68
            })
        }

        setAiGroups(suggestedGroups)
        setSelectedGroup(suggestedGroups[0])
        setIsAnalyzing(false)
        setStep('group-selection')
    }

    // TOOD: We would use the result from `generateAIReasoning` to populate this
    // list. However, I do not want to keep querying the AI model to test so I will
    // just 'cache' it and display it.
    const allBankGroups: BankGroup[] = [
        {
            id: 'fund-finance',
            name: 'Fund Finance Solutions',
            description: 'Specialized in private equity fund financing, subscription lines of credit, and fund-level debt solutions.',
            specialties: ['Subscription Lines of Credit', 'Fund-Level Financing', 'Private Equity Support'],
            confidence: 95
        },
        {
            id: 'cash-management',
            name: 'Cash Management & Treasury',
            description: 'Comprehensive cash management solutions, liquidity optimization, and treasury services.',
            specialties: ['Liquidity Management', 'Cash Flow Optimization', 'Treasury Services'],
            confidence: 88
        },
        {
            id: 'm&a-finance',
            name: 'M&A Finance',
            description: 'Financing solutions for mergers, acquisitions, and leveraged buyouts.',
            specialties: ['Acquisition Financing', 'Leveraged Buyouts', 'M&A Advisory'],
            confidence: 73
        },
        {
            id: 'real-estate',
            name: 'Real Estate Finance',
            description: 'Real estate financing, REIT support, and property investment solutions.',
            specialties: ['Real Estate Financing', 'REIT Support', 'Property Investment'],
            confidence: 70
        },
        {
            id: 'capital-markets',
            name: 'Capital Markets',
            description: 'Debt capital markets, syndicated loans, and structured finance solutions.',
            specialties: ['Debt Capital Markets', 'Syndicated Loans', 'Structured Finance'],
            confidence: 68
        },
        {
            id: 'trade-finance',
            name: 'Trade Finance',
            description: 'International trade financing, letters of credit, and supply chain solutions.',
            specialties: ['Trade Finance', 'Letters of Credit', 'Supply Chain Finance'],
            confidence: 64
        }
    ]

    // TODO: This code is way too junky and unnecessary
    // I found the pdfWorker and builder off of stackoverflow
    // But I do not think we actually need it.
    // We can do a simple read traversal
    const readPDFContent = async (file: File): Promise<string> => {
        try {
            // Use the main build with local worker
            if (!pdfjsLib) {
                const pdfModule = await import('pdfjs-dist')
                pdfjsLib = pdfModule
                // Use local worker file
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
            }

            if (!pdfjsLib || !pdfjsLib.getDocument) {
                throw new Error('PDF.js library not properly loaded')
            }

            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
            let fullText = ''
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ')
                fullText += pageText + '\n'
            }
            
            return fullText
        } catch (error) {
            console.error('Error reading PDF:', error)
            return `Error reading PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }

    const handleFileChange = async (setter: React.Dispatch<React.SetStateAction<File[]>>, contentSetter: React.Dispatch<React.SetStateAction<{ [filename: string]: string }>>, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setter(files)
            
            // Read PDF content for each file
            const contentMap: { [filename: string]: string } = {}
            for (const file of files) {
                if (file.type === 'application/pdf') {
                    const content = await readPDFContent(file)
                    contentMap[file.name] = content
                }
            }
            contentSetter(contentMap)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroup || !contactPerson || !contactEmail || !companyName) return

        const newSubmission: TaskSubmission = {
            id: Date.now().toString(),
            briefDescription,
            selectedGroup,
            detailedDescription,
            hasWorkedWithSMBC: hasWorkedWithSMBC!,
            smbcRelationship,
            contactPerson,
            contactEmail,
            contactPhone,
            companyName,
            isSponsor: isSponsor!,
            aum,
            fundStrategy,
            dealDocuments: dealDocuments.map(file => file.name),
            investorDocuments: investorDocuments.map(file => file.name),
            dealDocumentsContent,
            investorDocumentsContent,
            otherProblems,
            futureTeams,
            submittedAt: new Date()
        }

        const updatedSubmissions = [newSubmission, ...submissions]
        setSubmissions(updatedSubmissions)
        localStorage.setItem('taskSubmissions', JSON.stringify(updatedSubmissions))

        // Reset form
        setStep('brief')
        setBriefDescription('')
        setSelectedGroup(null)
        setAiGroups([])
        setDetailedDescription('')
        setHasWorkedWithSMBC(null)
        setSmbcRelationship('')
        setContactPerson('')
        setContactEmail('')
        setContactPhone('')
        setCompanyName('')
        setIsSponsor(null)
        setAum('')
        setFundStrategy('')
        setDealDocuments([])
        setInvestorDocuments([])
        setDealDocumentsContent({})
        setInvestorDocumentsContent({})
        setOtherProblems('')
        setFutureTeams('')
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'reviewed': return 'bg-blue-100 text-blue-800'
            case 'assigned': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Generate a response from the AI model
    // const getResponseFromAI = async (briefDescription: string) => {
    //     const response = await fetch('/api/ai', {
    //         method: 'POST',
    //         body: JSON.stringify({ briefDescription })
    //     })
    //     return response.json()
    // }

    // const generateAIReasoning = getResponseFromAI(`
    //     You are an expert banking and financial services consultant at SMBC Group, a leading global financial institution.
    //     Your role is to analyze client brief descriptions and provide intelligent team recommendations with detailed reasoning.
    //     
    //     CONTEXT:
    //     - SMBC Group is the 13th largest bank globally with operations in 40+ countries
    //     - We have $2.0T+ in assets and serve over 1,000 corporate clients worldwide
    //     - Our expertise spans private equity, real estate, M&A, treasury services, and capital markets
    //     
    //     TASK:
    //     Analyze the client's brief description and generate a comprehensive response that includes:
    //     1. Team recommendation with confidence score (0-100%)
    //     2. Detailed reasoning for the recommendation
    //     3. SMBC's relevant expertise and track record
    //     4. Keyword analysis from the client's description
    //     5. Market positioning and competitive advantages
    //     
    //     RESPONSE FORMAT:
    //     {
    //         "department": "[Team Name]",
    //         "confidence_score": [0-100],
    //         "key_findings": [
    //             {
    //                 "title": "[Analysis Title]",
    //                 "content": "[Detailed analysis content with specific SMBC data points, transaction examples, and market insights]"
    //             },
    //             {
    //                 "title": "[SMBC Expertise]",
    //                 "content": "[Relevant SMBC track record, deal examples, and market position with specific metrics]"
    //             },
    //             {
    //                 "title": "[Keyword Analysis]",
    //                 "content": "[Analysis of specific terms from client description and how they align with team expertise]"
    //             },
    //             {
    //                 "title": "[Market Context]",
    //                 "content": "[Industry insights, market trends, and competitive positioning relevant to the client's needs]"
    //             }
    //         ],
    //         "alternative_teams": [
    //             {
    //                 "team": "[Alternative Team Name]",
    //                 "reasoning": "[Why this team might also be relevant]",
    //                 "confidence": [0-100]
    //             }
    //         ]
    //     }
    //     
    //     ANALYSIS REQUIREMENTS:
    //     - Use specific SMBC data points (deal sizes, transaction counts, market rankings)
    //     - Include relevant industry statistics and market trends
    //     - Provide concrete examples of similar transactions or client types
    //     - Analyze keyword patterns in the client description
    //     - Consider cross-selling opportunities with other SMBC teams
    //     - Factor in client's potential AUM, deal size, and strategic importance
    //     
    //     TEAM EXPERTISE AREAS:
    //     - Fund Finance: Subscription lines, NAV financing, fund-level debt, private equity support
    //     - Cash Management: Liquidity management, treasury services, cash flow optimization
    //     - M&A Finance: Acquisition financing, leveraged buyouts, M&A advisory
    //     - Real Estate: REIT financing, property investment, real estate debt
    //     - Capital Markets: Debt capital markets, syndicated loans, structured finance
    //     - Trade Finance: International trade, letters of credit, supply chain finance
    //     
    //     EXAMPLE FOR FUND FINANCE:
    //     {
    //         "department": "Fund Finance Solutions",
    //         "confidence_score": 95,
    //         "key_findings": [
    //             {
    //                 "title": "SMBC Fund Finance Leadership",
    //                 "content": "SMBC Group has been arranging subscription financing for private equity funds and asset manager clients since 1999. Over the last five years, we have originated and arranged over US$40bn in transactions globally, making us a top 3 arranger in the fund finance space. Our team has structured over 500 subscription line facilities across all major fund strategies including buyout, growth, venture capital, and real estate."
    //             },
    //             {
    //                 "title": "Market Position & Innovation",
    //                 "content": "We apply a client-led, multi-product approach, working closely with other product partners within the bank to deliver bespoke fund financing solutions. SMBC has pioneered innovative structures including net asset value-based financing and hybrid fund financing solutions. Our average facility size is $150M with the largest transaction at $2.5B."
    //             },
    //             {
    //                 "title": "Keyword Analysis",
    //                 "content": "Your description mentions 'fund' and 'liquidity needs', which directly aligns with our Fund Finance Solutions team's core expertise in subscription lines of credit and fund-level debt solutions. The mention of 'private equity' indicates you're likely seeking institutional-grade financing solutions."
    //             },
    //             {
    //                 "title": "Industry Context",
    //                 "content": "The fund finance market has grown to over $400B globally, with subscription lines representing the fastest-growing segment. SMBC has captured 15% market share in the US fund finance market and serves 80% of the top 50 private equity firms globally."
    //             }
    //         ],
    //         "alternative_teams": [
    //             {
    //                 "team": "Cash Management & Treasury",
    //                 "reasoning": "May also be relevant for broader liquidity management needs beyond fund-specific financing",
    //                 "confidence": 65
    //             }
    //         ]
    //     }
    //     
    //     CLIENT DESCRIPTION TO ANALYZE: ${briefDescription}
    // `)


    // TODO: This is just the cached result that I previously got from the AI model
    // I do not want to keep querying it to test so I will just 'cache' it and 
    // display it.
    const generateAIReasoning = (group: BankGroup, briefDescription: string) => {
        const reasoning: { title: string; content: string }[] = []
        
        switch (group.id) {
            case 'fund-finance':
                reasoning.push(
                    {
                        title: 'SMBC Fund Finance Expertise',
                        content: 'SMBC Group has been arranging subscription financing for private equity funds and asset manager clients since 1999. Over the last five years, we have originated and arranged over US$40bn in transactions globally.'
                    },
                    {
                        title: 'Market Position',
                        content: 'We apply a client-led, multi-product approach, working closely with other product partners within the bank to deliver bespoke fund financing solutions, including developing capabilities in net asset value-based and hybrid fund financing.'
                    },
                    {
                        title: 'Keyword Analysis',
                        content: `Your description mentions "${briefDescription.toLowerCase().includes('fund') ? 'fund' : briefDescription.toLowerCase().includes('private equity') ? 'private equity' : 'subscription line'}", which aligns with our Fund Finance Solutions team's core expertise.`
                    }
                )
                break
            case 'cash-management':
                reasoning.push(
                    {
                        title: 'SMBC Treasury Services',
                        content: 'SMBC operates in 40+ countries with $2.3T in assets, providing comprehensive cash management solutions. Our treasury team serves over 1,000 corporate clients globally.'
                    },
                    {
                        title: 'Keyword Analysis',
                        content: `Your description mentions "${briefDescription.toLowerCase().includes('liquidity') ? 'liquidity' : briefDescription.toLowerCase().includes('working capital') ? 'working capital' : 'cash management'}", which matches our Cash Management & Treasury team's services.`
                    },
                    {
                        title: 'Technology Platform',
                        content: 'SMBC\'s proprietary treasury management platform, SMBC Direct, provides real-time cash visibility and automated cash positioning for clients.'
                    }
                )
                break
            case 'm&a-finance':
                reasoning.push(
                    {
                        title: 'SMBC M&A Leadership',
                        content: 'SMBC has advised on over $500B in M&A transactions globally and is ranked #5 in global M&A advisory. Our M&A Finance team has structured over 200 leveraged buyouts in the past 5 years.'
                    },
                    {
                        title: 'Keyword Analysis',
                        content: `Your description mentions "${briefDescription.toLowerCase().includes('acquisition') ? 'acquisition' : briefDescription.toLowerCase().includes('m&a') ? 'M&A' : 'buyout'}", which aligns with our M&A Finance team's expertise.`
                    },
                    {
                        title: 'Deal Experience',
                        content: 'Our team has experience across all deal sizes, from $50M to $10B+ transactions, with particular strength in middle-market deals.'
                    }
                )
                break
            case 'real-estate':
                reasoning.push(
                    {
                        title: 'SMBC Real Estate Platform',
                        content: 'SMBC is a top 10 real estate lender globally with $45B in real estate assets. Our Real Estate Finance team has financed over 1,000 properties across all major markets.'
                    },
                    {
                        title: 'Keyword Analysis',
                        content: `Your description mentions "${briefDescription.toLowerCase().includes('real estate') ? 'real estate' : briefDescription.toLowerCase().includes('property') ? 'property' : 'REIT'}", which matches our Real Estate Finance team's focus.`
                    },
                    {
                        title: 'REIT Expertise',
                        content: 'SMBC has been a leading REIT lender for over 20 years, with relationships with 80% of the top 50 public REITs in the US.'
                    }
                )
                break
            default:
                reasoning.push(
                    {
                        title: 'SMBC Global Presence',
                        content: 'As the 13th largest bank globally with operations in 40+ countries, SMBC provides comprehensive banking solutions for businesses of all sizes.'
                    },
                    {
                        title: 'General Banking Services',
                        content: 'Our General Banking Solutions team can address a wide range of financial needs and will connect you with specialized teams as needed.'
                    }
                )
        }
        
        return reasoning
    }

    return (
        <div className='flex flex-col grow bg-gray-100 items-center min-h-[900px] p-8'>
            <div className="w-full max-w-6xl space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">SMBC Task Submission Portal</h1>
                        <p className="text-gray-600 mt-1">Client Portal - Submit your banking needs and get connected to the right team</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => switchRole('employee')} 
                            variant="outline"
                        >
                            Switch to Employee View
                        </Button>
                        <Button onClick={logout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-4">
                    <div className={`flex items-center ${step === 'brief' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step === 'brief' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>1</div>
                        <span className="ml-2">Brief Description</span>
                    </div>
                    <div className="w-8 h-1 bg-gray-300"></div>
                    <div className={`flex items-center ${step === 'group-selection' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step === 'group-selection' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>2</div>
                        <span className="ml-2">Select Group</span>
                    </div>
                    <div className="w-8 h-1 bg-gray-300"></div>
                    <div className={`flex items-center ${step === 'detailed' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step === 'detailed' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>3</div>
                        <span className="ml-2">Detailed Information</span>
                    </div>
                </div>

                {/* Step 1: Brief Description */}
                {step === 'brief' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Describe Your Needs</CardTitle>
                            <CardDescription>
                                Briefly explain what you're trying to accomplish. Our AI will suggest the most appropriate team to help you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="briefDescription">Brief Description *</Label>
                                <textarea
                                    id="briefDescription"
                                    value={briefDescription}
                                    onChange={(e) => setBriefDescription(e.target.value)}
                                    placeholder="e.g., I am interested in settling approved invoices submitted to me, or I want some liquidity for my new private equity fund..."
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                                    required
                                />
                            </div>
                            <Button 
                                onClick={analyzeTask} 
                                disabled={!briefDescription.trim() || isAnalyzing}
                                className="w-full"
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Analyzing with AI...
                                    </div>
                                ) : (
                                    'Analyze with AI'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Group Selection */}
                {step === 'group-selection' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Select Your Team</CardTitle>
                            <CardDescription>
                                Based on your description, we've identified the best team to help you. You can accept our suggestion or explore other options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* AI Suggestion */}
                            {aiGroups.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">AI Recommendation</h3>
                                    <div className="space-y-3">
                                        {aiGroups.map((group) => (
                                            <div
                                                key={group.id}
                                                className={`border rounded-lg transition-colors ${
                                                    selectedGroup?.id === group.id 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div 
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setSelectedGroup(group)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div>
                                                                <h4 className="font-semibold">{group.name}</h4>
                                                                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {group.specialties.map((specialty, index) => (
                                                                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                                                            {specialty}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-blue-600">
                                                                {group.confidence}% Match
                                                            </div>
                                                            {selectedGroup?.id === group.id && (
                                                                <div className="text-xs text-green-600 mt-1">✓ Selected</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* AI Reasoning Section */}
                                                <div className="border-t bg-gray-50 p-4">
                                                    <h5 className="font-medium text-gray-800 mb-3">Why This Team?</h5>
                                                    <div className="space-y-3">
                                                        {generateAIReasoning(group, briefDescription).map((reason, index) => (
                                                            <div key={index}>
                                                                <h6 className="text-sm font-medium text-gray-700 mb-1">{reason.title}</h6>
                                                                <p className="text-xs text-gray-600 leading-relaxed">{reason.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Explore Other Groups */}
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllGroups(!showAllGroups)}
                                    className="w-full"
                                >
                                    {showAllGroups ? 'Hide' : 'Explore'} Other Teams
                                </Button>
                                
                                {showAllGroups && (
                                    <div className="mt-4 space-y-3">
                                        <h4 className="font-semibold">All Available Teams</h4>
                                        {allBankGroups.filter(group => !aiGroups.find(aiGroup => aiGroup.id === group.id)).map((group) => (
                                            <div
                                                key={group.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedGroup?.id === group.id 
                                                        ? 'border-blue-500 bg-blue-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setSelectedGroup(group)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div>
                                                            <h4 className="font-semibold">{group.name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {group.specialties.map((specialty, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                                                        {specialty}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-blue-600">
                                                            {group.confidence}% Match
                                                        </div>
                                                        {selectedGroup?.id === group.id && (
                                                            <div className="text-xs text-green-600">✓ Selected</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setStep('brief')}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button 
                                    onClick={() => setStep('detailed')}
                                    disabled={!selectedGroup}
                                    className="flex-1"
                                >
                                    Continue
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Detailed Information */}
                {step === 'detailed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 3: Provide Detailed Information</CardTitle>
                            <CardDescription>
                                Help us understand your needs better and prepare for our team to assist you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Selected Group Display */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Selected Team: {selectedGroup?.name}</h4>
                                    <p className="text-sm text-gray-600">{selectedGroup?.description}</p>
                                </div>

                                {/* Detailed Description */}
                                <div>
                                    <Label htmlFor="detailedDescription">Detailed Description *</Label>
                                    <textarea
                                        id="detailedDescription"
                                        value={detailedDescription}
                                        onChange={(e) => setDetailedDescription(e.target.value)}
                                        placeholder="Provide a more thorough description of your problem/solution needed..."
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                                        required
                                    />
                                </div>

                                {/* SMBC Relationship */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Have you worked with SMBC before? *</Label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="smbcWorked"
                                                    checked={hasWorkedWithSMBC === true}
                                                    onChange={() => setHasWorkedWithSMBC(true)}
                                                    required
                                                />
                                                Yes
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="smbcWorked"
                                                    checked={hasWorkedWithSMBC === false}
                                                    onChange={() => setHasWorkedWithSMBC(false)}
                                                    required
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {hasWorkedWithSMBC && (
                                        <div>
                                            <Label htmlFor="smbcRelationship">Please describe your relationship with SMBC</Label>
                                            <textarea
                                                id="smbcRelationship"
                                                value={smbcRelationship}
                                                onChange={(e) => setSmbcRelationship(e.target.value)}
                                                placeholder="What services have you used? What teams have you worked with?"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="contactPerson">Contact Person *</Label>
                                        <Input
                                            id="contactPerson"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                            placeholder="Who should we contact?"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="contactEmail">Email Address *</Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="contact@company.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="contactPhone">Phone Number</Label>
                                        <Input
                                            id="contactPhone"
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="companyName">Company Name *</Label>
                                        <Input
                                            id="companyName"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Your company name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Fund Information */}
                                <div className="space-y-4">
                                    <div>
                                        <Label>Are you a sponsor? *</Label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="isSponsor"
                                                    checked={isSponsor === true}
                                                    onChange={() => setIsSponsor(true)}
                                                    required
                                                />
                                                Yes
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="isSponsor"
                                                    checked={isSponsor === false}
                                                    onChange={() => setIsSponsor(false)}
                                                    required
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="aum">Assets Under Management (AUM)</Label>
                                            <Input
                                                id="aum"
                                                value={aum}
                                                onChange={(e) => setAum(e.target.value)}
                                                placeholder="e.g., $500M, $1B+"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="fundStrategy">Fund Strategy</Label>
                                            <Input
                                                id="fundStrategy"
                                                value={fundStrategy}
                                                onChange={(e) => setFundStrategy(e.target.value)}
                                                placeholder="e.g., Buyout, Growth, Venture Capital"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Document Uploads */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="dealDocuments">Deal Information (Legal/Finance Documents)</Label>
                                        <Input
                                            id="dealDocuments"
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange(setDealDocuments, setDealDocumentsContent, e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {dealDocuments.length > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {dealDocuments.map(file => file.name).join(', ')}
                                                {Object.keys(dealDocumentsContent).length > 0 && (
                                                    <div className="text-green-600 mt-1">
                                                        ✓ PDF content extracted for {Object.keys(dealDocumentsContent).length} file(s)
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="investorDocuments">Investor List or Other Important Documents</Label>
                                        <Input
                                            id="investorDocuments"
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange(setInvestorDocuments, setInvestorDocumentsContent, e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {investorDocuments.length > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {investorDocuments.map(file => file.name).join(', ')}
                                                {Object.keys(investorDocumentsContent).length > 0 && (
                                                    <div className="text-green-600 mt-1">
                                                        ✓ PDF content extracted for {Object.keys(investorDocumentsContent).length} file(s)
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Opportunities */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="otherProblems">Other Problems to Address</Label>
                                        <textarea
                                            id="otherProblems"
                                            value={otherProblems}
                                            onChange={(e) => setOtherProblems(e.target.value)}
                                            placeholder="Do you have any other problems you need to address with another team at the bank?"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="futureTeams">Future Team Collaborations</Label>
                                        <textarea
                                            id="futureTeams"
                                            value={futureTeams}
                                            onChange={(e) => setFutureTeams(e.target.value)}
                                            placeholder="What other teams do you anticipate working with in the future?"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        onClick={() => setStep('group-selection')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="flex-1"
                                    >
                                        Submit Task
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Previous Submissions */}
                {submissions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Previous Submissions</CardTitle>
                            <CardDescription>
                                Track the status of your submitted tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {submissions.map((submission) => (
                                    <div key={submission.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{submission.companyName}</h3>
                                                <p className="text-gray-600 mt-1">
                                                    <strong>Team:</strong> {submission.selectedGroup.name}
                                                </p>
                                                <p className="text-gray-600">
                                                    <strong>Contact:</strong> {submission.contactPerson} ({submission.contactEmail})
                                                </p>
                                                <p className="text-gray-600 text-sm mt-2">
                                                    {submission.briefDescription}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status || 'pending')}`}>
                                                    {submission.status || 'pending'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {submission.submittedAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default TaskSubmissionPage 