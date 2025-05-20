import Link from "next/link";
import React from "react";

export default function Navbar() {
    return (
        <div>
            <div className="container mx-auto py-4 px-6 flex items-center justify-between bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-20 rounded-xl shadow-lg">
                <Link href="/" className="flex items-center space-x-2">
                    <img
                        src="/logo.jpeg"
                        alt="Company Logo"
                        width={35}
                        height={35}
                        className="rounded-full"
                    />
                    <span className='text-xl font-semibold text-gray-800'>Musium</span>
                </Link>
            </div>
        </div>
    )
}