import {WaIcon} from '@awesome.me/webawesome/dist/react'
import {useLayoutEffect, useRef} from 'react'
import {GET_CITIZEN_CARD} from '../Data/PlayerCards'

// Import CSS — defines card-move-from-animate / card-move-to-animate classes and keyframes
import '@/GateComponents/Cards/XCard.css'

interface XcardProps {
	cardId: number
	// biome-ignore lint/suspicious/noExplicitAny: can't find a simple enough type
	onClick?: any
	onAnimationEnd?: () => void
	// Enter animation: card is already at its destination in the DOM.
	// Animates FROM this position TO the card's self-measured DOM position.
	// Used for draw (deck → hand).
	moveFrom?: {x: number; y: number}
	// Exit animation: card is at its current DOM position.
	// Animates FROM the card's self-measured DOM position TO this position.
	// Used for discard (hand → discard pile).
	moveTo?: {x: number; y: number}
}

export function XCard({
	cardId,
	onClick,
	onAnimationEnd,
	moveFrom,
	moveTo
}: XcardProps) {
	const info = GET_CITIZEN_CARD(cardId)

	// ref gives us direct access to the DOM node so we can read its position
	// and imperatively add/remove the animation class without triggering a re-render.
	const ref = useRef<HTMLButtonElement>(null)

	// useLayoutEffect fires synchronously after the DOM is updated but BEFORE the
	// browser paints. This is critical for animation setup: we need to measure the
	// card's position (getBoundingClientRect) and set CSS custom properties before
	// the frame is painted, so the animation starts from the correct position with
	// no visible flash or jump.
	//
	// moveFrom (enter): card is at its destination — animate from external position to self.
	//   --slide-x/y = external.pos - self.pos → keyframe goes translate(delta) → translate(0,0)
	//
	// moveTo (exit): card is at its source — animate from self to external position.
	//   --slide-x/y = external.pos - self.pos → keyframe goes translate(0,0) → translate(delta)
	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		el.classList.remove('card-move-from-animate', 'card-move-to-animate')

		const rect = el.getBoundingClientRect()

		if (moveFrom) {
			el.style.setProperty('--slide-x', `${moveFrom.x - rect.left}px`)
			el.style.setProperty('--slide-y', `${moveFrom.y - rect.top}px`)
			el.classList.add('card-move-from-animate')
		} else if (moveTo) {
			el.style.setProperty('--slide-x', `${moveTo.x - rect.left}px`)
			el.style.setProperty('--slide-y', `${moveTo.y - rect.top}px`)
			el.classList.add('card-move-to-animate')
		}
	}, [moveFrom, moveTo])

	return (
		<button
			className='flex h-[140px] w-[100px] items-start rounded-xl bg-blue-300 XCARD'
			onAnimationEnd={onAnimationEnd}
			onClick={onClick}
			ref={ref}
			type='button'
		>
			<div className='w-full'>
				<div className='flex justify-between px-[5px]'>
					<div>{info.name}</div>
					<div className='@cardCost'>{info.cost}</div>
				</div>
				<div className='flex'>
					<div className='block w-[40px]'>
						<div className='@cardCoins'><WaIcon name='circle' variant='regular'/>{info.actionCoins}</div>
						<div className='@cardRepair'><WaIcon name='plus' />{info.actionRepair}</div>
						<div className='@cardCalm'><WaIcon name='eye' variant='regular' />{info.actionCalm}</div>
						<div className='@cardFight'><WaIcon name='arrow-trend-up' />{info.actionFight}</div>
					</div>
					<div className='block'>
						<div className='w-[50px] h-[50px] border-1'></div>
						{info.actionBonusText && (
							<div className='@cardBonus break-words text-xs w-[50px] h-[50px]'>{info.actionBonusText}</div>
						)}
					</div>
				</div>
			</div>
		</button>
	)
}
