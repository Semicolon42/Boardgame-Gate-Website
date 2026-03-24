import {CardSlot} from '../../Cards/CardSlot'
import {XCard} from '../../Cards/XCard'

const MIN_DISPLAY_SLOTS = 4

interface PlayerHandProps {
	cardIds: number[]
}

export function PlayerHand({
	cardIds,
}: PlayerHandProps) {
	const slotCount = Math.max(MIN_DISPLAY_SLOTS, cardIds.length)
	const slots = Array.from({length: slotCount}, (_, i) => cardIds[i] ?? null)

	return (
		<div className='flex flex-wrap justify-center gap-3 p-[2px]'>
			{slots.map((cardId, slotIndex) =>
				cardId !== null ? (
					<XCard
						cardId={cardId}
						key={slotIndex}
						onClick={() => {
							alert(`yo dude ${cardId}`)
						}}
					/>
				) : (
					// biome-ignore lint/suspicious/noArrayIndexKey: empty slots are positional placeholders
					<CardSlot key={slotIndex} />
				)
			)}
		</div>
	)
}
