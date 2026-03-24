import {WaButton, WaCheckbox} from '@awesome.me/webawesome/dist/react'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {gameStateReducer, HAND_SIZE, initialState} from './gameStateReducer'
import {useGameActions} from './useGameActions'
import { ActionColumn } from '../ActionColumn'
import { useReducer } from 'react'

export function GameBoard() {
	const {
		state: gameState,
		deckRef,
		discardRef,
		gameDrawCards,
		gameEndTurn,
		clearActionLogs
	} = useGameActions()
	const [state, dispatch] = useReducer(gameStateReducer, initialState)

	return (
		<div className='block'>
			<div className='flex'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-400 text-white'
						ref={discardRef}
					>
						Discard
						{gameState?.pDiscard?.length ?? 'XXX'}
					</div>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-900 text-white'
						ref={deckRef}
					>
						Deck
						{gameState?.pDeck?.length ?? 'XXX'}
					</div>
				</div>

				{/* Middle column: all game rows */}
				<div className='flex-1'>
					{/* First Row Enemies / Hero deck */}
					<EnemyRow
						enemyState={{}}
						heroCardsRemaining={gameState?.hDeck?.length ?? "XXX"}
						updateEnemyState={{}}
					/>
					{/* Second Row Village cards to buy */}
					<VillageRow villageCards={[7, 8, 9, 10]} />
					{/* Third Base and Health */}
					<PlayerBaseRow />
					{/* Fourth Row Player Hand */}
					<PlayerHand
						cardIds={gameState.pHand}
					/>
				</div>

				<div className='flex-1'>
					{/* Top of column for some elements */}
					<div></div>
					{/* bottom of column to show the action list for the current turn */}
					<div className='flex-1'>
						<WaButton
							onClick={() => {
								clearActionLogs()
							}} 
							variant='brand'
						>
							Clear Log
						</WaButton>
						<ActionColumn actionLog={gameState.actionLogs}/>
					</div>
				</div>
			</div>

			<div className='block'>
				<WaButton 
					onClick={() => {
						gameEndTurn()
					}} 
					variant='brand'
				>
					End Turn
				</WaButton>
			</div>
		</div>
	)
}
