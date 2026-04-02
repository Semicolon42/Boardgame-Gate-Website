import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {RefObject} from 'react'
import {useLayoutEffect, useRef} from 'react'
import {getCitizenCard} from '../Data/PlayerCards'

/** Scales font down until the name fits on one line within its flex container. */
function ScaledName({text}: {text: string}) {
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
		<div className='min-w-0 flex-1 overflow-hidden' ref={outerRef}>
			<span className='whitespace-nowrap' ref={innerRef}>
				{text}
			</span>
		</div>
	)
}

/** Renders text inside a fixed 50×50 box, scaling font down until it fits. */
function FitText({text}: {text: string}) {
	const outerRef = useRef<HTMLDivElement>(null)
	const innerRef = useRef<HTMLDivElement>(null)

	useLayoutEffect(() => {
		const outer = outerRef.current
		const inner = innerRef.current
		if (!(outer && inner)) return
		inner.style.fontSize = '12px'
		while (
			inner.scrollHeight > outer.clientHeight &&
			Number.parseFloat(inner.style.fontSize) > 6
		) {
			inner.style.fontSize = `${Number.parseFloat(inner.style.fontSize) - 0.5}px`
		}
	}, [])

	return (
		<div className='h-[50px] w-[50px] overflow-hidden' ref={outerRef}>
			<div className='w-full whitespace-normal break-words' ref={innerRef}>
				{text}
			</div>
		</div>
	)
}

// Import CSS — defines card-move-from-animate / card-move-to-animate classes and keyframes
import '@/GateComponents/Cards/XCard.css'

export type CardPlayType = 'COINS' | 'REPAIR' | 'CALM' | 'ATTACK'

export type CardPlayHandler = (
	cardId: number,
	type: CardPlayType,
	amount: number,
	actionBonusId?: string
) => void

interface XcardProps {
	cardId: number
	onAnimationEnd?: () => void
	// Enter animation: card is already at its destination in the DOM.
	// Animates FROM this position TO the card's self-measured DOM position.
	// Used for draw (deck → hand).
	moveFrom?: {x: number; y: number} | undefined
	// Exit animation: card is at its current DOM position.
	// Animates FROM the card's self-measured DOM position TO this position.
	// Used for discard (hand → discard pile).
	moveTo?: {x: number; y: number} | undefined
	// Hand mode: individual action buttons are clickable.
	onPlayCard?: CardPlayHandler | undefined
	// Village mode: the whole card is one button to buy it.
	// When provided, inner action buttons are suppressed.
	onBuyCard?: (cardId: number) => void
}

export function XCard({
	cardId,
	onAnimationEnd,
	moveFrom,
	moveTo,
	onPlayCard,
	onBuyCard
}: XcardProps) {
	const info = getCitizenCard(cardId)

	// ref gives us direct access to the DOM node so we can read its position
	// and imperatively add/remove the animation class without triggering a re-render.
	// Typed as HTMLElement — the common base for both <div> (hand) and <button> (village).
	const ref = useRef<HTMLElement>(null)

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

	const containerClass =
		'flex h-[140px] w-[100px] items-start rounded-xl bg-blue-300 XCARD'

	// Hand mode: action fields shown as individual clickable divs.
	// Village mode: action fields are read-only (whole card is the button).
	const isHandMode = onBuyCard === undefined

	const cardInner = (
		<div className='w-full'>
			<div className='flex items-center gap-[4px] px-[5px]'>
				<ScaledName text={info.name} />
				<div className='flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs'>
					{info.cost}
				</div>
			</div>
			<div className='flex'>
				<div className='block w-[40px]'>
					<div
						className='card-action-btn @cardCoins'
						{...(isHandMode
							? {
									role: 'button',
									onClick: () =>
										onPlayCard?.(
											cardId,
											'COINS',
											info.actionCoins,
											info.actionBonusId
										)
								}
							: {})}
					>
						<WaIcon name='circle' variant='regular' />
						{info.actionCoins}
					</div>
					<div
						className='card-action-btn @cardRepair'
						{...(isHandMode
							? {
									role: 'button',
									onClick: () =>
										onPlayCard?.(
											cardId,
											'REPAIR',
											info.actionRepair,
											info.actionBonusId
										)
								}
							: {})}
					>
						<WaIcon name='plus' />
						{info.actionRepair}
					</div>
					<div
						className='card-action-btn @cardCalm'
						{...(isHandMode
							? {
									role: 'button',
									onClick: () =>
										onPlayCard?.(
											cardId,
											'CALM',
											info.actionCalm,
											info.actionBonusId
										)
								}
							: {})}
					>
						<WaIcon name='eye' variant='regular' />
						{info.actionCalm}
					</div>
					<div
						className='card-action-btn @cardFight'
						{...(isHandMode
							? {
									role: 'button',
									onClick: () =>
										onPlayCard?.(
											cardId,
											'ATTACK',
											info.actionFight,
											info.actionBonusId
										)
								}
							: {})}
					>
						<WaIcon name='arrow-trend-up' />
						{info.actionFight}
					</div>
				</div>
				<div className='block min-w-0'>
					<div className='h-[50px] w-[50px] border-1' />
					{info.actionBonusText && <FitText text={info.actionBonusText} />}
					{/* {info.actionBonusText && (
						<div className='w-[50px] break-words'>
							{info.actionBonusText}
						</div>
					)} */}
				</div>
			</div>
		</div>
	)

	if (onBuyCard !== undefined) {
		return (
			<button
				className={containerClass}
				onAnimationEnd={onAnimationEnd}
				onClick={() => onBuyCard(cardId)}
				ref={ref as RefObject<HTMLButtonElement>}
				type='button'
			>
				{cardInner}
			</button>
		)
	}

	return (
		<div
			className={containerClass}
			onAnimationEnd={onAnimationEnd}
			ref={ref as RefObject<HTMLDivElement>}
		>
			{cardInner}
		</div>
	)
}
