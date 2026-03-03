import {XCard} from '../../Cards/XCard'

interface PlayerHandProps {
	cardIds: number[]
	newlyDrawnIndices: Set<number>
	onCardAnimationEnd: (index: number) => void
	// Deck position snapshot passed down from GameBoard; forwarded to each XCard
	// so the fly-in animation starts from the deck rather than off-screen.
	drawOrigin?: {x: number; y: number}
}
export function PlayerHand({
	cardIds,
	newlyDrawnIndices,
	onCardAnimationEnd,
	drawOrigin
}: PlayerHandProps) {
	return (
		<div className='flex space-x-3 p-[2px]'>
			{cardIds.map((cId, index) => (
				<XCard
					cardId={cId}
					drawOrigin={drawOrigin}
					isNewlyDrawn={newlyDrawnIndices.has(index)}
					// biome-ignore lint/suspicious/noArrayIndexKey: hand is rebuilt from scratch each draw; index == draw slot
					key={index}
					onAnimationEnd={() => onCardAnimationEnd(index)}
					onClick={() => {
						alert(`yo dude ${cId}`)
					}}
				/>
			))}
		</div>
	)
}
