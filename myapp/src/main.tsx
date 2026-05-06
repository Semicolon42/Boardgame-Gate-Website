import './global.css'
import theme from './themes'
import {applyTheme} from './themes/applyTheme'

applyTheme(theme)

import {PostHogErrorBoundary, PostHogProvider} from '@posthog/react'
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
posthog.register({environment: import.meta.env.PROD ? 'PROD' : 'DEV'})

const container = document.querySelector('#root')
if (container) {
	const root = createRoot(container)
	root.render(
		<StrictMode>
			<PostHogProvider client={posthog}>
				<PostHogErrorBoundary>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</PostHogErrorBoundary>
			</PostHogProvider>
		</StrictMode>
	)
}
