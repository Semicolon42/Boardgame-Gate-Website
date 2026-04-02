/// <reference path="../node_modules/@awesome.me/webawesome/dist/custom-elements-jsx.d.ts" />

declare module '*.svg' {
	import React = require('react')
	export const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement>
	>
	const src: string
	// biome-ignore lint/style/noDefaultExport: ambient module declaration for SVG imports — default export reflects Vite's runtime output
	export default src
}
