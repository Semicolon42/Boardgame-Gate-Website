import type {CardInstance} from '../../Boards/gameStateReducer'
import {CardSlot} from '../../Boards/Stacks/CardSlot'
import type {AnimatingCardSpec} from '../../Boards/useSubActionQueue'
import type {
	CardPlayHandler,
	CardPlayType,
	XCardAnimSpec
} from '../../Cards/XCard'
import {XCard} from '../../Cards/XCard'

const MIN_DISPLAY_SLOTS = 4

interface PlayerHandProps {
	cards: CardInstance[]
	playedInstanceIds?: {[key: string]: CardPlayType | undefined}
	animatingCard?: AnimatingCardSpec | null
	onAnimationEnd?: () => void
	onPlayCard?: CardPlayHandler
}

function toXCardAnimSpec(spec: AnimatingCardSpec): XCardAnimSpec | undefined {
	if (spec.moveFrom) return {type: 'FROM', pos: spec.moveFrom}
	if (spec.moveTo) return {type: 'TO', pos: spec.moveTo}
	if (spec.fallAway) return {type: 'FALL_AWAY'}
	if (spec.pulse) return {type: 'PULSE'}
	return undefined
}

export function PlayerHand({
	cards,
	playedInstanceIds,
	animatingCard,
	onAnimationEnd,
	onPlayCard
}: PlayerHandProps) {
	const slotCount = Math.max(MIN_DISPLAY_SLOTS, cards.length)
	const slots = Array.from({length: slotCount}, (_, i) => cards[i] ?? null)

	return (
		<div className='justify-left hello flex flex-wrap gap-3 p-[2px]'>
			{slots.map((card, i) => {
				if (card === null) {
					// biome-ignore lint/suspicious/noArrayIndexKey: this is a generic element where he index key is fine to use
					return <CardSlot key={`slot-${i}`} />
				}
				const spec =
					animatingCard?.type === 'PLAYER' &&
					animatingCard.instanceId === card.instanceId
						? animatingCard
						: null
				const animSpec = spec ? toXCardAnimSpec(spec) : undefined
				return (
					<XCard
						card={card}
						disabled={
							playedInstanceIds && playedInstanceIds[card.instanceId]
								? true
								: false
						}
						isPlayable={true}
						isPlayed={
							playedInstanceIds ? playedInstanceIds[card.instanceId] : undefined
						}
						key={card.instanceId}
						{...(animSpec !== undefined ? {animSpec} : {})}
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
