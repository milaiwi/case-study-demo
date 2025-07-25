'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth-context'
import PDFAnalysisComponent from './PDFAnalysisComponent'

interface BankGroup {
    id: string
    name: string
    description: string
    icon: string
    specialties: string[]
    confidence: number
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

const TaskEmployeeDashboard = () => {
    const { logout, switchRole } = useAuth()
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [groupFilter, setGroupFilter] = useState<string>('all')
    const [employeeNotes, setEmployeeNotes] = useState('')
    const [analyzedDocuments, setAnalyzedDocuments] = useState<{ [submissionId: string]: { [documentName: string]: any } }>({})
    const [showPDFAnalysis, setShowPDFAnalysis] = useState(false)

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

    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch = submission.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
        const matchesGroup = groupFilter === 'all' || submission.selectedGroup.id === groupFilter
        return matchesSearch && matchesStatus && matchesGroup
    })

    const updateSubmissionStatus = (submissionId: string, status: string, notes?: string) => {
        const updatedSubmissions = submissions.map(sub => {
            if (sub.id === submissionId) {
                return {
                    ...sub,
                    status: status as any,
                    employeeNotes: notes || sub.employeeNotes
                }
            }
            return sub
        })
        setSubmissions(updatedSubmissions)
        localStorage.setItem('taskSubmissions', JSON.stringify(updatedSubmissions))
        
        if (selectedSubmission?.id === submissionId) {
            setSelectedSubmission(updatedSubmissions.find(sub => sub.id === submissionId) || null)
        }
    }

    const handleStatusUpdate = (submissionId: string, newStatus: string) => {
        updateSubmissionStatus(submissionId, newStatus, employeeNotes)
        setEmployeeNotes('')
    }

    const handlePDFAnalysisComplete = (submissionId: string, documentName: string, analysis: any) => {
        setAnalyzedDocuments(prev => ({
            ...prev,
            [submissionId]: {
                ...prev[submissionId],
                [documentName]: analysis
            }
        }))
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

    const getTotalDocuments = (submission: TaskSubmission) => {
        return submission.dealDocuments.length + submission.investorDocuments.length
    }

    // AI Analysis Helper Functions
    const generateClientProfile = (submission: TaskSubmission) => {
        const profile = {
            size: submission.aum ? 'Large' : 'Medium',
            type: submission.isSponsor ? 'Sponsor' : 'Non-Sponsor',
            relationship: submission.hasWorkedWithSMBC ? 'Existing Client' : 'New Prospect',
            complexity: getTotalDocuments(submission) > 5 ? 'High' : 'Medium'
        }
        return profile
    }

    const generateOpportunityAssessment = (submission: TaskSubmission) => {
        const opportunities = []
        
        if (submission.otherProblems) {
            opportunities.push('Cross-selling opportunities identified in additional problems')
        }
        
        if (submission.futureTeams) {
            opportunities.push('Future team collaborations mentioned')
        }
        
        if (submission.hasWorkedWithSMBC) {
            opportunities.push('Existing SMBC relationship - potential for expansion')
        }
        
        if (submission.isSponsor && submission.aum) {
            opportunities.push('High-value sponsor with significant AUM')
        }
        
        return opportunities.length > 0 ? opportunities : ['Standard opportunity for relationship development']
    }

    const generateRiskFactors = (submission: TaskSubmission) => {
        const risks = []
        
        if (!submission.hasWorkedWithSMBC) {
            risks.push('New client - requires additional due diligence')
        }
        
        if (submission.dealDocuments.length === 0) {
            risks.push('Limited deal documentation provided')
        }
        
        if (submission.detailedDescription.length < 100) {
            risks.push('Brief description may indicate unclear requirements')
        }
        
        return risks.length > 0 ? risks : ['Standard risk profile']
    }

    const getPriorityLevel = (submission: TaskSubmission): 'low' | 'medium' | 'high' => {
        const profile = generateClientProfile(submission)
        const totalDocs = getTotalDocuments(submission)
        
        if (profile.type === 'Sponsor' && profile.size === 'Large') return 'high'
        if (totalDocs > 5 || profile.relationship === 'Existing Client') return 'medium'
        return 'low'
    }

    return (
        <div className='flex flex-col grow bg-gray-100 min-h-[900px]'>
            <div className="w-full max-w-7xl mx-auto p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">SMBC Task Management Dashboard</h1>
                        <p className="text-gray-600 mt-1">Review and manage client task submissions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => switchRole('client')} 
                            variant="outline"
                        >
                            Switch to Client View
                        </Button>
                        <Button onClick={logout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{submissions.length}</div>
                            <div className="text-sm text-gray-600">Total Tasks</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {submissions.filter(s => s.status === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-600">Pending Review</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {submissions.filter(s => s.status === 'reviewed').length}
                            </div>
                            <div className="text-sm text-gray-600">Reviewed</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {submissions.filter(s => s.status === 'assigned').length}
                            </div>
                            <div className="text-sm text-gray-600">Assigned</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {submissions.filter(s => s.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submissions List */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Task Submissions</CardTitle>
                                <CardDescription>
                                    Filter and search through client submissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by company, contact, or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <select
                                            id="status"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="group">Team</Label>
                                        <select
                                            id="group"
                                            value={groupFilter}
                                            onChange={(e) => setGroupFilter(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="all">All Teams</option>
                                            <option value="fund-finance">Fund Finance</option>
                                            <option value="cash-management">Cash Management</option>
                                            <option value="m&a-finance">M&A Finance</option>
                                            <option value="real-estate">Real Estate</option>
                                            <option value="capital-markets">Capital Markets</option>
                                            <option value="trade-finance">Trade Finance</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {filteredSubmissions.map((submission) => (
                                        <div
                                            key={submission.id}
                                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                                selectedSubmission?.id === submission.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                            onClick={() => setSelectedSubmission(submission)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm">{submission.companyName}</h4>
                                                    <p className="text-xs text-gray-600">{submission.contactPerson}</p>
                                                    <p className="text-xs text-gray-500">{submission.selectedGroup.name}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status || 'pending')}`}>
                                                        {submission.status || 'pending'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {getTotalDocuments(submission)} docs
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {submission.submittedAt.toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Submission Details */}
                    <div className="lg:col-span-2">
                        {selectedSubmission ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{selectedSubmission.companyName}</CardTitle>
                                            <CardDescription>
                                                Task submitted on {selectedSubmission.submittedAt.toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedSubmission.status || 'pending')}`}>
                                                {selectedSubmission.status || 'pending'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                getPriorityLevel(selectedSubmission) === 'high' ? 'bg-red-100 text-red-800' :
                                                getPriorityLevel(selectedSubmission) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {getPriorityLevel(selectedSubmission).toUpperCase()} Priority
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Selected Team */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Selected Team</h3>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{selectedSubmission.selectedGroup.icon}</span>
                                                <div>
                                                    <h4 className="font-medium">{selectedSubmission.selectedGroup.name}</h4>
                                                    <p className="text-sm text-gray-600">{selectedSubmission.selectedGroup.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brief Description */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Brief Description</h3>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                            {selectedSubmission.briefDescription}
                                        </p>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Contact Person:</span> {selectedSubmission.contactPerson}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span> {selectedSubmission.contactEmail}
                                            </div>
                                            {selectedSubmission.contactPhone && (
                                                <div>
                                                    <span className="font-medium">Phone:</span> {selectedSubmission.contactPhone}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Company:</span> {selectedSubmission.companyName}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client Profile */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Client Profile</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Type:</span> {selectedSubmission.isSponsor ? 'Sponsor' : 'Non-Sponsor'}
                                            </div>
                                            {selectedSubmission.aum && (
                                                <div>
                                                    <span className="font-medium">AUM:</span> {selectedSubmission.aum}
                                                </div>
                                            )}
                                            {selectedSubmission.fundStrategy && (
                                                <div>
                                                    <span className="font-medium">Strategy:</span> {selectedSubmission.fundStrategy}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">SMBC Relationship:</span> {selectedSubmission.hasWorkedWithSMBC ? 'Existing' : 'New'}
                                            </div>
                                        </div>
                                        {selectedSubmission.hasWorkedWithSMBC && selectedSubmission.smbcRelationship && (
                                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                <span className="font-medium">Previous Relationship:</span> {selectedSubmission.smbcRelationship}
                                            </div>
                                        )}
                                    </div>

                                    {/* Detailed Description */}
                                    {selectedSubmission.detailedDescription && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Detailed Description</h3>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                {selectedSubmission.detailedDescription}
                                            </p>
                                        </div>
                                    )}

                                    {/* Documents */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Submitted Documents</h3>
                                        <div className="space-y-2">
                                            {selectedSubmission.dealDocuments.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">Deal Documents ({selectedSubmission.dealDocuments.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.dealDocuments.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.investorDocuments.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">Investor Documents ({selectedSubmission.investorDocuments.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.investorDocuments.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* PDF Analysis */}
                                    {(selectedSubmission.dealDocumentsContent && Object.keys(selectedSubmission.dealDocumentsContent).length > 0) ||
                                     (selectedSubmission.investorDocumentsContent && Object.keys(selectedSubmission.investorDocumentsContent).length > 0) ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">AI Document Analysis</h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowPDFAnalysis(!showPDFAnalysis)}
                                                >
                                                    {showPDFAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                                                </Button>
                                            </div>
                                            
                                            {showPDFAnalysis && (
                                                <div className="space-y-4">
                                                    {/* Deal Documents Analysis */}
                                                    {selectedSubmission.dealDocumentsContent && Object.keys(selectedSubmission.dealDocumentsContent).length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3">Deal Documents Analysis</h4>
                                                            <div className="space-y-4">
                                                                {Object.entries(selectedSubmission.dealDocumentsContent).map(([filename, content]) => (
                                                                    <PDFAnalysisComponent
                                                                        key={filename}
                                                                        documentName={filename}
                                                                        documentContent={content}
                                                                        onAnalysisComplete={(analysis) => 
                                                                            handlePDFAnalysisComplete(selectedSubmission.id, filename, analysis)
                                                                        }
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Investor Documents Analysis */}
                                                    {selectedSubmission.investorDocumentsContent && Object.keys(selectedSubmission.investorDocumentsContent).length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3">👥 Investor Documents Analysis</h4>
                                                            <div className="space-y-4">
                                                                {Object.entries(selectedSubmission.investorDocumentsContent).map(([filename, content]) => (
                                                                    <PDFAnalysisComponent
                                                                        key={filename}
                                                                        documentName={filename}
                                                                        documentContent={content}
                                                                        onAnalysisComplete={(analysis) => 
                                                                            handlePDFAnalysisComplete(selectedSubmission.id, filename, analysis)
                                                                        }
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Previously Analyzed Documents */}
                                                    {analyzedDocuments[selectedSubmission.id] && Object.keys(analyzedDocuments[selectedSubmission.id]).length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-medium mb-3">✅ Previously Analyzed Documents</h4>
                                                            <div className="space-y-2">
                                                                {Object.keys(analyzedDocuments[selectedSubmission.id]).map((filename) => (
                                                                    <div key={filename} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-green-600">✓</span>
                                                                            <span className="text-sm font-medium">{filename}</span>
                                                                            <span className="text-xs text-green-600">Analysis Complete</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    {/* Additional Opportunities */}
                                    {(selectedSubmission.otherProblems || selectedSubmission.futureTeams) && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Additional Opportunities</h3>
                                            <div className="space-y-2">
                                                {selectedSubmission.otherProblems && (
                                                    <div>
                                                        <h4 className="text-sm font-medium">Other Problems:</h4>
                                                        <p className="text-sm text-gray-600 ml-4">{selectedSubmission.otherProblems}</p>
                                                    </div>
                                                )}
                                                {selectedSubmission.futureTeams && (
                                                    <div>
                                                        <h4 className="text-sm font-medium">Future Teams:</h4>
                                                        <p className="text-sm text-gray-600 ml-4">{selectedSubmission.futureTeams}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Analysis */}
                                    <div>
                                        <h3 className="font-semibold mb-2">AI Analysis</h3>
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
                                            <div>
                                                <h4 className="font-medium text-gray-800 mb-2">Opportunity Assessment</h4>
                                                <div className="space-y-1">
                                                    {generateOpportunityAssessment(selectedSubmission).map((opp, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <span className="text-xs text-green-600 mt-1">•</span>
                                                            <span className="text-sm text-gray-600">{opp}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-medium text-gray-800 mb-2">Risk Factors</h4>
                                                <div className="space-y-1">
                                                    {generateRiskFactors(selectedSubmission).map((risk, index) => (
                                                        <div key={index} className="flex items-start gap-2">
                                                            <span className="text-xs text-red-600 mt-1">•</span>
                                                            <span className="text-sm text-gray-600">{risk}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employee Actions */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Employee Actions</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="employeeNotes">Add Notes</Label>
                                                <textarea
                                                    id="employeeNotes"
                                                    value={employeeNotes}
                                                    onChange={(e) => setEmployeeNotes(e.target.value)}
                                                    placeholder="Add internal notes about this submission..."
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                                />
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'reviewed')}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Mark as Reviewed
                                                </Button>
                                                <Button 
                                                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'assigned')}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Assign to Team
                                                </Button>
                                                <Button 
                                                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'completed')}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Mark Complete
                                                </Button>
                                            </div>

                                            {selectedSubmission.employeeNotes && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">Previous Notes</h4>
                                                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                                                        {selectedSubmission.employeeNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-500">Select a submission from the list to view details</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskEmployeeDashboard 