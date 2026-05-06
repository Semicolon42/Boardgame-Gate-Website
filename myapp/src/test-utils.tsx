import {type RenderOptions, render as rtlRender} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {ReactElement} from 'react'
import {BrowserRouter} from 'react-router'

export function render(
	ui: ReactElement,
	{route, ...options}: Omit<RenderOptions, 'wrapper'> & {route?: string} = {
		reactStrictMode: true
	}
) {
	window.history.pushState({}, '', route)

	return {
		user: userEvent.setup(),
		...rtlRender(ui, {
			wrapper: ({children}) => <BrowserRouter>{children}</BrowserRouter>,
			...options
		})
	}
}

// biome-ignore lint: test file
export * from '@testing-library/react'
