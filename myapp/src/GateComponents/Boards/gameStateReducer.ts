// ---------------------------------------------------------------------------
// Layer 1: Pure state machine — types, reducer, initial state
// No side effects, no hooks, no randomness (except STACK_SHUFFLE which is
// intentionally kept here but avoided by the action layer for draw logic —
// see useGameStateActions.ts for the rationale).
// ---------------------------------------------------------------------------

import type {CardPlayType} from '../Cards/XCard'
import {getEnemyCard, type IEnemyCard} from '../Data/EnemyCardsData'
import {GetRange} from '../Data/PlayerCards'

// ---------------------------------------------------------------------------
// Card instance — separates physical card identity from card type info
// ---------------------------------------------------------------------------

export interface EnemyCardInstance {
	instanceId: string
	cardId: number
	health: number
}

/** A single physical card in play. instanceId is the React key / identity;
 *  typeId is passed to getCitizenCard() to look up stats. */
export interface CardInstance {
	instanceId: string
	cardId: number
}

/** Wraps a list of typeIds as fresh CardInstances with unique instanceIds. */
export function makeCardInstances(cardIds: number[]): CardInstance[] {
	return cardIds.map(cardId => ({instanceId: crypto.randomUUID(), cardId}))
}

/** Wraps a list of entries as fresh EnemyCardInstances with unique instanceIds. */
export function makeEnemyCardInstances(
	enemyCardIds: number[]
): EnemyCardInstance[] {
	return enemyCardIds.flatMap(enemyCardId => {
		const enemyInfo: IEnemyCard = getEnemyCard(enemyCardId)
		const enemyInstance: EnemyCardInstance = {
			instanceId: crypto.randomUUID(),
			cardId: enemyCardId,
			health: enemyInfo.health
		}
		return enemyInstance
	})
}

// ---------------------------------------------------------------------------
// State & action types
// ---------------------------------------------------------------------------

export interface GameState {
	pDeck: CardInstance[]
	pHand: CardInstance[]
	pPlayed: {[key: string]: CardPlayType | undefined}
	pDiscard: CardInstance[]
	hDeck: CardInstance[]

	eEnemyDeck: EnemyCardInstance[]
	eEnemyRow: EnemyCardInstance[]
	eEnemyDiscard: EnemyCardInstance[]
	eEnemyRowMax: number

	vDeck: CardInstance[]
	vRow: CardInstance[]
	vDiscard: CardInstance[]

	cCoins: number
	cCalm: number
	cRepair: number
	cBonusRepairFarm: number
	cBonusRepairGate: number
	cBonusRepairTower: number
	cAttack: number

	actionLogs: GameAction[]
	bGateHealth: number
	bFarmHealth: number
	bTowerHealth: number
}

export type StackType =
	| 'HAND'
	| 'DECK'
	| 'DISCARD'
	| 'VILLAGER_DECK'
	| 'VILLAGER_ROW'
	| 'VILLAGER_DISCARD'
export type BuildingType = 'farm' | 'gate' | 'tower' | 'all'

export type GameAction =
	| {type: 'STACK_CLEAR_ALL_CARDS'; stack: StackType}
	| {type: 'STACK_SHUFFLE'; stack: StackType}
	| {type: 'STACK_ADD_CARDS'; stack: StackType; cards: CardInstance[]}
	| {type: 'STACK_REMOVE_CARDS'; stack: StackType; instanceIds: string[]}
	| {
			type: 'BUILDING_CHANGE_HEALTH'
			building: BuildingType
			healthChange: number
	  }
	| {
			type: 'UPADTE_RESOURCES'
			coins?: number
			attack?: number
			repair?: number
			calm?: number
			bonusRepairFarm?: number
			bonusRepairGate?: number
			bonusRepairTower?: number
	  }
	| {
			type: 'MARK_CARD_PLAYED'
			instanceId: string
			cardPlayType: CardPlayType | undefined
	  }
	| {type: 'CLEAR_PLAYED_CARDS'}
	| {type: 'MULTI_ACTION'; actions: GameAction[]}
	| {type: 'ACTION_LOGS_CLEAR'}
	| {type: 'ENEMY_DECK_REMOVE_CARD'; instanceId: string}
	| {type: 'ENEMY_ROW_ADD_CARD'; card: EnemyCardInstance}
	| {type: 'ENEMY_ROW_DISCARD_OLDEST'}
	| {type: 'ENEMY_ROW_DISCARD_INSTANCE'; uuid: string}

// ---------------------------------------------------------------------------
// Reducer helpers
// ---------------------------------------------------------------------------

export type StackKey =
	| 'pHand'
	| 'pDeck'
	| 'pDiscard'
	| 'vDeck'
	| 'vRow'
	| 'vDiscard'

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
		default: {
			const _exhaustive: never = stack
			throw new Error(`Unknown stack: ${_exhaustive}`)
		}
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
				[key]: [...state[key], ...action.cards],
				actionLogs: newActionLog
			}
		}

		case 'STACK_REMOVE_CARDS': {
			const key = stackKey(action.stack)
			const toRemove = new Set(action.instanceIds)
			return {
				...state,
				[key]: state[key].filter(
					(c: CardInstance) => !toRemove.has(c.instanceId)
				),
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
				case 'farm':
					return {
						...state,
						bFarmHealth: state.bFarmHealth + action.healthChange,
						actionLogs: newActionLog
					}
				case 'gate':
					return {
						...state,
						bGateHealth: state.bGateHealth + action.healthChange,
						actionLogs: newActionLog
					}
				case 'tower':
					return {
						...state,
						bTowerHealth: state.bTowerHealth + action.healthChange,
						actionLogs: newActionLog
					}
				default:
					return state
			}
		}

		case 'UPADTE_RESOURCES': {
			return {
				...state,
				cCoins: state.cCoins + (action.coins ?? 0),
				cAttack: state.cAttack + (action.attack ?? 0),
				cRepair: state.cRepair + (action.repair ?? 0),
				cCalm: state.cCalm + (action.calm ?? 0),
				cBonusRepairFarm:
					state.cBonusRepairFarm + (action.bonusRepairFarm ?? 0),
				cBonusRepairGate:
					state.cBonusRepairGate + (action.bonusRepairGate ?? 0),
				cBonusRepairTower:
					state.cBonusRepairTower + (action.bonusRepairTower ?? 0),
				actionLogs: newActionLog
			}
		}

		case 'MARK_CARD_PLAYED': {
			return {
				...state,
				pPlayed: {...state.pPlayed, [action.instanceId]: action.cardPlayType},
				actionLogs: newActionLog
			}
		}

		case 'CLEAR_PLAYED_CARDS': {
			return {
				...state,
				pPlayed: {},
				actionLogs: newActionLog
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

		case 'ENEMY_DECK_REMOVE_CARD': {
			return {
				...state,
				eEnemyDeck: state.eEnemyDeck.filter(
					c => c.instanceId !== action.instanceId
				),
				actionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_ADD_CARD': {
			return {
				...state,
				eEnemyRow: [...state.eEnemyRow, action.card],
				actionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_DISCARD_INSTANCE': {
			const discard = state.eEnemyRow.filter(e => e.instanceId === action.uuid)
			if (discard === undefined || discard.length > 1)
				return {...state, actionLogs: newActionLog}
			return {
				...state,
				eEnemyRow: state.eEnemyRow.filter(e => e.instanceId !== action.uuid),
				eEnemyDiscard: discard[0]
					? [...state.eEnemyDiscard, discard[0]]
					: state.eEnemyDiscard,
				actionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_DISCARD_OLDEST': {
			const oldest = state.eEnemyRow[0]
			if (oldest === undefined) return {...state, actionLogs: newActionLog}
			return {
				...state,
				eEnemyRow: state.eEnemyRow.slice(1),
				eEnemyDiscard: [...state.eEnemyDiscard, oldest],
				actionLogs: newActionLog
			}
		}

		default:
			return {
				...state,
				actionLogs: newActionLog
			}
	}
}

// ---------------------------------------------------------------------------
// Initial state & constants
// ---------------------------------------------------------------------------

export const HAND_SIZE = 3

export const initialState: GameState = {
	pDeck: makeCardInstances([1, 2, 3]),
	pHand: [],
	pPlayed: {},
	pDiscard: [],
	hDeck: makeCardInstances(GetRange('HERO').sort(() => 0.5 - Math.random())),
	vDeck: makeCardInstances(
		GetRange('VILLAGER').sort(() => 0.5 - Math.random())
	),

	eEnemyDeck: makeEnemyCardInstances([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
	eEnemyRow: [],
	eEnemyDiscard: [],
	eEnemyRowMax: 2,

	vRow: makeCardInstances(
		GetRange('VILLAGER')
			.sort(() => 0.5 - Math.random())
			.slice(-4)
	),
	vDiscard: [],

	bFarmHealth: 6,
	bTowerHealth: 6,
	bGateHealth: 12,

	cCoins: 0,
	cRepair: 0,
	cBonusRepairFarm: 0,
	cBonusRepairGate: 0,
	cBonusRepairTower: 0,
	cCalm: 0,
	cAttack: 0,

	actionLogs: []
}
