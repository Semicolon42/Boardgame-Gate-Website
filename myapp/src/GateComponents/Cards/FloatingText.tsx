import {useEffect, useRef} from 'react'
import theme from '@/themes'
import type {FloatingTextSpec} from '../Boards/subactions/types'

interface FloatingTextProps {
	spec: FloatingTextSpec
	onAnimationEnd: () => void
}

export function FloatingText({spec, onAnimationEnd}: FloatingTextProps) {
	const elRef = useRef<HTMLDivElement>(null)
	const onAnimationEndRef = useRef(onAnimationEnd)
	onAnimationEndRef.current = onAnimationEnd

	useEffect(() => {
		const el = elRef.current
		if (!el) return

		const {
			durationMs,
			speedPxPerMs,
			gravityPxPerMs2,
			angleRangeDeg,
			opacityFadeStartProgress,
			keyframeSteps
		} = theme.floatingText

		const angleDeg = 90 + (Math.random() - 0.5) * angleRangeDeg
		const angleRad = (angleDeg * Math.PI) / 180
		const vx = speedPxPerMs * Math.cos(angleRad)
		const vy = -speedPxPerMs * Math.sin(angleRad)

		const keyframes = Array.from({length: keyframeSteps + 1}, (_, i) => {
			const progress = i / keyframeSteps
			const t = progress * durationMs
			const x = vx * t
			const y = vy * t + 0.5 * gravityPxPerMs2 * t * t
			const opacity =
				progress < opacityFadeStartProgress
					? 1
					: 1 -
						(progress - opacityFadeStartProgress) /
							(1 - opacityFadeStartProgress)
			return {transform: `translate(${x}px, ${y}px)`, opacity, offset: progress}
		})

		const anim = el.animate(keyframes, {
			duration: durationMs,
			fill: 'forwards'
		})
		anim.onfinish = () => {
			onAnimationEndRef.current()
		}
		return () => {
			anim.cancel()
		}
	}, [])

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
