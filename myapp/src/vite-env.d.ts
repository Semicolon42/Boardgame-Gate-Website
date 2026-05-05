/// <reference types="vite/client" />

import type DetachedWindowApi from 'happy-dom/lib/window/DetachedWindowAPI.js'

declare global {
	interface ImportMetaEnv {
		readonly VITE_PUBLIC_POSTHOG_PROJECT_TOKEN: string
		readonly VITE_PUBLIC_POSTHOG_HOST: string
	}

	interface Window {
		happyDOM?: DetachedWindowApi
	}
}
