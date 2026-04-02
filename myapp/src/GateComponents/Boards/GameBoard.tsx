import {WaButton} from '@awesome.me/webawesome/dist/react'
import {ActionColumn} from '../ActionColumn'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {useGameActions} from './useGameActions'
import type { CardPlayHandler, CardPlayType } from '../Cards/XCard'

export function GameBoard() {
	const {
		state: gameState,
		queue,
		deckRef,
		discardRef,
		villageDeckRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		signalAnimationComplete,
		gameEndTurn,
		gameVillagerRowClear,
		clearActionLogs
	} = useGameActions()

	const onPlayCard: CardPlayHandler = (
		cardId: number,
		type: CardPlayType,
		amount: number,
		actionBonusId?: string
	) => {
		alert(`${type} ${amount} : ${actionBonusId}`)
	}

	return (
		<div className='flex'>
			<div className='flex h-max'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					
					<WaButton className='text-xs'
						disabled={isProcessing}
						onClick={() => {
							gameVillagerRowClear()
						}}
						variant='brand'
					>
						Clear Village
					</WaButton>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-900 text-white'
						ref={villageDeckRef}
					>
						Village: 
						{gameState?.vDeck?.length ?? 'XXX'}
					</div>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-400 text-white'
						ref={discardRef}
					>
						Discard:
						{gameState?.pDiscard?.length ?? 'XXX'}
					</div>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-900 text-white'
						ref={deckRef}
					>
						Deck:
						{gameState?.pDeck?.length ?? 'XXX'}
					</div>
					<WaButton
						disabled={isProcessing}
						onClick={() => {
							gameEndTurn()
						}}
						variant='brand'
					>
						End Turn
					</WaButton>
				</div>

				{/* Middle column: all game rows */}
				<div className='flex-1'>
					{/* First Row Enemies / Hero deck */}
					<EnemyRow
						enemyState={{}}
						heroCardsRemaining={gameState?.hDeck?.length ?? 'XXX'}
						updateEnemyState={{}}
					/>
					{/* Second Row Village cards to buy */}
					<VillageRow 
						animatingCard={animatingCard}
						animatingClearVillagerRow={animatingClearVillagerRow}
						onAnimationEnd={signalAnimationComplete}
						villageCards={gameState.vRow} 
					/>
					{/* Third Base and Health */}
					<PlayerBaseRow />
					{/* Fourth Row Player Hand */}
					<PlayerHand
						animatingCard={animatingCard}
						cardIds={gameState.pHand}
						onAnimationEnd={signalAnimationComplete}
						onPlayCard={onPlayCard}
					/>
				</div>
			</div>
			<div className='flex-1'>
				{/* Top of column for some elements */}
				<div />
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
					{/* <ActionColumn actionLog={gameState.actionLogs} /> */}
					{queue.map((it)=>{
						return (<div>
							{JSON.stringify(it)}
						</div>)
					})}
				</div>
			</div>
		</div>
	)
}
