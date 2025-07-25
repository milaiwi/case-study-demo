'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/lib/auth-context'

interface CashManagementSubmission {
    id: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
    meetingDate: string
    documents: {
        financialDocuments: string[]
        bankingInfrastructure: string[]
        cashFlowOperations: string[]
        internalControls: string[]
        treasurySystems: string[]
    }
    additionalNotes: string
    submittedAt: Date
    status?: 'pending' | 'reviewed' | 'scheduled' | 'completed'
    employeeNotes?: string
}

const ProjectsPage = () => {
    const { logout, switchRole } = useAuth()
    const [companyName, setCompanyName] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [meetingDate, setMeetingDate] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState('')
    const [documents, setDocuments] = useState({
        financialDocuments: [] as File[],
        bankingInfrastructure: [] as File[],
        cashFlowOperations: [] as File[],
        internalControls: [] as File[],
        treasurySystems: [] as File[]
    })
    const [submissions, setSubmissions] = useState<CashManagementSubmission[]>([])

    // Load submissions from localStorage on component mount
    useEffect(() => {
        const savedSubmissions = localStorage.getItem('cashManagementSubmissions')
        if (savedSubmissions) {
            const parsed = JSON.parse(savedSubmissions)
            // Convert date strings back to Date objects and ensure status field
            const submissionsWithDates = parsed.map((sub: any) => ({
                ...sub,
                submittedAt: new Date(sub.submittedAt),
                status: sub.status || 'pending',
                employeeNotes: sub.employeeNotes || ''
            }))
            setSubmissions(submissionsWithDates)
        }
    }, [])

    const handleFileChange = (category: keyof typeof documents, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => ({
                ...prev,
                [category]: Array.from(e.target.files!)
            }))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (companyName.trim() && contactPerson.trim() && email.trim()) {
            const newSubmission: CashManagementSubmission = {
                id: Date.now().toString(),
                companyName,
                contactPerson,
                email,
                phone,
                meetingDate,
                documents: {
                    financialDocuments: documents.financialDocuments.map(file => file.name),
                    bankingInfrastructure: documents.bankingInfrastructure.map(file => file.name),
                    cashFlowOperations: documents.cashFlowOperations.map(file => file.name),
                    internalControls: documents.internalControls.map(file => file.name),
                    treasurySystems: documents.treasurySystems.map(file => file.name)
                },
                additionalNotes,
                submittedAt: new Date()
            }
            
            const updatedSubmissions = [newSubmission, ...submissions]
            setSubmissions(updatedSubmissions)
            
            // Save to localStorage
            localStorage.setItem('cashManagementSubmissions', JSON.stringify(updatedSubmissions))
            
            // Reset form
            setCompanyName('')
            setContactPerson('')
            setEmail('')
            setPhone('')
            setMeetingDate('')
            setAdditionalNotes('')
            setDocuments({
                financialDocuments: [],
                bankingInfrastructure: [],
                cashFlowOperations: [],
                internalControls: [],
                treasurySystems: []
            })
        }
    }

    const getFileCount = (category: keyof typeof documents) => {
        return documents[category].length
    }

    return (
        <div className='flex flex-col grow bg-gray-100 items-center min-h-[900px] p-8'>
            <div className="w-full max-w-6xl space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Cash Management Team Meeting Request</h1>
                        <p className="text-gray-600 mt-1">Client Portal - Submit your meeting request and documents</p>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Request Meeting with Cash Management Team</CardTitle>
                        <CardDescription>
                            Please provide your company information and upload the required documents to schedule a meeting with our cash management specialists.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="companyName">Company Name *</Label>
                                    <Input
                                        id="companyName"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter your company name"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="contactPerson">Contact Person *</Label>
                                    <Input
                                        id="contactPerson"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="Primary contact name"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="contact@company.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="meetingDate">Preferred Meeting Date</Label>
                                    <Input
                                        id="meetingDate"
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Document Upload Sections */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Required Documents</h3>
                                
                                {/* Financial Documents */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">🧾 Corporate Financial Documents</CardTitle>
                                        <CardDescription>
                                            Recent audited financial statements, cash flow statements, balance sheets, income statements
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange('financialDocuments', e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {getFileCount('financialDocuments') > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {documents.financialDocuments.map(file => file.name).join(', ')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Banking Infrastructure */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">🏦 Banking & Treasury Infrastructure</CardTitle>
                                        <CardDescription>
                                            Bank accounts list, current banking partners, fee analysis, treasury policy, cash pooling arrangements
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange('bankingInfrastructure', e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {getFileCount('bankingInfrastructure') > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {documents.bankingInfrastructure.map(file => file.name).join(', ')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Cash Flow Operations */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">🔁 Cash Flow Operations & Working Capital</CardTitle>
                                        <CardDescription>
                                            AR/AP aging reports, payment schedules, seasonal cash flow data, investment portfolios
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange('cashFlowOperations', e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {getFileCount('cashFlowOperations') > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {documents.cashFlowOperations.map(file => file.name).join(', ')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Internal Controls */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">📜 Internal Controls & Policies</CardTitle>
                                        <CardDescription>
                                            Payment approval workflows, cash handling policies, FX hedging policies, liquidity plans
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange('internalControls', e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        />
                                        {getFileCount('internalControls') > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {documents.internalControls.map(file => file.name).join(', ')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Treasury Systems */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">📑 Treasury Management System (TMS) or ERP Setup</CardTitle>
                                        <CardDescription>
                                            System architecture diagrams, file formats, integration points with banks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFileChange('treasurySystems', e)}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                        />
                                        {getFileCount('treasurySystems') > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                Selected: {documents.treasurySystems.map(file => file.name).join(', ')}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Additional Notes */}
                            <div className="grid gap-2">
                                <Label htmlFor="additionalNotes">Additional Notes or Special Requirements</Label>
                                <textarea
                                    id="additionalNotes"
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="Any additional information or special requirements for the meeting..."
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Submit Meeting Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {submissions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Previous Meeting Requests</CardTitle>
                            <CardDescription>
                                Your previously submitted meeting requests
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
                                                    <strong>Contact:</strong> {submission.contactPerson} ({submission.email})
                                                </p>
                                                {submission.phone && (
                                                    <p className="text-gray-600">
                                                        <strong>Phone:</strong> {submission.phone}
                                                    </p>
                                                )}
                                                {submission.meetingDate && (
                                                    <p className="text-gray-600">
                                                        <strong>Preferred Date:</strong> {new Date(submission.meetingDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {submission.additionalNotes && (
                                                    <p className="text-gray-600 mt-2">
                                                        <strong>Notes:</strong> {submission.additionalNotes}
                                                    </p>
                                                )}
                                                <div className="mt-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-sm">Documents Submitted:</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                            submission.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                                                            submission.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {submission.status || 'pending'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        {submission.documents.financialDocuments.length > 0 && (
                                                            <div>🧾 Financial: {submission.documents.financialDocuments.join(', ')}</div>
                                                        )}
                                                        {submission.documents.bankingInfrastructure.length > 0 && (
                                                            <div>🏦 Banking: {submission.documents.bankingInfrastructure.join(', ')}</div>
                                                        )}
                                                        {submission.documents.cashFlowOperations.length > 0 && (
                                                            <div>🔁 Cash Flow: {submission.documents.cashFlowOperations.join(', ')}</div>
                                                        )}
                                                        {submission.documents.internalControls.length > 0 && (
                                                            <div>📜 Controls: {submission.documents.internalControls.join(', ')}</div>
                                                        )}
                                                        {submission.documents.treasurySystems.length > 0 && (
                                                            <div>📑 Systems: {submission.documents.treasurySystems.join(', ')}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 ml-4">
                                                {submission.submittedAt.toLocaleDateString()}
                                            </span>
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

export default ProjectsPage