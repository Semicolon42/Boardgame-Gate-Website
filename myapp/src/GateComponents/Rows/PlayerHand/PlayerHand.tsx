import type {AnimatingCardSpec} from '../../Boards/useSubActionQueue'
import {CardSlot} from '../../Cards/CardSlot'
import type {CardPlayHandler} from '../../Cards/XCard'
import {XCard} from '../../Cards/XCard'

const MIN_DISPLAY_SLOTS = 4

interface PlayerHandProps {
	cardIds: number[]
	animatingCard?: AnimatingCardSpec | null
	onAnimationEnd?: () => void
	onPlayCard?: CardPlayHandler
}

export function PlayerHand({
	cardIds,
	animatingCard,
	onAnimationEnd,
	onPlayCard
}: PlayerHandProps) {
	const slotCount = Math.max(MIN_DISPLAY_SLOTS, cardIds.length)
	const slots = Array.from({length: slotCount}, (_, i) => cardIds[i] ?? null)

	return (
		<div className='justify-left hello flex flex-wrap gap-3 p-[2px]'>
			{slots.map(cardId => {
				if (cardId === null) {
					return <CardSlot key={`slot-${crypto.randomUUID()}`} />
				}
				const spec =
					animatingCard?.type === 'PLAYER' && animatingCard?.cardId === cardId
						? animatingCard
						: null
				return (
					<XCard
						cardId={cardId}
						key={`card-${cardId}`}
						{...(spec?.moveFrom ? {moveFrom: spec.moveFrom} : {})}
						{...(spec?.moveTo ? {moveTo: spec.moveTo} : {})}
						{...(spec !== null && onAnimationEnd !== undefined
							? {onAnimationEnd}
							: {})}
						onPlayCard={onPlayCard}
					/>
				)
			})}
		</div>
	)
}
