import './global.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import theme from './themes'
import {applyTheme} from './themes/applyTheme'

applyTheme(theme)

import {PostHogErrorBoundary, PostHogProvider} from '@posthog/react'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import posthog from 'posthog-js'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import {App} from './App'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, {
	// biome-ignore lint/style/useNamingConvention: PostHog config uses snake_case
	api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
	defaults: '2026-01-30'
})

const queryClient = new QueryClient()

async function enableMocking() {
	// TODO: uncomment this line
	// if (process.env.NODE_ENV !== 'development') {
	//   return
	// }
	const {worker} = await import('./mocks/browser')
	return worker.start()
}

const container = document.querySelector('#root')
enableMocking()
	.then(() => {
		if (container) {
			const root = createRoot(container)
			root.render(
				<StrictMode>
					<PostHogProvider client={posthog}>
						<PostHogErrorBoundary>
							<QueryClientProvider client={queryClient}>
								<ReactQueryDevtools initialIsOpen={false} />
								<BrowserRouter>
									<App />
								</BrowserRouter>
							</QueryClientProvider>
						</PostHogErrorBoundary>
					</PostHogProvider>
				</StrictMode>
			)
		}
	})
	.catch(error => {
		throw new Error(`Failed to enable mocking: ${error}`)
	})
