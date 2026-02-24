import {WaIcon} from '@awesome.me/webawesome/dist/react'
import {useLayoutEffect, useRef} from 'react'
import {GET_CITIZEN_CARD} from '../Data/PlayerCards'

// Import CSS — defines the `card-draw-animate` class and `draw-card` keyframe animation
import '@/GateComponents/Cards/XCard.css'

interface XcardProps {
	cardId: number
	// biome-ignore lint/suspicious/noExplicitAny: can't find a simple enough type
	onClick?: any
	isNewlyDrawn?: boolean
	onAnimationEnd?: () => void
	// Top-left position of the deck element at draw time (measured in GameBoard).
	// When provided, the card animates FROM the deck TO its hand position.
	drawOrigin?: {x: number; y: number}
}

export function XCard({
	cardId,
	onClick,
	isNewlyDrawn,
	onAnimationEnd,
	drawOrigin
}: XcardProps) {
	const info = GET_CITIZEN_CARD(cardId)

	// ref gives us direct access to the DOM node so we can read its position
	// and imperatively add/remove the animation class without triggering a re-render.
	const ref = useRef<HTMLButtonElement>(null)

	// useLayoutEffect fires synchronously after the DOM is updated but BEFORE the
	// browser paints. This is critical for animation setup: we need to measure the
	// card's final rendered position (getBoundingClientRect) and set CSS custom
	// properties before the frame is painted, so the animation starts from the
	// correct position with no visible flash or jump.
	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		// Always remove the class first to reset any in-progress animation.
		// This ensures re-drawing the same card triggers a fresh animation.
		el.classList.remove('card-draw-animate')

		if (isNewlyDrawn) {
			// Measure where the card currently sits in the viewport after layout.
			// This is the card's FINAL (resting) position in the player's hand.
			const rect = el.getBoundingClientRect()

			// Compute how far the card must travel to reach its resting position.
			// The CSS keyframe animates FROM translate(--slide-x, --slide-y) TO translate(0,0),
			// so these values represent the offset from the card's final position back to the origin.
			//
			// If drawOrigin is provided (deck position measured in GameBoard at draw time):
			//   --slide-x = deck.left - card.left  → card appears to start at the deck's x
			//   --slide-y = deck.top  - card.top   → card appears to start at the deck's y
			//
			// Fallback (no deck ref available): slide in from the top-right of the viewport.
			const originX = drawOrigin?.x ?? window.innerWidth
			const originY = drawOrigin?.y ?? 0
			el.style.setProperty('--slide-x', `${originX - rect.left}px`)
			el.style.setProperty('--slide-y', `${originY - rect.top}px`)

			// Adding the class triggers the CSS animation defined in XCard.css.
			// The `onAnimationEnd` prop (wired to the button below) lets the parent
			// know when the animation has finished so it can clear the `isNewlyDrawn` flag.
			el.classList.add('card-draw-animate')
		}
	}, [isNewlyDrawn, drawOrigin])

	return (
		<button
			className='flex h-[140px] w-[100px] rounded-xl bg-blue-300'
			onAnimationEnd={onAnimationEnd}
			onClick={onClick}
			ref={ref}
			type='button'
		>
			<div className='w-100'>
				<div className=''>{info.name}</div>
				<div className='@cardCost flex items-center gap-1'>
					<WaIcon name='circle' />
					{info.cost}
				</div>
				<div className='@cardCoins'>{info.actionCoins}</div>
				<div className='@cardRepair'>{info.actionRepair}</div>
				<div className='@cardCalm'>{info.actionCalm}</div>
				<div className='@cardFight'>{info.actionFight}</div>
				{info.actionBonusText && (
					<div className='@cardBonus'>{info.actionBonusText}</div>
				)}
			</div>
		</button>
	)
}
