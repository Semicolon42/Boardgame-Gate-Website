// ---------------------------------------------------------------------------
// Layer 3: UI/animation orchestration — wires game logic + animation together
// ---------------------------------------------------------------------------
//
// This hook is the single entry point for GameBoard. It wires together:
//   - Layer 1: gameStateReducer (pure state machine)
//   - Layer 2: useSubActionQueue (animated sub-action sequencing)

import {useReducer, useRef} from 'react'
import type {CardPlayHandler, CardPlayType} from '../Cards/XCard'
import {
	type BuildingType,
	gameStateReducer,
	initialState
} from './gameStateReducer'
import {useSubActionQueue} from './useSubActionQueue'

export function useGameActions() {
	const [state, dispatch] = useReducer(gameStateReducer, initialState)

	const deckRef = useRef<HTMLDivElement>(null)
	const discardRef = useRef<HTMLDivElement>(null)
	const villageDeckRef = useRef<HTMLDivElement>(null)

	const {
		enqueue,
		queue,
		signalAnimationComplete,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow
	} = useSubActionQueue(state, dispatch, deckRef, discardRef, villageDeckRef)

	const gameDrawCards = (n: number): void => {
		enqueue([{type: 'ENQ_PLAYER_DRAW_N', count: n}])
	}

	const gameEndTurn = (): void => {
		enqueue([{type: 'ENQ_END_TURN'}])
	}

	const clearActionLogs = (): void => {
		dispatch({type: 'ACTION_LOGS_CLEAR'})
	}

	const gameVillagerRowClear = (cost?: number): void => {
		enqueue([{type: 'ENQ_VILLAGER_ROW_CLEAR', cost}])
	}

	const gameBuyCard = (_cardId: number, cost: number): void => {
		enqueue([{type: 'ENQ_VILLAGER_ROW_BUY_CARD', cardId: _cardId, cost}])
	}

	/** TODO: implement play card logic */
	const playCard: CardPlayHandler = (
		_cardId: number,
		cardPlayType: CardPlayType
	): void => {
		enqueue([{type: 'ENQ_PLAYER_PLAY_CARD', cardId: _cardId, cardPlayType}])
	}

	/** TODO: implement player attack enemy logic */
	const playerAttackEnemy = (_enemyId: number): void => {
		// TODO
	}

	/** TODO: implement player repair building logic */
	const playerRepairBuilding = (_building: BuildingType): void => {
		// TODO
	}

	/** TODO: implement player spend coin logic */
	const playerSpendCoin = (
		_coinAction: 'CALM' | 'ATTACK' | 'REPAIR' | 'REPLACE_BUY_ROW'
	): void => {
		// TODO
	}

	/** TODO: implement enemy attack building logic */
	const enemyAttackBuilding = (_building: BuildingType): void => {
		// TODO
	}

	/** TODO: implement enemy raise fear logic */
	const enemyRaiseFear = (): void => {
		// TODO
	}

	/** TODO: implement trigger fear effect logic */
	const triggerFearEffect = (): void => {
		// TODO
	}

	/** TODO: implement draw new enemy logic */
	const drawNewEnemy = (): void => {
		// TODO
	}

	/** TODO: implement enemy dies logic */
	const enemyDies = (_enemyId: number): void => {
		// TODO
	}

	/** TODO: implement add hero card to discard logic */
	const addHeroCardToDiscard = (): void => {
		// TODO
	}

	return {
		state,
		deckRef,
		discardRef,
		villageDeckRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		signalAnimationComplete,
		gameDrawCards,
		gameEndTurn,
		gameVillagerRowClear,
		gameBuyCard,
		playCard,
		playerAttackEnemy,
		playerRepairBuilding,
		playerSpendCoin,
		enemyAttackBuilding,
		enemyRaiseFear,
		triggerFearEffect,
		drawNewEnemy,
		enemyDies,
		addHeroCardToDiscard,
		clearActionLogs,

		queue
	}
}
