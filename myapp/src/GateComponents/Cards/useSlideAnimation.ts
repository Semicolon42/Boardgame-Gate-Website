import type {RefObject} from 'react'
import {useLayoutEffect} from 'react'

export type SlideSpec =
	| {type: 'FROM'; pos: {x: number; y: number}}
	| {type: 'TO'; pos: {x: number; y: number}}

/**
 * Snapshots the card's DOM position and applies the CSS slide-in/out animation
 * before the browser paints, so there's no visible flash or jump.
 *
 * FROM: card is already at its destination — animate from external pos to self.
 * TO:   card is at its source — animate from self to external pos.
 */
export function useSlideAnimation(
	ref: RefObject<HTMLElement | null>,
	spec: SlideSpec | undefined
): void {
	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		el.classList.remove('card-move-from-animate', 'card-move-to-animate')

		if (spec?.type === 'FROM' || spec?.type === 'TO') {
			const rect = el.getBoundingClientRect()
			el.style.setProperty('--slide-x', `${spec.pos.x - rect.left}px`)
			el.style.setProperty('--slide-y', `${spec.pos.y - rect.top}px`)
			el.classList.add(
				spec.type === 'FROM' ? 'card-move-from-animate' : 'card-move-to-animate'
			)
		}
	}, [spec, ref])
}
