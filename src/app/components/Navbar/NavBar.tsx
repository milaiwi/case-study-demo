// components/Navbar/NavBar.tsx
'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export const NavBar = () => {
  return (
    <nav className="w-full p-4 flex gap-2">
        <Image
            src="/smbc-logo.png"
            width={60}
            height={10}
            alt=""
        />
        <Button variant='secondary' asChild>
            <Link href="/">Home</Link>
        </Button>
        <Button variant='secondary' asChild>
            <Link href="/help">Help</Link>
        </Button>
    </nav>
  )
}
