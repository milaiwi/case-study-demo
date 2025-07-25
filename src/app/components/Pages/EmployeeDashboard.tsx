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

const EmployeeDashboard = () => {
    const { logout, switchRole } = useAuth()
    const [submissions, setSubmissions] = useState<CashManagementSubmission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<CashManagementSubmission | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [employeeNotes, setEmployeeNotes] = useState('')

    // Load submissions from localStorage
    useEffect(() => {
        const savedSubmissions = localStorage.getItem('cashManagementSubmissions')
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
                            submission.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
        return matchesSearch && matchesStatus
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
        localStorage.setItem('cashManagementSubmissions', JSON.stringify(updatedSubmissions))
        
        if (selectedSubmission?.id === submissionId) {
            setSelectedSubmission(updatedSubmissions.find(sub => sub.id === submissionId) || null)
        }
    }

    const handleStatusUpdate = (submissionId: string, newStatus: string) => {
        updateSubmissionStatus(submissionId, newStatus, employeeNotes)
        setEmployeeNotes('')
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'reviewed': return 'bg-blue-100 text-blue-800'
            case 'scheduled': return 'bg-green-100 text-green-800'
            case 'completed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTotalDocuments = (submission: CashManagementSubmission) => {
        return Object.values(submission.documents).reduce((total, docs) => total + docs.length, 0)
    }

    return (
        <div className='flex flex-col grow bg-gray-100 min-h-[900px]'>
            <div className="w-full max-w-7xl mx-auto p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Bank Employee Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage client meeting requests and submissions</p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold">{submissions.length}</div>
                            <div className="text-sm text-gray-600">Total Submissions</div>
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
                                {submissions.filter(s => s.status === 'scheduled').length}
                            </div>
                            <div className="text-sm text-gray-600">Scheduled</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submissions List */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Requests</CardTitle>
                                <CardDescription>
                                    Filter and search through client submissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by company, contact, or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status Filter</Label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                    </select>
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
                                                    <p className="text-xs text-gray-500">{submission.email}</p>
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
                                                Meeting request submitted on {selectedSubmission.submittedAt.toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedSubmission.status || 'pending')}`}>
                                            {selectedSubmission.status || 'pending'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Contact Information */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Contact Person:</span> {selectedSubmission.contactPerson}
                                            </div>
                                            <div>
                                                <span className="font-medium">Email:</span> {selectedSubmission.email}
                                            </div>
                                            {selectedSubmission.phone && (
                                                <div>
                                                    <span className="font-medium">Phone:</span> {selectedSubmission.phone}
                                                </div>
                                            )}
                                            {selectedSubmission.meetingDate && (
                                                <div>
                                                    <span className="font-medium">Preferred Date:</span> {new Date(selectedSubmission.meetingDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Submitted Documents</h3>
                                        <div className="space-y-3">
                                            {selectedSubmission.documents.financialDocuments.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">🧾 Financial Documents ({selectedSubmission.documents.financialDocuments.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.documents.financialDocuments.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.documents.bankingInfrastructure.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">🏦 Banking Infrastructure ({selectedSubmission.documents.bankingInfrastructure.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.documents.bankingInfrastructure.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.documents.cashFlowOperations.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">🔁 Cash Flow Operations ({selectedSubmission.documents.cashFlowOperations.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.documents.cashFlowOperations.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.documents.internalControls.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">📜 Internal Controls ({selectedSubmission.documents.internalControls.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.documents.internalControls.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedSubmission.documents.treasurySystems.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium">📑 Treasury Systems ({selectedSubmission.documents.treasurySystems.length})</h4>
                                                    <div className="text-sm text-gray-600 ml-4">
                                                        {selectedSubmission.documents.treasurySystems.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Notes */}
                                    {selectedSubmission.additionalNotes && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Client Notes</h3>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                                {selectedSubmission.additionalNotes}
                                            </p>
                                        </div>
                                    )}

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
                                                    onClick={() => handleStatusUpdate(selectedSubmission.id, 'scheduled')}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Schedule Meeting
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

export default EmployeeDashboard 