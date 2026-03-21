'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('message') || 'An error occurred during authentication.'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
        <h1 className="text-3xl font-['Anton'] mb-4">Authentication Error</h1>
        <p className="text-white/60 mb-8">{error}</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-bold transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ErrorContent />
    </Suspense>
  )
}
