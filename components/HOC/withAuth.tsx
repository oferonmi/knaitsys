import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { ComponentType } from 'react'

export function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
    return function AuthenticatedComponent(props: T) {
        const { status } = useSession()
        const router = useRouter()

        useEffect(() => {
            if (status === 'unauthenticated') {
                router.push('/api/auth/signin')
            }
        }, [status, router])

        if (status === 'loading') {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kaito-brand-ash-green"></div>
                </div>
            )
        }

        if (status === 'authenticated') {
            return <WrappedComponent {...props} />
        }

        return null
    }
}