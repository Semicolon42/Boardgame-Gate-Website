import type {RefObject} from 'react'
import {useEffect, useRef} from 'react'

export interface FloatConfig {
	durationMs: number
	speedPxPerMs: number
	gravityPxPerMs2: number
	angleRangeDeg: number
	opacityFadeStartProgress: number
	keyframeSteps: number
}

function generateFloatKeyframes(cfg: FloatConfig): Keyframe[] {
	const {
		durationMs,
		speedPxPerMs,
		gravityPxPerMs2,
		angleRangeDeg,
		opacityFadeStartProgress,
		keyframeSteps
	} = cfg
	const angleDeg = 90 + (Math.random() - 0.5) * angleRangeDeg
	const angleRad = (angleDeg * Math.PI) / 180
	const vx = speedPxPerMs * Math.cos(angleRad)
	const vy = -speedPxPerMs * Math.sin(angleRad)
	return Array.from({length: keyframeSteps + 1}, (_, i) => {
		const progress = i / keyframeSteps
		const t = progress * durationMs
		const x = vx * t
		const y = vy * t + 0.5 * gravityPxPerMs2 * t * t
		const opacity =
			progress < opacityFadeStartProgress
				? 1
				: 1 -
					(progress - opacityFadeStartProgress) / (1 - opacityFadeStartProgress)
		return {transform: `translate(${x}px, ${y}px)`, opacity, offset: progress}
	})
}

/**
 * Runs a Web Animations API physics trajectory on `ref.current` when `active`
 * becomes true. Cancels and restarts if `active` changes.
 *
 * Pass `onFinishRef` as a stable ref so the callback can be updated without
 * re-triggering the effect.
 */
export function usePopUpAnimation(
	ref: RefObject<HTMLElement | null>,
	config: FloatConfig,
	active: boolean,
	onFinishRef: RefObject<(() => void) | undefined>
): void {
	const configRef = useRef(config)
	configRef.current = config

	useEffect(() => {
		if (!active) return
		const el = ref.current
		if (!el) return

		const cfg = configRef.current
		const keyframes = generateFloatKeyframes(cfg)
		const anim = el.animate(keyframes, {
			duration: cfg.durationMs,
			fill: 'forwards'
		})
		anim.onfinish = () => {
			onFinishRef.current?.()
		}
		return () => {
			anim.cancel()
		}
	}, [active, ref, onFinishRef])
}
