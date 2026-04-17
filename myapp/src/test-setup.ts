import '@testing-library/jest-dom/vitest'
import {server} from './mocks/server'

// happy-dom does not implement attachInternals. WebAwesome custom elements
// (WaButton etc.) call it in connectedCallback and then access internals.willValidate,
// which throws. Stub it with the minimal ElementInternals surface they need.
HTMLElement.prototype.attachInternals = function () {
	return {
		willValidate: false,
		validity: {valid: true},
		validationMessage: '',
		labels: [],
		form: null,
		setFormValue: vi.fn(),
		setValidity: vi.fn(),
		reportValidity: vi.fn(() => true),
		checkValidity: vi.fn(() => true)
	} as unknown as ElementInternals
}

// happy-dom does not implement the Web Animations API. Define a minimal stub
// so components using element.animate() don't throw in unit/integration tests.
// onfinish fires asynchronously so queue-based animation logic can still settle.
Element.prototype.animate = vi.fn().mockImplementation(() => {
	const anim = {
		onfinish: null as (() => void) | null,
		cancel: vi.fn()
	}
	queueMicrotask(() => anim.onfinish?.())
	return anim as unknown as Animation
})

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
