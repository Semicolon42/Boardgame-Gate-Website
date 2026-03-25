import {XCard} from '@/GateComponents/Cards/XCard'

export function VillageRow(props: {villageCards: number[]}) {
	const {villageCards} = props
	return (
		<div className='flex space-x-3 p-[2px]'>
			{villageCards.map(cardId => (
				<XCard
					cardId={cardId}
					key={cardId}
					onBuyCard={id => {
						alert(`buy card ${id}`)
					}}
				/>
			))}
		</div>
	)
}
