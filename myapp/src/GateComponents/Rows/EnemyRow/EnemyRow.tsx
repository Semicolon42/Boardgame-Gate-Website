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
}

export function HeroDeck(props: {
	cardsRemaining: number
	hDeckRef?: RefObject<HTMLDivElement | null> | undefined
}) {
	const {cardsRemaining, hDeckRef} = props
	if (cardsRemaining === 0) {
		return <CardSlot />
	}
	return (
		<div
			className='h-[140px] w-[100px] rounded-xl bg-(--color-card-back) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) text-(--color-card-text)'
			ref={hDeckRef}
		>
			<div>Hero Deck</div>
			<div>{cardsRemaining}</div>
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
	animatingEnemyRemove = null
}: EnemyRowProps) {
	// Right-aligned: newest card occupies rightmost slot.
	// eEnemyRow = [oldest, ..., newest]; slot[offset + i] = eEnemyRow[i]
	const offset = enemyRowMax - enemyCards.length
	const slots = Array.from({length: enemyRowMax}, (_, i) =>
		i >= offset ? (enemyCards[i - offset] ?? null) : null
	)

	let topdDeckLevel = '<empty>'
	if (enemyDeckCards[0]) {
		topdDeckLevel = getEnemyCard(enemyDeckCards[0]?.cardId).type
	}

	return (
		<div className='flex space-x-3 p-[2px]'>
			{slots.map((card, slotIndex) => {
				const isFadingOut =
					card !== null && animatingEnemyRemove === card.instanceId
				const isEntering =
					card !== null &&
					animatingCard?.type === 'ENEMY' &&
					animatingCard.instanceId === card.instanceId
				const shiftPos =
					card !== null ? animatingEnemyShifts[card.instanceId] : undefined

				// Only the fading-out or entering card fires onAnimationEnd — never shift cards.
				const cardOnAnimEnd =
					isFadingOut || isEntering ? onAnimationEnd : undefined

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
								isFadingOut={isFadingOut}
								key={card.instanceId}
								{...(moveFromAnim ? {moveFrom: moveFromAnim} : {})}
								{...(cardOnAnimEnd !== undefined
									? {onAnimationEnd: cardOnAnimEnd}
									: {})}
								isAttackable={isAttackable}
								onAttack={onAttack}
							/>
						)}
					</div>
				)
			})}

			{/* Enemy deck ref node — used by animation system to measure source position */}
			<div
				className='flex flex-col h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) text-white'
				ref={eDeckRef}
			>
				<div>Enemy Deck</div>
				<div>{enemyDeckCards.length} Cards</div>
				<div>{topdDeckLevel}</div>
			</div>

			<HeroDeck cardsRemaining={heroCardsRemaining} hDeckRef={hDeckRef} />
		</div>
	)
}
