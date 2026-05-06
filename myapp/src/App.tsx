import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import {Route, Routes} from 'react-router'
import {GameLayout} from '@/GateComponents/GameLayout'

function renderError({error}: FallbackProps) {
	return <div className='p-4 text-red-400'>{String(error)}</div>
}

export function App() {
	return (
		<ErrorBoundary fallbackRender={renderError}>
			<Routes>
				<Route element={<GameLayout />} index={true} />
			</Routes>
		</ErrorBoundary>
	)
}
