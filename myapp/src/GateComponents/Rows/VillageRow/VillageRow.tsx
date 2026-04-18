import type {CardInstance} from '@/GateComponents/Boards/gameStateReducer'
import type {
	AnimatingCardSpec,
	AnimatingVillagerRowSpec
} from '@/GateComponents/Boards/useSubActionQueue'
import {CardSlot} from '@/GateComponents/Boards/Stacks/CardSlot'
import type {XCardAnimSpec} from '@/GateComponents/Cards/XCard'
import {XCard} from '@/GateComponents/Cards/XCard'
import {getCitizenCard} from '@/GateComponents/Data/PlayerCardsData'

interface VillageRowProps {
	currentCoins: number
	villageCards: CardInstance[]
	isBuyable: boolean
	onAnimationEnd?: () => void
	animatingClearVillagerRow?: AnimatingVillagerRowSpec | null
	animatingCard?: AnimatingCardSpec | null
	onBuyCard?: (card: CardInstance) => void
}

export function VillageRow({
	currentCoins,
	villageCards,
	isBuyable,
	onBuyCard,
	onAnimationEnd,
	animatingClearVillagerRow,
	animatingCard
}: VillageRowProps) {
	const SlotCount = 4
	const slots = Array.from(
		{length: SlotCount},
		(_, i) => villageCards[i] ?? null
	)
	const rowAnimSpec = animatingClearVillagerRow
	return (
		<div className='flex space-x-3 p-[2px]'>
			{slots.map((card, slotIndex) => {
				if (card === null) {
					// biome-ignore lint/suspicious/noArrayIndexKey: this is a generic element where he index key is fine to
					return <CardSlot key={`slot-${slotIndex}`} />
				}
				const cardInfo = getCitizenCard(card.cardId)
				const buyable: boolean = currentCoins >= cardInfo.cost && isBuyable
				const cardAnimSpec =
					animatingCard?.type === 'VILLAGER' &&
					animatingCard.instanceId === card.instanceId
						? animatingCard
						: null
				const moveToPos = rowAnimSpec?.moveTo ?? cardAnimSpec?.moveTo
				const moveFromPos = cardAnimSpec?.moveFrom ?? undefined
				let animSpec: XCardAnimSpec | undefined
				if (moveFromPos) {
					animSpec = {type: 'FROM', pos: moveFromPos}
				} else if (moveToPos) {
					animSpec = {type: 'TO', pos: moveToPos}
				}
				// For the row-clear animation, only the first card fires onAnimationEnd
				// to avoid signalling completion once per card (which drops draw actions).
				const isSignalCard = !rowAnimSpec?.moveTo || slotIndex === 0
				return (
					<XCard
						card={card}
						disabled={!buyable}
						key={card.instanceId}
						{...(buyable && onBuyCard ? {onBuyCard} : {})}
						{...(animSpec !== undefined ? {animSpec} : {})}
						{...(isSignalCard && onAnimationEnd !== undefined
							? {onAnimationEnd}
							: {})}
					/>
				)
			})}
		</div>
	)
}
