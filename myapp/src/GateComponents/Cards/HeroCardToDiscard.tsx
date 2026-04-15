import {useMemo} from 'react'
import type {HeroCardToDiscardSpec} from '../Boards/subactions/types'
import {XCard} from './XCard'

interface HeroCardToDiscardProps {
	spec: HeroCardToDiscardSpec
	onAnimationEnd: () => void
}

export function HeroCardToDiscard({
	spec,
	onAnimationEnd
}: HeroCardToDiscardProps) {
	// Stable fake CardInstance — cardId is irrelevant in cardback mode
	const fakeCard = useMemo(
		() => ({instanceId: crypto.randomUUID(), cardId: 0}),
		[]
	)

	return (
		<div
			style={{
				position: 'fixed',
				left: spec.from.x,
				top: spec.from.y,
				zIndex: 9999,
				pointerEvents: 'none'
			}}
		>
			<XCard
				animSpec={{type: 'TO', pos: spec.to}}
				card={fakeCard}
				cardback={true}
				onAnimationEnd={() => {
					onAnimationEnd()
				}}
			/>
		</div>
	)
}
