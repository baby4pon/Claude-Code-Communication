import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SessionProvider>
  )
}

export default MyApp