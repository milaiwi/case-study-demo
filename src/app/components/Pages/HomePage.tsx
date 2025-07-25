import React from 'react'
import Image from 'next/image'
import { LoginCard } from '../AccountInfo/LoginCard'

const HomePage = () => {
    return (
        <div className='flex flex-col grow bg-gray-100 items-center min-h-[900px]'>
            <div className="relative top-20 flex flex-col items-center gap-5">
                <Image
                    src="/smbc-logo.png"
                    width={300}
                    height={200}
                    alt=""
                />
                <h2 className='text-2xl font-bold'>Welcome to your portal</h2>
                <p className="text-center max-w-md text-gray-600">
                    Demo login credentials:<br/>
                    Email: example@gmail.com<br/>
                    Password: example123
                </p>
                <LoginCard />
            </div>
        </div>
    )
}

export default HomePage