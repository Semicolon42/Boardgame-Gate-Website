import {GET_CITIZEN_CARD} from '../Data/PlayerCards'

// Import CSS
import '@/GateComponents/Cards/XCard.css'

interface XcardProps {
	cardId: number
	// biome-ignore lint/suspicious/noExplicitAny: can't find a simple enough type
	onClick?: any
}

export function XCard({cardId, onClick}: XcardProps) {
	const info = GET_CITIZEN_CARD(cardId)

	return (
		<button
			className='flex h-[140px] w-[100px] rounded-xl bg-blue-300'
			onClick={onClick}
			type='button'
		>
			<div className='w-100'>
				<div className=''>{info.name}</div>
				<div className='@cardCost'>{info.cost}</div>
				<div className='@cardCoins'>{info.actionCoins}</div>
				<div className='@cardRepair'>{info.actionRepair}</div>
				<div className='@cardCalm'>{info.actionCalm}</div>
				<div className='@cardFight'>{info.actionFight}</div>
				{info.actionBonusText && (
					<div className='@cardBonus'>{info.actionBonusText}</div>
				)}
			</div>
		</button>
	)
}
