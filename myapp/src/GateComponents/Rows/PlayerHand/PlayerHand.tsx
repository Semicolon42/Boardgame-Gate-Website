import type {AnimatingCardSpec} from '../../Boards/useSubActionQueue'
import {CardSlot} from '../../Cards/CardSlot'
import {XCard} from '../../Cards/XCard'

const MIN_DISPLAY_SLOTS = 4

interface PlayerHandProps {
	cardIds: number[]
	animatingCard?: AnimatingCardSpec | null
	onAnimationEnd?: () => void
}

export function PlayerHand({
	cardIds,
	animatingCard,
	onAnimationEnd
}: PlayerHandProps) {
	const slotCount = Math.max(MIN_DISPLAY_SLOTS, cardIds.length)
	const slots = Array.from({length: slotCount}, (_, i) => cardIds[i] ?? null)

	return (
		<div className='flex flex-wrap justify-left gap-3 p-[2px] hello'>
			{slots.map((cardId, slotIndex) => {
				if (cardId === null) {
					// biome-ignore lint/suspicious/noArrayIndexKey: empty slots are positional placeholders
					return <CardSlot key={`slot-${slotIndex}`} />
				}
				const spec = animatingCard?.cardId === cardId ? animatingCard : null
				return (
					<XCard
						cardId={cardId}
						key={`card-${cardId}`}
						onClick={() => {
							alert(`yo dude ${cardId}`)
						}}
						{...(spec?.moveFrom ? {moveFrom: spec.moveFrom} : {})}
						{...(spec?.moveTo ? {moveTo: spec.moveTo} : {})}
						{...(spec !== null && onAnimationEnd !== undefined
							? {onAnimationEnd}
							: {})}
					/>
				)
			})}
		</div>
	)
}
