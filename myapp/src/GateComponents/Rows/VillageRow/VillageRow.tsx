import type {
	AnimatingCardSpec,
	AnimatingVillagerRowSpec
} from '@/GateComponents/Boards/useSubActionQueue'
import {CardSlot} from '@/GateComponents/Cards/CardSlot'
import {XCard} from '@/GateComponents/Cards/XCard'

interface VillageRowProps {
	villageCards: number[]
	onAnimationEnd?: () => void
	animatingClearVillagerRow?: AnimatingVillagerRowSpec | null
	animatingCard?: AnimatingCardSpec | null
	onBuyCard?: (cardId: number) => void
}

export function VillageRow({
	villageCards,
	onAnimationEnd,
	animatingClearVillagerRow,
	animatingCard,
	onBuyCard
}: VillageRowProps) {
	const SlotCount = 4
	const slots = Array.from(
		{length: SlotCount},
		(_, i) => villageCards[i] ?? null
	)
	const rowAnimSpec = animatingClearVillagerRow
	return (
		<div className='flex space-x-3 p-[2px]'>
			{slots.map((cardId, slotIndex) => {
				if (cardId === null) {
					return <CardSlot key={`slot-${crypto.randomUUID()}`} />
				}
				const cardAnimSpec =
					animatingCard?.type === 'VILLAGER' && animatingCard?.cardId === cardId
						? animatingCard
						: null
				const moveToAnim = rowAnimSpec?.moveTo ?? undefined
				const moveFromAnim = cardAnimSpec?.moveFrom ?? undefined
				// For the row-clear animation, only the first card fires onAnimationEnd
				// to avoid signalling completion once per card (which drops draw actions).
				const isSignalCard =
					moveFromAnim !== undefined ||
					(moveToAnim !== undefined && slotIndex === 0)
				return (
					<XCard
						cardId={cardId}
						key={`villager-${cardId}`}
						onBuyCard={() => {
							onBuyCard?.(cardId)
						}}
						{...(moveFromAnim ? {moveFrom: moveFromAnim} : {})}
						{...(moveToAnim ? {moveTo: moveToAnim} : {})}
						{...(isSignalCard && onAnimationEnd !== undefined
							? {onAnimationEnd}
							: {})}
					/>
				)
			})}
		</div>
	)
}
