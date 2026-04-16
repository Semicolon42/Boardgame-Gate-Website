import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {ReactElement, RefObject} from 'react'
import {useRef} from 'react'
import type {CardInstance} from '../Boards/gameStateReducer'
import {getCitizenCard} from '../Data/PlayerCards'

// Import CSS — defines card-move-from-animate / card-move-to-animate classes and keyframes
import '@/GateComponents/Cards/XCard.css'
import theme from '@/themes'
import {FitText, ScaledName} from '../UIComponents/misc'
import {useFallawayAnimation} from './useFallawayAnimation'
import {useSlideAnimation} from './useSlideAnimation'

function ActionButton({
	cardClass,
	value,
	isPlayed,
	isDisabled,
	icon,
	isPlayable,
	onAction
}: {
	cardClass: string
	value: number
	isPlayed: boolean
	isDisabled: boolean
	icon: ReactElement
	isPlayable: boolean
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
		buttonClass += isPlayable
			? 'hover:outline-(--color-outline-active-hover)'
			: ''
	}
	return (
		<div
			className={buttonClass}
			{...(isPlayable && !isDisabled
				? {role: 'button', onClick: onAction}
				: {})}
		>
			{icon}
			{value}
		</div>
	)
}

export type CardPlayType = 'COINS' | 'REPAIR' | 'CALM' | 'ATTACK'

export type CardPlayHandler = (
	card: CardInstance,
	type: CardPlayType,
	amount: number,
	actionBonusId?: string,
	disabled?: boolean
) => void

/**
 * Animation spec for a single card. Discriminated union keeps variants
 * mutually exclusive and the call site self-documenting.
 *
 * FROM  — card enters: animates from external position into its DOM slot.
 * TO    — card exits:  animates from its DOM slot to an external position.
 * FALL_AWAY — card exits: falls and fades in place (played hero cards removed from game).
 */
export type XCardAnimSpec =
	| {type: 'FROM'; pos: {x: number; y: number}}
	| {type: 'TO'; pos: {x: number; y: number}}
	| {type: 'FALL_AWAY'}

interface XcardProps {
	card: CardInstance
	onAnimationEnd?: () => void
	animSpec?: XCardAnimSpec
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
	isPlayable?: boolean
}

export function XCard({
	card,
	onAnimationEnd,
	animSpec,
	onPlayCard,
	onBuyCard,
	isPlayed,
	disabled = false,
	cardback = false,
	isPlayable = false
}: XcardProps) {
	// ref gives us direct access to the DOM node so we can read its position
	// and imperatively add/remove the animation class without triggering a re-render.
	// Typed as HTMLElement — the common base for both <div> (hand) and <button> (village).
	const ref = useRef<HTMLElement>(null)

	const onAnimationEndRef = useRef(onAnimationEnd)
	onAnimationEndRef.current = onAnimationEnd

	const slideSpec =
		animSpec?.type === 'FROM' || animSpec?.type === 'TO' ? animSpec : undefined
	useSlideAnimation(ref, slideSpec)
	useFallawayAnimation(
		ref,
		{...theme.enemyDiscard},
		animSpec?.type === 'FALL_AWAY',
		onAnimationEndRef
	)

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
			>
				<WaIcon className='text-6xl' name='dungeon' variant='classic' />
			</div>
		)
	}

	const info = getCitizenCard(card.cardId)

	// Hand mode: action fields shown as individual clickable divs.
	// Village mode: action fields are read-only (whole card is the button).

	const cardInner = (
		<div className='w-full'>
			<div className='flex items-center gap-[4px] px-[5px]'>
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
						isPlayable={isPlayable}
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
						isPlayable={isPlayable}
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
						isPlayable={isPlayable}
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
						isPlayable={isPlayable}
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
