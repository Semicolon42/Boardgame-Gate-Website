import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {ReactElement, RefObject} from 'react'
import {useLayoutEffect, useRef} from 'react'
import type {CardInstance} from '../Boards/gameStateReducer'
import {getCitizenCard} from '../Data/PlayerCards'

function ActionButton({
	cardClass,
	value,
	isPlayed,
	isDisabled,
	icon,
	isHandMode,
	onAction
}: {
	cardClass: string
	value: number
	isPlayed: boolean
	isDisabled: boolean
	icon: ReactElement
	isHandMode: boolean
	onAction: () => void
}) {
	let buttonClass = `card-action-btn outline-2 ${cardClass}`
	if (isDisabled) {
		buttonClass +=
			' outline-transparent bg-transparent opacity-40 cursor-default'
	} else if (isPlayed) {
		buttonClass +=
			' outline-(--color-card-action-played) bg-(--color-card-action-played)'
	} else {
		buttonClass += ' outline-transparent bg-transparent '
		buttonClass += isHandMode
			? 'hover:outline-(--color-outline-active-hover)'
			: ''
	}
	return (
		<div
			className={buttonClass}
			{...(isHandMode && !isDisabled
				? {role: 'button', onClick: onAction}
				: {})}
		>
			{icon}
			{value}
		</div>
	)
}

// Import CSS — defines card-move-from-animate / card-move-to-animate classes and keyframes
import '@/GateComponents/Cards/XCard.css'
import {FitText, ScaledName} from '../UIComponents/misc'

export type CardPlayType = 'COINS' | 'REPAIR' | 'CALM' | 'ATTACK'

export type CardPlayHandler = (
	card: CardInstance,
	type: CardPlayType,
	amount: number,
	actionBonusId?: string,
	disabled?: boolean
) => void

interface XcardProps {
	card: CardInstance
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
	onBuyCard?: (card: CardInstance) => void
	// Disable all functions
	disabled?: boolean
	isPlayed?: CardPlayType | undefined
	// Renders the card shape with the card-back colour and no content.
	// Used for animations where a face-down card travels between positions.
	cardback?: boolean
}

export function XCard({
	card,
	onAnimationEnd,
	moveFrom,
	moveTo,
	onPlayCard,
	onBuyCard,
	isPlayed,
	disabled = false,
	cardback = false
}: XcardProps) {
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

	let containerClass = `flex h-[140px] w-[100px] items-start rounded-xl ${cardback ? 'bg-(--color-card-back)' : 'bg-(--color-card-face) text-(--color-card-text)'} XCARD outline-4`
	if (disabled) {
		containerClass += ' pointer-events-none'
		containerClass +=
			' outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
	} else if (onBuyCard !== undefined || onPlayCard !== undefined) {
		containerClass +=
			' outline-(--color-outline-active) hover:outline-(--color-outline-active-hover)'
	} else {
		containerClass +=
			' outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
	}

	if (cardback) {
		return (
			<div
				className={containerClass}
				onAnimationEnd={onAnimationEnd}
				ref={ref as RefObject<HTMLDivElement>}
			/>
		)
	}

	const info = getCitizenCard(card.cardId)

	// Hand mode: action fields shown as individual clickable divs.
	// Village mode: action fields are read-only (whole card is the button).
	const isHandMode = onBuyCard === undefined

	const cardInner = (
		<div className='w-full'>
			<div className='flex items-center gap-[4px] px-[5px] stroke-2 stroke-amber-100'>
				<ScaledName text={info.name} />
				<div className='flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs text-black'>
					{info.cost}
				</div>
			</div>
			<div className='flex'>
				<div className='block w-[40px]'>
					<ActionButton
						cardClass='@cardCoins'
						icon={<WaIcon name='circle' variant='regular' />}
						isDisabled={info.actionCoins === 0}
						isHandMode={isHandMode}
						isPlayed={isPlayed === 'COINS'}
						onAction={() =>
							onPlayCard?.(card, 'COINS', info.actionCoins, info.actionBonusId)
						}
						value={info.actionCoins}
					/>
					<ActionButton
						cardClass='@cardRepair'
						icon={<WaIcon name='plus' />}
						isDisabled={info.actionRepair === 0}
						isHandMode={isHandMode}
						isPlayed={isPlayed === 'REPAIR'}
						onAction={() =>
							onPlayCard?.(
								card,
								'REPAIR',
								info.actionRepair,
								info.actionBonusId
							)
						}
						value={info.actionRepair}
					/>
					<ActionButton
						cardClass='@cardCalm'
						icon={<WaIcon name='eye' variant='regular' />}
						isDisabled={info.actionCalm === 0}
						isHandMode={isHandMode}
						isPlayed={isPlayed === 'CALM'}
						onAction={() =>
							onPlayCard?.(card, 'CALM', info.actionCalm, info.actionBonusId)
						}
						value={info.actionCalm}
					/>
					<ActionButton
						cardClass='@cardFight'
						icon={<WaIcon name='arrow-trend-up' />}
						isDisabled={info.actionAttack === 0}
						isHandMode={isHandMode}
						isPlayed={isPlayed === 'ATTACK'}
						onAction={() =>
							onPlayCard?.(
								card,
								'ATTACK',
								info.actionAttack,
								info.actionBonusId
							)
						}
						value={info.actionAttack}
					/>
				</div>
				<div className='block min-w-0'>
					<div className='h-[50px] w-[50px] border-1' />
					{info.actionBonusText && <FitText text={info.actionBonusText} />}
				</div>
			</div>
		</div>
	)

	if (onBuyCard !== undefined) {
		return (
			<button
				className={containerClass}
				onAnimationEnd={onAnimationEnd}
				onClick={() => onBuyCard(card)}
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
