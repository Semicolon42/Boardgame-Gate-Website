import {lazy, Suspense} from 'react'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import {Route, Routes} from 'react-router'
import {LoadingOrError} from '@/components/LoadingOrError'
import {Gallery} from '@/pages/Gallery'
import PlayerHand from './card_components/PlayerHand'


const Details = lazy(async () =>
	import('@/pages/Details').then(m => ({default: m.Details}))
)

function renderError({error}: FallbackProps) {
	return <LoadingOrError error={error} />
}

export function App() {
	return (
		<ErrorBoundary fallbackRender={renderError}>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route element={<PlayerHand />} index={true} />
					<Route element={<Gallery />} path='gallery' />
					<Route element={<Details />} path=':fruitName' />
				</Routes>
			</Suspense>
		</ErrorBoundary>
	)
}
