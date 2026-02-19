import {XCard} from '@/GateComponents/Cards/XCard'

export function VillageRow(props: {villageCards: number[]}) {
	const {villageCards} = props
	return (
		<div className='flex space-x-3 p-[2px]'>
			{villageCards.map(cardId => (
				<XCard
					cardId={cardId}
					key={cardId}
					onClick={() => {
						alert('yo dude')
					}}
				/>
			))}
		</div>
	)
}
