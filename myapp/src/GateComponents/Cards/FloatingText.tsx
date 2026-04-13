import {useEffect, useRef} from 'react'
import type {FloatingTextSpec} from '../Boards/subactions/types'

const FLOAT_SPEED_PX_PER_MS = 0.18
const FLOAT_GRAVITY_PX_PER_MS2 = 0.000_35
const FLOAT_DURATION_MS = 1100
const FLOAT_ANGLE_RANGE_DEG = 30

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

		const angleDeg = 90 + (Math.random() - 0.5) * FLOAT_ANGLE_RANGE_DEG
		const angleRad = (angleDeg * Math.PI) / 180
		const vx = FLOAT_SPEED_PX_PER_MS * Math.cos(angleRad)
		const vy = -FLOAT_SPEED_PX_PER_MS * Math.sin(angleRad)

		const Steps = 24
		const keyframes = Array.from({length: Steps + 1}, (_, i) => {
			const progress = i / Steps
			const t = progress * FLOAT_DURATION_MS
			const x = vx * t
			const y = vy * t + 0.5 * FLOAT_GRAVITY_PX_PER_MS2 * t * t
			const opacity = progress < 0.65 ? 1 : 1 - (progress - 0.65) / 0.35
			return {transform: `translate(${x}px, ${y}px)`, opacity, offset: progress}
		})

		const anim = el.animate(keyframes, {
			duration: FLOAT_DURATION_MS,
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
			ref={elRef}
			className='text-stroke-floating'
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
