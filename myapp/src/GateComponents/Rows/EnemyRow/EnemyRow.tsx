function EnemyCard() {
	return (
		<div className='h-[140px] w-[100px] rounded-xl bg-blue-300'>Enemy Card</div>
	)
}

export function HeroDeck(props: {cardsRemaining: number}) {
	const {cardsRemaining} = props
	return (
		<div className='h-[140px] w-[100px] rounded-xl bg-blue-300'>
			<div>Hero Deck</div>
			<div>{cardsRemaining}</div>
		</div>
	)
}

export function EnemyRow(props: {heroCardsRemaining: number}) {
	const {heroCardsRemaining} = props
	return (
		<div className='flex space-x-3 p-[2px]'>
			{/* First Enemy Card */}
			{<EnemyCard />}
			{/* Second Enemy Card */}
			{<EnemyCard />}
			{/* Enemy Deck */}
			<div className='h-[140px] w-[100px] rounded-xl bg-blue-300'>
				Enemy DECK
			</div>
			<HeroDeck cardsRemaining={heroCardsRemaining} />
		</div>
	)
}
