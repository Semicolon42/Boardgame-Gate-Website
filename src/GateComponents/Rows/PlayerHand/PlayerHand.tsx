import {XCard} from '../../Cards/XCard'

export function PlayerHand() {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<XCard cardId={0} />
			<XCard cardId={1} />
			<XCard
				cardId={2}
				onClick={() => {
					alert('yo dude')
				}}
			/>
		</div>
	)
}
