import {WaButton, WaDialog, WaIcon} from '@awesome.me/webawesome/dist/react'
import {useState, type RefObject} from 'react'
import {PlayerEnemyCardDialog} from '../CardDialogs/PlayerCardDialog'
import {CardSlot} from '../Cards/CardSlot'
import {FloatingText} from '../Cards/FloatingText'
import {HeroCardToDiscard} from '../Cards/HeroCardToDiscard'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {ValueBadge} from '../UIComponents/ValueBadge'
import {AttackLine} from './AttackLine'
import {
	type BuildingType,
	type CardInstance,
	type EnemyCardInstance,
	makeEnemyCardInstances
} from './gameStateReducer'
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

	const [cardDialog, setCardDialog] = useState<
		| {
				title: string
				playerCards: CardInstance[]
				enemyCards: EnemyCardInstance[]
		  }
		| undefined
	>(undefined)

	const onViewEnemyDeck = () => {
		const temp = makeEnemyCardInstances([1, 2, 3, 4, 5, 6, 7, 8, 9])
		setCardDialog({
			title: 'Enemy Deck',
			playerCards: [],
			enemyCards: temp
		})
	}
	const onViewHeroDeck = () => {
		setCardDialog({
			title: 'Hero Deck',
			playerCards: gameState.hDeck,
			enemyCards: []
		})
	}

	const classNameStackTitle = 'absolute top-1 text-lg text-(--color-card-text)'

	function VillagerDeck(props: {vDeck: CardInstance[], vDiscard: CardInstance[], villageDeckRef: RefObject<HTMLDivElement | null>}) {
		const {vDeck, vDiscard, villageDeckRef} = props
		return (
			<div
				className='relative flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'
				onClick={() => {
					setCardDialog({
						title: 'Villager Deck',
						playerCards: [...vDeck, ...vDiscard],
						enemyCards: []
					})
				}}
				ref={villageDeckRef}
				role='button'
			>
				<div className={classNameStackTitle}>Village</div>
				<WaIcon className='text-6xl' name='dungeon' variant='classic' />
			</div>
		)
	}

	function PlayerDiscard(props: {discard: CardInstance[], discardRef: RefObject<HTMLDivElement | null>}) {
		const {discard, discardRef} = props
		if (discard.length > 0) { 
			return (
				<div
					className='relative flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-face) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'
					onClick={() => {
						setCardDialog({
							title: 'Player Discard',
							playerCards: discard,
							enemyCards: []
						})
					}}
					ref={discardRef}
					role='button'
				>
					<div className={classNameStackTitle}>Discard</div>
				</div>
			)
		}
		return ( 
			<CardSlot ref={discardRef} title='Discard' />
		)
	}

	function PlayerDeck(props: {deck: CardInstance[], deckRef: RefObject<HTMLDivElement | null>, mayDrawCards: number, onDrawBonusCard: () => void}) {
		const {deck, deckRef, mayDrawCards, onDrawBonusCard} = props

		if (!deck?.length) return <CardSlot ref={deckRef} title='Deck' />

		const containerClass = 'relative flex flex-col h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'

		if (mayDrawCards > 0) {
			return (
				<div className={containerClass} ref={deckRef}>
					{/* Top half — open deck dialog */}
					<div
						className='absolute top-0 left-0 right-0 h-1/2 z-10'
						onClick={() => setCardDialog({title: 'Player Deck', playerCards: deck, enemyCards: []})}
						role='button'
					/>
					{/* Bottom half — draw bonus card; named peer drives text highlight */}
					<div
						className='peer/bottom absolute bottom-0 left-0 right-0 h-1/2 z-10'
						onClick={onDrawBonusCard}
						role='button'
					/>
					<div className={classNameStackTitle}>Deck</div>
					<WaIcon className='text-6xl' name='dungeon' variant='classic' />
					<div className='absolute bottom-1 w-full text-center text-xs peer-hover/bottom:font-bold pointer-events-none'>
						May Draw {mayDrawCards}
					</div>
				</div>
			)
		}

		return (
			<div
				className={containerClass}
				onClick={() => setCardDialog({title: 'Player Deck', playerCards: deck, enemyCards: []})}
				ref={deckRef}
				role='button'
			>
				<div className={classNameStackTitle}>Deck</div>
				<WaIcon className='text-6xl' name='dungeon' variant='classic' />
			</div>
		)
	}

	return (
		<div className='flex bg-(--color-gameboard-background)'>
			<div className='flex h-max'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					<VillagerDeck vDeck={gameState.vDeck} vDiscard={gameState.vDiscard} villageDeckRef={villageDeckRef}/>
					<PlayerDiscard discard={gameState?.pDiscard} discardRef={discardRef}/>
					<PlayerDeck 
						deck={gameState?.pDeck} 
						deckRef={deckRef} 
						mayDrawCards={gameState.activeEffects.mayDrawCards ?? 0} 
						onDrawBonusCard={()=>{gameDrawCards(1, true)}}
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
				<div className='flex-1'>
					{queue.map(it => {
						return (
							<div className='bg-cyan-400' key={crypto.randomUUID()}>
								{JSON.stringify(it)}
							</div>
						)
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
			<PlayerEnemyCardDialog
				enemyCards={cardDialog?.enemyCards ?? []}
				isOpen={cardDialog !== undefined}
				onClose={() => {
					setCardDialog(undefined)
				}}
				playerCards={cardDialog?.playerCards ?? []}
				title={cardDialog?.title ?? ''}
			/>
		</div>
	)
}
