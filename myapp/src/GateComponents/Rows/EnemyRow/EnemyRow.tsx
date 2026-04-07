import type {RefObject} from 'react'
import type {EnemyCardInstance} from '@/GateComponents/Boards/gameStateReducer'
import type {AnimatingCardSpec} from '@/GateComponents/Boards/useSubActionQueue'
import {CardSlot} from '@/GateComponents/Cards/CardSlot'
import {XEnemyCard} from '@/GateComponents/Cards/XEnemyCard'

interface EnemyRowProps {
	enemyCards: EnemyCardInstance[]
	enemyRowMax: number
	heroCardsRemaining: number
	animatingCard?: AnimatingCardSpec | null
	onAnimationEnd?: () => void
	eDeckRef?: RefObject<HTMLDivElement | null>
}

export function HeroDeck(props: {cardsRemaining: number}) {
	const {cardsRemaining} = props
	return (
		<div className='h-[140px] w-[100px] rounded-xl bg-blue-300'>
			<div>Hero Deck</div>
			<div>{cardsRemaining}</div>
		</div>
	)
}

export function EnemyRow({
	enemyCards,
	enemyRowMax,
	heroCardsRemaining,
	animatingCard,
	onAnimationEnd,
	eDeckRef
}: EnemyRowProps) {
	const slots = Array.from(
		{length: enemyRowMax},
		(_, i) => enemyCards[i] ?? null
	)

	return (
		<div className='flex space-x-3 p-[2px]'>
			{slots.map((card, slotIndex) => {
				const spec =
					animatingCard?.type === 'ENEMY' &&
					card !== null &&
					animatingCard.instanceId === card.instanceId
						? animatingCard
						: null

				return (
					// Wrapper has stable positional key — never remounts.
					// CardSlot is always rendered. XEnemyCard overlays it via grid-area stacking.
					// biome-ignore lint/suspicious/noArrayIndexKey: this is a generic element where he index key is fine to use
					<div className='grid' key={`enemy-slot-${slotIndex}`}>
						<div style={{gridArea: '1/1'}}>
							<CardSlot />
						</div>
						{card !== null && (
							<XEnemyCard
								card={card}
								className='[grid-area:1/1]'
								key={card.instanceId}
								{...(spec?.moveFrom ? {moveFrom: spec.moveFrom} : {})}
								{...(spec?.moveTo ? {moveTo: spec.moveTo} : {})}
								{...(spec !== null && onAnimationEnd !== undefined
									? {onAnimationEnd}
									: {})}
							/>
						)}
					</div>
				)
			}).reverse()}

			{/* Enemy deck ref node — used by animation system to measure source position */}
			<div
				className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-900 text-white'
				ref={eDeckRef}
			>
				Enemy Deck
			</div>

			<HeroDeck cardsRemaining={heroCardsRemaining} />
		</div>
	)
}
