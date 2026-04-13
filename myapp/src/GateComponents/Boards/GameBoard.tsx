import {WaButton, WaDialog, WaIcon} from '@awesome.me/webawesome/dist/react'
import {FloatingText} from '../Cards/FloatingText'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {ValueBadge} from '../UIComponents/ValueBadge'
import type {BuildingType} from './gameStateReducer'
import {useGameActions} from './useGameActions'

export function GameBoard() {
	const {
		state: gameState,
		queue,
		deckRef,
		discardRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef,
		farmRef,
		gateRef,
		towerRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove,
		animatingFloatingText,
		gameBuyCard,
		gameAttackEnemy,
		gameRepairBase,
		playCard,
		signalAnimationComplete,
		gameEndTurn,
		gameVillagerRowClear,
		gameGainGenericResource,
		clearActionLogs,
		gameOver
	} = useGameActions()

	const statusBarClass = 'p-[2px] border flex flex-col'
	const buttonClass =
		'items-center rounded-lg bg-blue-100 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 enabled:cursor-pointer enabled:hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40'
	const costCircleClass =
		'flex h-[22px] w-[22px] items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs'

	return (
		<div className='flex bg-(--color-gameboard-background)'>
			<div className='flex h-max'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-white outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
						ref={villageDeckRef}
					>
						Village:
						{gameState?.vDeck?.length ?? 'XXX'}
					</div>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-face) text-white outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
						ref={discardRef}
					>
						Discard:
						{gameState?.pDiscard?.length ?? 'XXX'}
					</div>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-white outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
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
					<WaButton
						disabled={isProcessing}
						onClick={() => {
							gameOver()
						}}
						variant='brand'
					>
						GAME OVER
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
					<EnemyRow
						animatingCard={animatingCard}
						animatingEnemyRemove={animatingEnemyRemove}
						animatingEnemyShifts={animatingEnemyShifts}
						eDeckRef={eDeckRef}
						enemyCards={gameState.eEnemyRow}
						enemyDeckCards={gameState.eEnemyDeck}
						enemyRowMax={gameState.eEnemyRowMax}
						enemySlotsRef={enemySlotsRef}
						heroCardsRemaining={gameState.hDeck.length}
						onAnimationEnd={signalAnimationComplete}
						onAttack={gameAttackEnemy}
						isAttackable={gameState.cAttack > 0}
					/>
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
					<PlayerBaseRow
						canRepair={gameState.cRepair > 0}
						farmHealth={gameState.bFarmHealth}
						farmRef={farmRef}
						gateHealth={gameState.bGateHealth}
						gateRef={gateRef}
						onRepair={(building: BuildingType) => {
							gameRepairBase(building, 1)
						}}
						towerHealth={gameState.bTowerHealth}
						towerRef={towerRef}
					/>
					{/* Fourth Row Player Hand */}
					<div className={statusBarClass}>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 2}
							onClick={() => {
								gameGainGenericResource('ATTACK', 1, 2)
							}}
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
							onClick={() => {
								gameGainGenericResource('REPAIR', 1, 2)
							}}
							type='button'
						>
							<div className={costCircleClass}>2</div>
							<ValueBadge type='REPAIR' value='1' variant='none' />
						</button>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 2}
							onClick={() => {
								gameGainGenericResource('CALM', 1, 2)
							}}
							type='button'
						>
							<div className={costCircleClass}>2</div>
							<ValueBadge type='CALM' value='1' variant='none' />
						</button>
						<button
							className={buttonClass}
							disabled={gameState.cCoins < 1}
							onClick={() => {
								gameVillagerRowClear()
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
				<div className='flex-1'>
					{queue.map(it => {
						return <div key={crypto.randomUUID()} className='bg-cyan-400'>
							{JSON.stringify(it)}
						</div>
					})}
				</div>
			</div>
			<WaDialog open={gameState.gameOutcome !== undefined}>
				GAME OVER
				{gameState.gameOutcome}
				<WaButton
					appearance='filled'
					data-dialog='close'
					slot='footer'
					variant='brand'
				>
					Close
				</WaButton>
			</WaDialog>
			{animatingFloatingText && (
				<FloatingText
					onAnimationEnd={signalAnimationComplete}
					spec={animatingFloatingText}
				/>
			)}
		</div>
	)
}
