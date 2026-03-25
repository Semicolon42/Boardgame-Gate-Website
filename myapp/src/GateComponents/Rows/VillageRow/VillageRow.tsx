import type { AnimatingCardSpec, AnimatingVillagerRowSpec } from '@/GateComponents/Boards/useSubActionQueue'
import { CardSlot } from '@/GateComponents/Cards/CardSlot'
import {XCard} from '@/GateComponents/Cards/XCard'

interface VillageRowProps {
	villageCards: number[],
	onAnimationEnd?: () => void,
	animatingClearVillagerRow?: AnimatingVillagerRowSpec | null,
	onBuyCard?: (cardId: number) => void
}

export function VillageRow({
	villageCards,
	onAnimationEnd,
	animatingClearVillagerRow,
	onBuyCard
}: VillageRowProps) {
	const SLOT_COUNT = 4
	const slots = Array.from({length: SLOT_COUNT}, (_, i) => villageCards[i] ?? null)
	const spec = animatingClearVillagerRow
	return (
		<div className='flex space-x-3 p-[2px]'>
			{spec !== null ? 'Hello' : undefined}
			{slots.map((cardId, slotIndex) => (
				(cardId === null) ? (
					<CardSlot key={`slot-${slotIndex}`} />
				) : (
					<XCard
						cardId={cardId}
						key={`villager-${cardId}`}
						onBuyCard={cardId => {
							onBuyCard?.(cardId)
						}}
						{...(spec?.moveTo ? {moveTo: spec.moveTo} : {})}
						{...(spec !== null && onAnimationEnd !== undefined
							? {onAnimationEnd}
							: {})}
					/>
				)
			))}
		</div>
	)
}
