import {WaButton, type WaIcon} from '@awesome.me/webawesome/dist/react'
import React, {useState} from 'react'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'

export function GameBoard() {
	const [state, setState] = useState({
		pDeck: [0, 1, 2],
		pHand: [],
		hDeck: [101, 102, 103, 104]
	})
	const [enemyState, setEnemeyState] = useState({})

	return (
		<div className=''>
			{/* First Row Enemies / Hero deck */}
			<EnemyRow
				enemyState={{}}
				heroCardsRemaining={state.hDeck.length}
				updateEnemyState={{}}
			/>
			{/* Second Row Village cards to buy */}
			<VillageRow villageCards={[7, 8, 9, 10]} />
			{/* Third Base and Health */}
			<PlayerBaseRow />
			{/* Forth Row Player Hand */}
			<PlayerHand cardIds={state.pHand} />

			<WaButton
				onClick={() => {
					alert('hello')
				}}
				variant='brand'
			>
				Draw Hand
			</WaButton>
		</div>
	)
}
