import {WaButton, WaIcon} from '@awesome.me/webawesome/dist/react'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {ValueBadge} from '../UIComponents/ValueBadge'
import {useGameActions} from './useGameActions'

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
		gameBuyCard,
		playCard,
		signalAnimationComplete,
		gameEndTurn,
		gameVillagerRowClear,
		clearActionLogs
	} = useGameActions()

	const statusBarClass = 'p-[2px] border flex flex-col'
	const buttonClass =
		'items-center rounded-lg bg-blue-100 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 enabled:cursor-pointer enabled:hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40'
	const costCircleClass =
		'flex h-[22px] w-[22px] items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs'

	return (
		<div className='flex'>
			<div className='flex h-max'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
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
				<div className='flex-1 grid grid-cols-[max-content_1fr]'>
					{/* First Row Enemies / Hero deck */}
					<div className={statusBarClass}>
						<ValueBadge
							type='ATTACK'
							value={`${gameState.cAttack}`}
							variant={gameState.cAttack > 0 ? 'success' : 'neutral'}
						/>
					</div>
					<EnemyRow heroCardsRemaining={gameState?.hDeck?.length ?? 'XXX'} />
					{/* Second Row Village cards to buy */}
					<div className={statusBarClass}>
						<ValueBadge
							type='COINS'
							value={`${gameState.cCoins}`}
							variant={gameState.cCoins > 0 ? 'success' : 'neutral'}
						/>
					</div>
					<VillageRow
						animatingCard={animatingCard}
						animatingClearVillagerRow={animatingClearVillagerRow}
						currentCoins={gameState.cCoins}
						onAnimationEnd={signalAnimationComplete}
						onBuyCard={gameBuyCard}
						villageCards={gameState.vRow}
					/>
					{/* Third Base and Health */}
					<div className={statusBarClass}>
						<ValueBadge
							type='CALM'
							value={`${gameState.cCalm}`}
							variant={gameState.cCalm > 0 ? 'success' : 'neutral'}
						/>
						<ValueBadge
							type='REPAIR'
							value={`${gameState.cRepair}`}
							variant={gameState.cRepair > 0 ? 'success' : 'neutral'}
						/>
						{gameState.cRepair > 0 && gameState.cBonusRepairFarm > 0 && (
							<ValueBadge
								type='REPAIR'
								value={`${gameState.cBonusRepairFarm} F`}
								variant={gameState.cRepair > 0 ? 'success' : 'neutral'}
							/>
						)}
						{gameState.cRepair > 0 && gameState.cBonusRepairGate > 0 && (
							<ValueBadge
								type='REPAIR'
								value={`${gameState.cBonusRepairGate} G`}
								variant={gameState.cRepair > 0 ? 'success' : 'neutral'}
							/>
						)}
						{gameState.cRepair > 0 && gameState.cBonusRepairTower > 0 && (
							<ValueBadge
								type='REPAIR'
								value={`${gameState.cBonusRepairTower} T`}
								variant={gameState.cRepair > 0 ? 'success' : 'neutral'}
							/>
						)}
					</div>
					<PlayerBaseRow />
					{/* Fourth Row Player Hand */}
					<div className={statusBarClass}>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 2}
							type='button'
						>
							<div className='flex h-[22px] w-[22px] items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs'>
								2
							</div>
							<ValueBadge type='ATTACK' value='1' variant='none' />
						</button>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 2}
							type='button'
						>
							<div className={costCircleClass}>2</div>
							<ValueBadge type='REPAIR' value='1' variant='none' />
						</button>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 2}
							type='button'
						>
							<div className={costCircleClass}>2</div>
							<ValueBadge type='CALM' value='1' variant='none' />
						</button>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 1}
							onClick={() => {
								gameVillagerRowClear(1)
							}}
							type='button'
						>
							<div className={costCircleClass}>1</div>
							<WaIcon name='arrow-rotate-right' />
						</button>
					</div>
					<PlayerHand
						animatingCard={animatingCard}
						cards={gameState.pHand}
						onAnimationEnd={signalAnimationComplete}
						onPlayCard={playCard}
						playedInstanceIds={gameState.pPlayed}
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
					{queue.map(it => {
						return <div key={crypto.randomUUID()}>{JSON.stringify(it)}</div>
					})}
				</div>
			</div>
		</div>
	)
}
