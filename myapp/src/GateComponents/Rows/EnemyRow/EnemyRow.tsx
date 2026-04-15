import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {RefObject} from 'react'
import type {EnemyCardInstance} from '@/GateComponents/Boards/gameStateReducer'
import type {AnimatingCardSpec} from '@/GateComponents/Boards/useSubActionQueue'
import {CardSlot} from '@/GateComponents/Cards/CardSlot'
import {XEnemyCard} from '@/GateComponents/Cards/XEnemyCard'
import {getEnemyCard} from '@/GateComponents/Data/EnemyCardsData'

interface EnemyRowProps {
	enemyCards: EnemyCardInstance[]
	enemyRowMax: number
	enemyDeckCards: EnemyCardInstance[]
	heroCardsRemaining: number
	isAttackable?: boolean
	onAttack?: (enemy: EnemyCardInstance, amount: number) => void
	animatingCard?: AnimatingCardSpec | null
	onAnimationEnd?: () => void
	eDeckRef?: RefObject<HTMLDivElement | null>
	hDeckRef?: RefObject<HTMLDivElement | null>
	enemySlotsRef?: RefObject<(HTMLDivElement | null)[]>
	animatingEnemyShifts?: Record<string, {x: number; y: number}>
	animatingEnemyRemove?: string | null
	attackingEnemyInstanceId?: string | null | undefined
	onViewEnemyDeck?: (() => void) | undefined
	onViewHeroDeck?: (() => void) | undefined
}

function HeroDeck(props: {
	cardsRemaining: number
	hDeckRef?: RefObject<HTMLDivElement | null> | undefined
	onViewHeroDeck?: (() => void) | undefined
}) {
	const {cardsRemaining, hDeckRef, onViewHeroDeck} = props
	if (cardsRemaining === 0) {
		return <CardSlot />
	}
	const cn = [
		'flex flex-col h-[140px] w-[100px] items-center justify-center gap-2',
		'bg-(--color-card-back) text-(--color-card-text) rounded-xl',
		'outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)',
		onViewHeroDeck ? 'cursor-pointer' : ''
	].join(' ')

	return (
		<div
			className={cn}
			ref={hDeckRef}
			{...(onViewHeroDeck ? {role: 'button', onClick: onViewHeroDeck} : {})}
		>
			<div>Hero Deck</div>
			<WaIcon className='text-6xl' name='dungeon' variant='classic' />
			<div>{cardsRemaining} Heros</div>
		</div>
	)
}

function EnemyDeck(props: {
	enemyDeck: EnemyCardInstance[]
	eDeckRef?: RefObject<HTMLDivElement | null> | undefined
	onViewDeck?: (() => void) | undefined
}) {
	const {enemyDeck, eDeckRef, onViewDeck: onViewEnemyDeck} = props
	if (enemyDeck.length <= 0) {
		return <CardSlot />
	}
	const cn = [
		'flex flex-col h-[140px] w-[100px] items-center justify-center gap-2',
		'bg-(--color-card-back) text-(--color-card-text) rounded-xl',
		'outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)',
		onViewEnemyDeck ? 'cursor-pointer' : ''
	].join(' ')

	let topdDeckLevel = '<empty>'
	if (enemyDeck.length > 0) {
		switch (getEnemyCard(enemyDeck[0]?.cardId ?? 0).type) {
			case 'L1':
				topdDeckLevel = 'WAVE 1'
				break
			case 'L2':
				topdDeckLevel = 'WAVE 2'
				break
			case 'L3':
				topdDeckLevel = 'WAVE 3'
				break
			case 'Z':
				topdDeckLevel = 'ZOLTAR'
				break
			default:
				topdDeckLevel = 'default'
				break
		}
	}

	return (
		<div
			className={cn}
			ref={eDeckRef}
			{...(onViewEnemyDeck ? {role: 'button', onClick: onViewEnemyDeck} : {})}
		>
			<div>Enemy Deck</div>
			<WaIcon className='text-6xl' name='skull' />
			<div>{topdDeckLevel}</div>
		</div>
	)
}

export function EnemyRow({
	enemyCards,
	enemyRowMax,
	enemyDeckCards,
	heroCardsRemaining,
	isAttackable,
	onAttack,
	animatingCard,
	onAnimationEnd,
	eDeckRef,
	hDeckRef,
	enemySlotsRef,
	animatingEnemyShifts = {},
	animatingEnemyRemove = null,
	attackingEnemyInstanceId = null,
	onViewEnemyDeck = undefined,
	onViewHeroDeck = undefined
}: EnemyRowProps) {
	// Right-aligned: newest card occupies rightmost slot.
	// eEnemyRow = [oldest, ..., newest]; slot[offset + i] = eEnemyRow[i]
	const offset = enemyRowMax - enemyCards.length
	const slots = Array.from({length: enemyRowMax}, (_, i) =>
		i >= offset ? (enemyCards[i - offset] ?? null) : null
	)

	return (
		<div className='flex space-x-3 p-[2px]'>
			{slots.map((card, slotIndex) => {
				const isDiscarded =
					card !== null && animatingEnemyRemove === card.instanceId
				const isEntering =
					card !== null &&
					animatingCard?.type === 'ENEMY' &&
					animatingCard.instanceId === card.instanceId
				const shiftPos =
					card !== null ? animatingEnemyShifts[card.instanceId] : undefined

				// Only the fading-out or entering card fires onAnimationEnd — never shift cards.
				const cardOnAnimEnd =
					isDiscarded || isEntering ? onAnimationEnd : undefined

				let moveFromAnim: {x: number; y: number} | undefined
				if (isEntering) {
					moveFromAnim = animatingCard?.moveFrom
				} else if (shiftPos !== undefined) {
					moveFromAnim = shiftPos
				}

				return (
					// Wrapper has stable positional key — never remounts.
					// CardSlot is always rendered. XEnemyCard overlays it via grid-area stacking.
					// biome-ignore lint/suspicious/noArrayIndexKey: stable positional slot key
					<div
						className='grid'
						// biome-ignore lint/suspicious/noArrayIndexKey: this is a valid usecase for slot indexing
						key={`enemy-slot-${slotIndex}`}
						ref={el => {
							if (enemySlotsRef) enemySlotsRef.current[slotIndex] = el
						}}
					>
						<div style={{gridArea: '1/1'}}>
							<CardSlot />
						</div>
						{card !== null && (
							<XEnemyCard
								card={card}
								className='[grid-area:1/1]'
								isDiscarded={isDiscarded}
								key={card.instanceId}
								{...(moveFromAnim ? {moveFrom: moveFromAnim} : {})}
								{...(cardOnAnimEnd !== undefined
									? {onAnimationEnd: cardOnAnimEnd}
									: {})}
								isAttackable={isAttackable}
								isAttacking={card.instanceId === attackingEnemyInstanceId}
								onAttack={onAttack}
							/>
						)}
					</div>
				)
			})}

			{/* Enemy deck ref node — used by animation system to measure source position */}
			{enemyDeckCards.length <= 0 ? (
				<CardSlot />
			) : (
				<EnemyDeck
					eDeckRef={eDeckRef}
					enemyDeck={enemyDeckCards}
					onViewDeck={onViewEnemyDeck}
				/>
			)}

			<HeroDeck
				cardsRemaining={heroCardsRemaining}
				hDeckRef={hDeckRef}
				onViewHeroDeck={onViewHeroDeck}
			/>
		</div>
	)
}
