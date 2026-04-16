import {useRef} from 'react'
import theme from '@/themes'
import type {FloatingTextSpec} from '../Boards/subactions/types'
import {usePopUpAnimation} from './usePopUpAnimation'

interface FloatingTextProps {
	spec: FloatingTextSpec
	onAnimationEnd: () => void
}

export function FloatingText({spec, onAnimationEnd}: FloatingTextProps) {
	const elRef = useRef<HTMLDivElement>(null)
	const onAnimationEndRef = useRef(onAnimationEnd)
	onAnimationEndRef.current = onAnimationEnd

	usePopUpAnimation(elRef, {...theme.floatingText}, true, onAnimationEndRef)

	return (
		<div
			className='text-stroke-floating'
			ref={elRef}
			style={{
				position: 'fixed',
				left: spec.x,
				top: spec.y,
				color: spec.color,
				pointerEvents: 'none',
				userSelect: 'none',
				fontWeight: 'bold',
				fontSize: 'var(--text-floating-size)',
				zIndex: 9999,
				transform: 'translate(-50%, -50%)'
			}}
		>
			{spec.text}
		</div>
	)
}
