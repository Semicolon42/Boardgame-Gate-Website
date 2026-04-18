import type {RefObject} from 'react'
import type {EnemyCardInstance} from '@/GateComponents/Boards/gameStateReducer'
import {CardSlot} from '@/GateComponents/Boards/Stacks/CardSlot'
import {EnemyDeck} from '@/GateComponents/Boards/Stacks/EnemyDeck'
import {HeroDeck} from '@/GateComponents/Boards/Stacks/HeroDeck'
import type {AnimatingCardSpec} from '@/GateComponents/Boards/useSubActionQueue'
import {XEnemyCard} from '@/GateComponents/Cards/XEnemyCard'

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
	onExileAnimationEnd?: (() => void) | undefined
	onViewEnemyDeck?: (() => void) | undefined
	onViewHeroDeck?: (() => void) | undefined
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
	onExileAnimationEnd = undefined,
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

				// Discarded card uses onExileAnimationEnd when provided (combined exile+attack),
				// otherwise falls back to onAnimationEnd. Entering card always uses onAnimationEnd.
				const cardOnAnimEnd = isDiscarded
					? (onExileAnimationEnd ?? onAnimationEnd)
					: isEntering
						? onAnimationEnd
						: undefined

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
						<div className='[grid-area:1/1]'>
							<CardSlot />
						</div>
						{card !== null && (
							<XEnemyCard
								card={card}
								className='z-[1] [grid-area:1/1]'
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
