import type {RefObject} from 'react'
import {useEffect, useRef} from 'react'

export interface FallAwayConfig {
	durationMs: number
	speedPxPerMs: number
	gravityPxPerMs2: number
	minRotationDeg: number
	maxRotationDeg: number
	opacityFadeStartProgress: number
	keyframeSteps: number
}

function generateFallAwayKeyframes(cfg: FallAwayConfig): Keyframe[] {
	const {
		durationMs,
		speedPxPerMs,
		gravityPxPerMs2,
		minRotationDeg,
		maxRotationDeg,
		opacityFadeStartProgress,
		keyframeSteps
	} = cfg
	const sign = Math.random() < 0.5 ? 1 : -1
	const finalRotation =
		sign * (minRotationDeg + Math.random() * (maxRotationDeg - minRotationDeg))
	const vy = -speedPxPerMs
	return Array.from({length: keyframeSteps + 1}, (_, i) => {
		const progress = i / keyframeSteps
		const t = progress * durationMs
		const y = vy * t + 0.5 * gravityPxPerMs2 * t * t
		const rotateDeg = progress * finalRotation
		const opacity =
			progress < opacityFadeStartProgress
				? 1
				: 1 -
					(progress - opacityFadeStartProgress) / (1 - opacityFadeStartProgress)
		return {
			transform: `translate(0px, ${y}px) rotate(${rotateDeg}deg)`,
			opacity,
			offset: progress
		}
	})
}

/**
 * Runs a Web Animations API physics trajectory on `ref.current` when `active`
 * becomes true. Cancels and restarts if `active` changes.
 *
 * Pass `onFinishRef` as a stable ref so the callback can be updated without
 * re-triggering the effect.
 */
export function useFallawayAnimation(
	ref: RefObject<HTMLElement | null>,
	config: FallAwayConfig,
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
		const keyframes = generateFallAwayKeyframes(cfg)
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
