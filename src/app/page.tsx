import React from 'react';
import {getSession} from '@auth0/nextjs-auth0';
import {redirect} from 'next/navigation';

export default async function Home() {
    const session = await getSession();

    if (session?.user) {
        redirect('/home');
    }

    return (
        <main className='flex min-h-screen flex-col items-center justify-between p-24'>
            <a href="/api/auth/login" className="heading1">Login</a>
        </main>
    );
}
