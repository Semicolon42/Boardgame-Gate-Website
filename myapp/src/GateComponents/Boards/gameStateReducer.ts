// ---------------------------------------------------------------------------
// Layer 1: Pure state machine — types, reducer, initial state
// No side effects, no hooks, no randomness (except STACK_SHUFFLE which is
// intentionally kept here but avoided by the action layer for draw logic —
// see useGameStateActions.ts for the rationale).
// ---------------------------------------------------------------------------

import {GetRange} from '../Data/PlayerCards'

// ---------------------------------------------------------------------------
// State & action types
// ---------------------------------------------------------------------------

export interface GameState {
	pDeck: number[]
	pHand: number[]
	pDiscard: number[]
	hDeck: number[]

	vDeck: number[]
	vRow: number[]
	vDiscard: number[]

	cCoins: number
	cCalm: number
	cRepair: number
	cBonusRepair: {type: BuildingType, amount: number}[]
	cAttack: number

	
	actionLogs: GameAction[]
	bGateHealth: number
	bFarmHealth: number
	bTowerHealth: number
}

export type StackType = 'HAND' | 'DECK' | 'DISCARD' | 'VILLAGER_DECK' | 'VILLAGER_ROW' | 'VILLAGER_DISCARD'
export type BuildingType = 'FARM' | 'GATE' | 'TOWER'

export type GameAction =
	| {type: 'STACK_CLEAR_ALL_CARDS'; stack: StackType}
	| {type: 'STACK_SHUFFLE'; stack: StackType}
	| {type: 'STACK_ADD_CARDS'; stack: StackType; cardIds: number[]}
	| {type: 'STACK_REMOVE_CARDS'; stack: StackType; cardIds: number[]}
	| {
			type: 'BUILDING_CHANGE_HEALTH'
			building: BuildingType
			healthChange: number
	  }
	| {type: 'MULTI_ACTION'; actions: GameAction[]}
	| {type: 'ACTION_LOGS_CLEAR'}

// ---------------------------------------------------------------------------
// Reducer helpers
// ---------------------------------------------------------------------------

export type StackKey = 'pHand' | 'pDeck' | 'pDiscard' | 'vDeck' | 'vRow' | 'vDiscard'

export function stackKey(stack: StackType): StackKey {
	switch (stack) {
		case 'HAND':
			return 'pHand'
		case 'DECK':
			return 'pDeck'
		case 'DISCARD':
			return 'pDiscard'
		case 'VILLAGER_DECK':
			return 'vDeck'
		case 'VILLAGER_ROW':
			return 'vRow'
		case 'VILLAGER_DISCARD':
			return 'vDiscard'
	}
}

// ---------------------------------------------------------------------------
// Reducer — pure state transitions only, no side effects
// ---------------------------------------------------------------------------

export function gameStateReducer(
	state: GameState,
	action: GameAction
): GameState {
	const newActionLog = [...state.actionLogs, action]

	switch (action.type) {
		case 'ACTION_LOGS_CLEAR':
			return {
				...state,
				actionLogs: [action]
			}

		case 'STACK_ADD_CARDS': {
			const key = stackKey(action.stack)
			return {
				...state,
				[key]: [...state[key], ...action.cardIds],
				actionLogs: newActionLog
			}
		}

		case 'STACK_REMOVE_CARDS': {
			const key = stackKey(action.stack)
			const toRemove = new Set(action.cardIds)
			return {
				...state,
				[key]: state[key].filter(cid => !toRemove.has(cid)),
				actionLogs: newActionLog
			}
		}

		case 'STACK_SHUFFLE': {
			const key = stackKey(action.stack)
			return {
				...state,
				[key]: [...state[key]].sort(() => Math.random() - 0.5),
				actionLogs: newActionLog
			}
		}

		case 'STACK_CLEAR_ALL_CARDS': {
			const key = stackKey(action.stack)
			return {...state, [key]: [], actionLogs: newActionLog}
		}

		case 'BUILDING_CHANGE_HEALTH': {
			// Fixed: was mutating state directly — now immutable
			switch (action.building) {
				case 'FARM':
					return {
						...state,
						bFarmHealth: state.bFarmHealth + action.healthChange,
						actionLogs: newActionLog
					}
				case 'GATE':
					return {
						...state,
						bGateHealth: state.bGateHealth + action.healthChange,
						actionLogs: newActionLog
					}
				case 'TOWER':
					return {
						...state,
						bTowerHealth: state.bTowerHealth + action.healthChange,
						actionLogs: newActionLog
					}
				default:
					return state
			}
		}

		case 'MULTI_ACTION': {
			let currentState = state
			for (const a of action.actions) {
				currentState = gameStateReducer(currentState, a)
			}
			return {
				...currentState,
				actionLogs: newActionLog
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Initial state & constants
// ---------------------------------------------------------------------------

export const HAND_SIZE = 3

export const initialState: GameState = {
	pDeck: [1, 2, 3],
	pHand: [],
	pDiscard: [],
	hDeck: GetRange('HERO').sort(() => 0.5 - Math.random()),
	vDeck: GetRange('VILLAGER').sort(() => 0.5 - Math.random()),
	vRow: GetRange('VILLAGER')
		.sort(() => 0.5 - Math.random())
		.slice(-4),
	vDiscard: [],

	bFarmHealth: 6,
	bTowerHealth: 6,
	bGateHealth: 12,

	cCoins: 0,
	cRepair: 0,
	cBonusRepair: [],
	cCalm: 0,
	cAttack: 0,

	actionLogs: [],
}
