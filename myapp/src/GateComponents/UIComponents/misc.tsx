import {useLayoutEffect, useRef} from 'react'

/** Scales font down until the name fits on one line within its flex container. */
export function ScaledName({text}: {text: string}) {
	const outerRef = useRef<HTMLDivElement>(null)
	const innerRef = useRef<HTMLSpanElement>(null)

	useLayoutEffect(() => {
		const outer = outerRef.current
		const inner = innerRef.current
		if (!(outer && inner)) return
		inner.style.fontSize = '14px'
		while (
			inner.scrollWidth > outer.clientWidth &&
			Number.parseFloat(inner.style.fontSize) > 6
		) {
			inner.style.fontSize = `${Number.parseFloat(inner.style.fontSize) - 0.5}px`
		}
	}, [])

	return (
		<div className='min-w-0 flex-1 overflow-hidden text-left' ref={outerRef}>
			<span className='whitespace-nowrap' ref={innerRef}>
				{text}
			</span>
		</div>
	)
}

/** Renders text inside a fixed 50×50 box, scaling font down until it fits. */
export function FitText({text}: {text: string}) {
	const outerRef = useRef<HTMLDivElement>(null)
	const innerRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const outer = outerRef.current
		const inner = innerRef.current
		if (!(outer && inner)) return
		inner.style.fontSize = '12px'
		inner.style.lineHeight = '1'
		while (
			inner.scrollHeight > outer.clientHeight &&
			Number.parseFloat(inner.style.fontSize) > 6
		) {
			inner.style.fontSize = `${Number.parseFloat(inner.style.fontSize) - 0.5}px`
		}
	}, [])

	return (
		<div className='h-[50px] w-[50px] overflow-hidden' ref={outerRef}>
			<div
				className='w-full whitespace-normal break-words'
				ref={innerRef}
			>
				{text}
			</div>
		</div>
	)
}
