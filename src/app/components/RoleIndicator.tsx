'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'

const RoleIndicator = () => {
    const { userRole } = useAuth()

    return (
        <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium ${
            userRole === 'employee' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
            {userRole === 'employee' ? 'Employee View' : 'Client View'}
        </div>
    )
}

export default RoleIndicator 