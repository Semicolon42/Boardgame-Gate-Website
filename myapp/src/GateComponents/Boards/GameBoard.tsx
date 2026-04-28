import {WaButton, WaDialog, WaIcon} from '@awesome.me/webawesome/dist/react'
import {useEffect, useRef, useState} from 'react'
import {
	type CardDialogProps,
	PlayerEnemyCardDialog
} from '../CardDialogs/PlayerEnemyCardDialog'
import {FloatingText} from '../Cards/FloatingText'
import {HeroCardToDiscard} from '../Cards/HeroCardToDiscard'
import {getCitizenCard} from '../Data/PlayerCardsData'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {GameStatsPanel} from '../Stats/GameStatsPanel'
import {saveGameRecord} from '../Stats/gameStats'
import {ValueBadge} from '../UIComponents/ValueBadge'
import {AttackLine} from './AttackLine'
import {type BuildingType, makeEnemyCardInstances} from './gameStateReducer'
import {CitizenDeck} from './Stacks/CitizenDeckStack'
import {PlayerDeck} from './Stacks/PlayerDeckStack'
import {PlayerDiscard} from './Stacks/PlayerDiscardStack'
import {useGameActions} from './useGameActions'

export function GameBoard() {
	const {
		state: gameState,
		gameRecord,
		gameSeed,
		deckRef,
		discardRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef,
		farmRef,
		gateRef,
		towerRef,
		fearamidRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove,
		animatingFloatingText,
		animatingHeroToDiscard,
		animatingAttackVisualization,
		signalExileComplete,
		hDeckRef,
		gameBuyCard,
		gameDrawCards,
		gameAttackEnemy,
		gameRepairBase,
		gameCalmFear,
		gameTrashCardFromDiscard,
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

	const [cardDialog, setCardDialog] = useState<CardDialogProps | undefined>(
		undefined
	)
	const [showStats, setShowStats] = useState(false)

	const prevOutcomeRef = useRef(gameState.gameOutcome)
	const gameRecordRef = useRef(gameRecord)
	gameRecordRef.current = gameRecord
	useEffect(() => {
		if (
			gameState.gameOutcome !== undefined &&
			prevOutcomeRef.current !== gameState.gameOutcome
		) {
			saveGameRecord({...gameRecordRef.current, seed: gameSeed})
		}
		prevOutcomeRef.current = gameState.gameOutcome
	}, [gameState.gameOutcome, gameSeed])

	const onViewEnemyDeck = () => {
		const temp = makeEnemyCardInstances([1, 2, 3, 4, 5, 6, 7, 8, 9])
		setCardDialog({
			title: 'Enemy Deck',
			playerCards: [],
			enemyCards: temp,
			isOpen: true,
			onClose: undefined
		})
	}
	const onViewPlayerDeck = () => {
		setCardDialog({
			title: 'Player Deck',
			playerCards: gameState?.pDeck,
			enemyCards: [],
			isOpen: true,
			onClose: undefined
		})
	}
	const onViewHeroDeck = () => {
		setCardDialog({
			title: 'Hero Deck',
			playerCards: gameState.hDeck,
			enemyCards: [],
			isOpen: true,
			onClose: undefined
		})
	}
	const onViewCitizenDeck = () => {
		setCardDialog({
			isOpen: true,
			title: 'Villager Deck',
			playerCards: [...gameState.vDeck, ...gameState.vDiscard],
			enemyCards: [],
			onClose: undefined
		})
	}
	const onViewDiscard = () => {
		setCardDialog({
			isOpen: true,
			onClose: undefined,
			title: 'Player Discard',
			playerCards: gameState.pDiscard,
			enemyCards: [],
			onTrashCard: (card, consumesGenericAmount) => {
				gameTrashCardFromDiscard(card, consumesGenericAmount)
			},
			genericTrashesAvailable:
				gameState.activeEffects.mayTrashCardsFromDiscard ?? 0
		})
	}

	return (
		<div className='flex bg-(--color-gameboard-background)'>
			<div className='flex h-max'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					<CitizenDeck onViewDeck={onViewCitizenDeck} ref={villageDeckRef} />
					<PlayerDiscard
						discard={gameState.pDiscard}
						mayTrashFromDiscard={
							gameState.pDiscard.some(
								c => getCitizenCard(c.cardId).canTrashFromDiscard
							) || (gameState.activeEffects.mayTrashCardsFromDiscard ?? 0) > 0
						}
						onViewDiscard={onViewDiscard}
						ref={discardRef}
					/>
					<PlayerDeck
						deck={gameState?.pDeck}
						deckRef={deckRef}
						mayDrawCards={gameState.activeEffects.mayDrawCards ?? 0}
						onDrawBonusCard={() => {
							gameDrawCards(1, true)
						}}
						onViewDeck={onViewPlayerDeck}
					/>
					<WaButton
						disabled={isProcessing}
						onClick={() => {
							gameEndTurn()
						}}
						variant='brand'
					>
						End Turn
					</WaButton>
					<WaButton onClick={() => setShowStats(true)} variant='neutral'>
						Stats
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
						<ValueBadge
							type='ATTACK'
							value={`T ${gameState.bTowerBonusDamageCurrent}`}
							variant={
								gameState.bTowerBonusDamageCurrent <= 0
									? 'none'
									: gameState.cAttack > 0
										? 'success'
										: 'brand'
							}
						/>
					</div>
					<EnemyRow
						animatingCard={animatingCard}
						animatingEnemyRemove={animatingEnemyRemove}
						animatingEnemyShifts={animatingEnemyShifts}
						attackingEnemyInstanceId={
							animatingAttackVisualization?.attackSource.kind === 'ENEMY'
								? animatingAttackVisualization.attackSource.instanceId
								: null
						}
						eDeckRef={eDeckRef}
						enemyCards={gameState.eEnemyRow}
						enemyDeckCards={gameState.eEnemyDeck}
						enemyRowMax={gameState.eEnemyRowMax}
						enemySlotsRef={enemySlotsRef}
						hDeckRef={hDeckRef}
						heroCardsRemaining={gameState.hDeckRemaining}
						isAttackable={!isProcessing && gameState.cAttack > 0}
						onAnimationEnd={signalAnimationComplete}
						onAttack={gameAttackEnemy}
						onExileAnimationEnd={
							animatingAttackVisualization?.attackSource.kind === 'ENEMY'
								? signalExileComplete
								: signalAnimationComplete
						}
						onViewEnemyDeck={onViewEnemyDeck}
						onViewHeroDeck={onViewHeroDeck}
					/>
					{/* Second Row Village cards to buy */}
					<div className={statusBarClass}>
						<ValueBadge
							type='COINS'
							value={`${gameState.cCoins}`}
							variant={gameState.cCoins > 0 ? 'success' : 'neutral'}
						/>
						<ValueBadge
							type='COINS'
							value={`F ${gameState.bFarmBonusRecruitCurrent}`}
							variant={
								gameState.bFarmBonusRecruitCurrent <= 0
									? 'none'
									: gameState.cCoins > 0
										? 'success'
										: 'brand'
							}
						/>
					</div>
					<VillageRow
						animatingCard={animatingCard}
						animatingClearVillagerRow={animatingClearVillagerRow}
						currentCoins={gameState.cCoins + gameState.bFarmBonusRecruitCurrent}
						isBuyable={!isProcessing}
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
						attackedTarget={
							animatingAttackVisualization?.attackTarget.kind ===
							'BUILDING_FARM'
								? 'farm'
								: animatingAttackVisualization?.attackTarget.kind ===
										'BUILDING_GATE'
									? 'gate'
									: animatingAttackVisualization?.attackTarget.kind ===
											'BUILDING_TOWER'
										? 'tower'
										: animatingAttackVisualization?.attackTarget.kind ===
												'FEARAMID'
											? 'fearamid'
											: null
						}
						canCalm={!isProcessing && gameState.cCalm > 0}
						canRepair={!isProcessing && gameState.cRepair > 0}
						farmRef={farmRef}
						fear={gameState.fFear}
						fearamid={gameState.fFearamid}
						fearamidAttacking={
							animatingAttackVisualization?.attackSource.kind === 'FEARAMID'
						}
						fearamidRef={fearamidRef}
						gateRef={gateRef}
						healthFarm={gameState.bFarmHealth}
						healthGate={gameState.bGateHealth}
						healthGateMax={gameState.bGateHealthMAX}
						healthMaxFarm={gameState.bFarmHealthMAX}
						healthTower={gameState.bTowerHealth}
						healthTowerMax={gameState.bTowerHealthMAX}
						onCalm={() => {
							gameCalmFear(1)
						}}
						onRepair={(building: BuildingType) => {
							gameRepairBase(building, 1)
						}}
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
							disabled={
								gameState.cCoins < 2 ||
								gameState.commandUsed.refreshCitizens > 0
							}
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
							disabled={
								gameState.cCoins < 1 ||
								gameState.commandUsed.refreshCitizens > 0
							}
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
			{animatingAttackVisualization && (
				<AttackLine
					enemyCards={gameState.eEnemyRow}
					enemyRowMax={gameState.eEnemyRowMax}
					enemySlotsRef={enemySlotsRef}
					farmRef={farmRef}
					fearamidRef={fearamidRef}
					gateRef={gateRef}
					spec={animatingAttackVisualization}
					towerRef={towerRef}
				/>
			)}
			{animatingFloatingText && (
				<FloatingText
					onAnimationEnd={signalAnimationComplete}
					spec={animatingFloatingText}
				/>
			)}
			{animatingHeroToDiscard && (
				<HeroCardToDiscard
					onAnimationEnd={signalAnimationComplete}
					spec={animatingHeroToDiscard}
				/>
			)}
			<GameStatsPanel
				isOpen={showStats}
				onClose={() => {
					setShowStats(false)
				}}
			/>
			<PlayerEnemyCardDialog
				enemyCards={cardDialog?.enemyCards ?? []}
				genericTrashesAvailable={cardDialog?.genericTrashesAvailable}
				isOpen={cardDialog?.isOpen ?? false}
				onClose={() => {
					setCardDialog(prev => (prev ? {...prev, isOpen: false} : prev))
				}}
				onTrashCard={cardDialog?.onTrashCard}
				playerCards={cardDialog?.playerCards ?? []}
				title={cardDialog?.title ?? ''}
			/>
			<GameStatsPanel isOpen={showStats} onClose={() => setShowStats(false)} />
		</div>
	)
}
