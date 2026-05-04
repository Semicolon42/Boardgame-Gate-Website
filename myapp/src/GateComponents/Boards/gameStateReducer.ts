// ---------------------------------------------------------------------------
// Layer 1: Pure state machine — types, reducer, initial state
// No side effects, no hooks, no randomness (except STACK_SHUFFLE which is
// intentionally kept here but avoided by the action layer for draw logic —
// see useGameStateActions.ts for the rationale).
// ---------------------------------------------------------------------------

import type {CardPlayType} from '../Cards/XCard'
import {getEnemyCard, type IEnemyCard} from '../Data/EnemyCardsData'

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

export type FearAction =
	| 'DRAW_HERO'
	| 'DAMAGE_FARM'
	| 'DAMAGE_GATE'
	| 'DAMAGE_TOWER'
	| 'NONE'
	| 'GAMEOVER'

// ---------------------------------------------------------------------------
// State & action types
// ---------------------------------------------------------------------------

export interface ActiveEffects {
	multNextPlayedResource?:
		| Partial<{coins?: number; repair?: number; calm?: number; attack?: number}>
		| undefined
	mayTrashCardsFromDiscard?: number | undefined
	mayDrawCards?: number
}

export interface CommandUsedType {
	attack: number
	refreshCitizens: number
	repair: number
	calm: number
}

export interface GameState {
	gameOutcome: GameOutcomeType | undefined
	stateActionLogs: GameAction[]

	// Game State
	bGateHealth: number
	bFarmHealth: number
	bTowerHealth: number
	bGateHealthMAX: number
	bFarmHealthMAX: number
	bTowerHealthMAX: number
	fFear: number
	fFearMax: number
	fFearamid: FearAction[]

	commandUsed: CommandUsedType

	// Player card state
	pDeck: CardInstance[]
	pHand: CardInstance[]
	pPlayed: {[key: string]: CardPlayType | undefined}
	pDiscard: CardInstance[]
	hDeck: CardInstance[]
	hDeckRemaining: number

	// Enemy cards state
	eEnemyDeck: EnemyCardInstance[]
	eEnemyRow: EnemyCardInstance[]
	eEnemyDiscard: EnemyCardInstance[]
	eEnemyRowMax: number

	// Citizen Cards State
	vDeck: CardInstance[]
	vRow: CardInstance[]
	vDiscard: CardInstance[]

	// Current resources State
	cCoins: number
	cCalm: number
	cRepair: number
	cBonusRepairFarm: number
	cBonusRepairGate: number
	cBonusRepairTower: number
	cAttack: number

	// Building bonus stats
	bTowerBonusMinHealth: number
	bTowerBonusDamageCurrent: number
	bTowerBonusDamage: number
	bFarmBonusMinHealth: number
	bFarmBonusRecruit: number
	bFarmBonusRecruitCurrent: number

	activeEffects: Partial<ActiveEffects>
}

export type StackType =
	| 'HAND'
	| 'DECK'
	| 'DISCARD'
	| 'HERO_DECK'
	| 'VILLAGER_DECK'
	| 'VILLAGER_ROW'
	| 'VILLAGER_DISCARD'
export type BuildingType = 'farm' | 'gate' | 'tower'

export type GameOutcomeType = 'WIN' | 'LOSS'

export type GameAction =
	| {type: 'STACK_CLEAR_ALL_CARDS'; stack: StackType}
	| {type: 'STACK_ADD_CARDS'; stack: StackType; cards: CardInstance[]}
	| {type: 'STACK_REMOVE_CARDS'; stack: StackType; instanceIds: string[]}
	| {
			type: 'BUILDING_CHANGE_HEALTH'
			building: BuildingType
			healthChange: number
	  }
	| {
			type: 'CHANGE_FEAR'
			amount: number
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
			towerBonusDmaageCurrent?: number
			farmBonusRecruitCurrent?: number
	  }
	| {
			type: 'MARK_CARD_PLAYED'
			instanceId: string
			cardPlayType: CardPlayType | undefined
	  }
	| {type: 'MARK_CARD_PLAYED_REMOVE'; instanceId: string}
	| {type: 'CLEAR_PLAYED_CARDS'}
	| {type: 'MULTI_ACTION'; actions: GameAction[]}
	| {type: 'ACTION_LOGS_CLEAR'}
	| {type: 'ENEMY_DECK_REMOVE_CARD'; instanceId: string}
	| {type: 'ENEMY_ROW_ADD_CARD'; card: EnemyCardInstance}
	| {type: 'ENEMY_ROW_DISCARD_OLDEST'}
	| {type: 'ENEMY_ROW_DISCARD_INSTANCE'; uuid: string}
	| {type: 'UPDATE_GAME_OUTCOME'; outcome: GameOutcomeType}
	| {type: 'ENEMY_DAMAGE'; damage: number; targetInstanceId: string}
	| {type: 'TURN_START_RESET'}
	| {type: 'SET_GAME_STATE'; nextState: GameState}
	| {type: 'UPDATE_ACTIVE_EFFECTS'; effects: Partial<ActiveEffects>}
	| {type: 'ADD_ACTIVE_EFFECTS'; effects: Partial<ActiveEffects>}
	| {type: 'COMMANG_USED'; commandType: Partial<CommandUsedType>}

// ---------------------------------------------------------------------------
// Reducer helpers
// ---------------------------------------------------------------------------

export type StackKey =
	| 'pHand'
	| 'pDeck'
	| 'pDiscard'
	| 'hDeck'
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
		case 'HERO_DECK':
			return 'hDeck'
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
	const newActionLog = [...state.stateActionLogs, action]

	switch (action.type) {
		case 'UPDATE_GAME_OUTCOME': {
			return {
				...state,
				gameOutcome: action.outcome,
				stateActionLogs: newActionLog
			}
		}

		case 'ACTION_LOGS_CLEAR':
			return {
				...state,
				stateActionLogs: [action]
			}

		case 'STACK_ADD_CARDS': {
			const key = stackKey(action.stack)
			return {
				...state,
				[key]: [...state[key], ...action.cards],
				...(action.stack === 'HERO_DECK'
					? {hDeckRemaining: state.hDeckRemaining + action.cards.length}
					: {}),
				stateActionLogs: newActionLog
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
				...(action.stack === 'HERO_DECK'
					? {hDeckRemaining: state.hDeckRemaining - action.instanceIds.length}
					: {}),
				stateActionLogs: newActionLog
			}
		}

		case 'COMMANG_USED': {
			const newCommandUsed = {
				attack: state.commandUsed.attack + (action.commandType.attack ?? 0),
				repair: state.commandUsed.repair + (action.commandType.repair ?? 0),
				calm: state.commandUsed.calm + (action.commandType.calm ?? 0),
				refreshCitizens:
					state.commandUsed.refreshCitizens +
					(action.commandType.refreshCitizens ?? 0)
			}

			return {
				...state,
				commandUsed: newCommandUsed,
				stateActionLogs: newActionLog
			}
		}

		case 'STACK_CLEAR_ALL_CARDS': {
			const key = stackKey(action.stack)
			return {...state, [key]: [], stateActionLogs: newActionLog}
		}

		case 'CHANGE_FEAR': {
			return {
				...state,
				fFear: state.fFear + action.amount,
				stateActionLogs: newActionLog
			}
		}

		case 'BUILDING_CHANGE_HEALTH': {
			switch (action.building) {
				case 'farm':
					return {
						...state,
						bFarmHealth: Math.max(
							0,
							Math.min(
								state.bFarmHealth + action.healthChange,
								state.bFarmHealthMAX
							)
						),
						stateActionLogs: newActionLog
					}
				case 'gate':
					return {
						...state,
						bGateHealth: Math.max(
							0,
							Math.min(
								state.bGateHealth + action.healthChange,
								state.bGateHealthMAX
							)
						),
						stateActionLogs: newActionLog
					}
				case 'tower':
					return {
						...state,
						bTowerHealth: Math.max(
							0,
							Math.min(
								state.bTowerHealth + action.healthChange,
								state.bTowerHealthMAX
							)
						),
						stateActionLogs: newActionLog
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
				bFarmBonusRecruitCurrent:
					state.bFarmBonusRecruitCurrent +
					(action.farmBonusRecruitCurrent ?? 0),
				bTowerBonusDamageCurrent:
					state.bTowerBonusDamageCurrent +
					(action.towerBonusDmaageCurrent ?? 0),
				stateActionLogs: newActionLog
			}
		}

		case 'MARK_CARD_PLAYED': {
			return {
				...state,
				pPlayed: {...state.pPlayed, [action.instanceId]: action.cardPlayType},
				stateActionLogs: newActionLog
			}
		}

		case 'MARK_CARD_PLAYED_REMOVE': {
			if (!(action.instanceId in state.pPlayed))
				return {...state, stateActionLogs: newActionLog}
			const {[action.instanceId]: _, ...newPPlayed} = state.pPlayed
			return {
				...state,
				pPlayed: newPPlayed,
				stateActionLogs: newActionLog
			}
		}

		case 'CLEAR_PLAYED_CARDS': {
			return {
				...state,
				pPlayed: {},
				stateActionLogs: newActionLog
			}
		}

		case 'MULTI_ACTION': {
			let currentState = state
			for (const a of action.actions) {
				currentState = gameStateReducer(currentState, a)
			}
			return {
				...currentState,
				stateActionLogs: newActionLog
			}
		}

		case 'ENEMY_DECK_REMOVE_CARD': {
			return {
				...state,
				eEnemyDeck: state.eEnemyDeck.filter(
					c => c.instanceId !== action.instanceId
				),
				stateActionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_ADD_CARD': {
			return {
				...state,
				eEnemyRow: [...state.eEnemyRow, action.card],
				stateActionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_DISCARD_INSTANCE': {
			const discard = state.eEnemyRow.filter(e => e.instanceId === action.uuid)
			if (discard === undefined || discard.length > 1)
				return {...state, stateActionLogs: newActionLog}
			return {
				...state,
				eEnemyRow: state.eEnemyRow.filter(e => e.instanceId !== action.uuid),
				eEnemyDiscard: discard[0]
					? [...state.eEnemyDiscard, discard[0]]
					: state.eEnemyDiscard,
				stateActionLogs: newActionLog
			}
		}

		case 'ENEMY_ROW_DISCARD_OLDEST': {
			const oldest = state.eEnemyRow[0]
			if (oldest === undefined) return {...state, stateActionLogs: newActionLog}
			return {
				...state,
				eEnemyRow: state.eEnemyRow.slice(1),
				eEnemyDiscard: [...state.eEnemyDiscard, oldest],
				stateActionLogs: newActionLog
			}
		}

		case 'ENEMY_DAMAGE': {
			const newEnemyRow = state.eEnemyRow.map(e => {
				if (e.instanceId === action.targetInstanceId) {
					return {
						...e,
						health: e.health - action.damage
					}
				}
				return e
			})
			return {
				...state,
				eEnemyRow: newEnemyRow,
				stateActionLogs: newActionLog
			}
		}

		case 'TURN_START_RESET': {
			return {
				...state,
				bFarmBonusRecruitCurrent:
					state.bFarmHealth > state.bFarmBonusMinHealth
						? state.bFarmBonusRecruit
						: 0,
				bTowerBonusDamageCurrent:
					state.bTowerHealth > state.bTowerBonusMinHealth
						? state.bTowerBonusDamage
						: 0,
				activeEffects: {
					...state.activeEffects,
					mayDrawCards: 0,
					mayTrashCardsFromDiscard: 0,
					multNextPlayedResource: {}
				},
				commandUsed: {
					attack: 0,
					calm: 0,
					refreshCitizens: 0,
					repair: 0
				},
				stateActionLogs: newActionLog
			}
		}

		case 'SET_GAME_STATE': {
			return {
				...state,
				...action.nextState,
				stateActionLogs: newActionLog
			}
		}

		case 'UPDATE_ACTIVE_EFFECTS': {
			return {
				...state,
				activeEffects: {...state.activeEffects, ...action.effects},
				stateActionLogs: newActionLog
			}
		}

		case 'ADD_ACTIVE_EFFECTS': {
			const cur = state.activeEffects
			const inc = action.effects
			const mult = inc.multNextPlayedResource
			return {
				...state,
				activeEffects: {
					...cur,
					...(inc.mayDrawCards !== undefined
						? {mayDrawCards: (cur.mayDrawCards ?? 0) + inc.mayDrawCards}
						: {}),
					...(mult !== undefined
						? {
								multNextPlayedResource: {
									...cur.multNextPlayedResource,
									...(mult.coins !== undefined
										? {
												coins:
													(cur.multNextPlayedResource?.coins ?? 1) * mult.coins
											}
										: {}),
									...(mult.repair !== undefined
										? {
												repair:
													(cur.multNextPlayedResource?.repair ?? 1) *
													mult.repair
											}
										: {}),
									...(mult.calm !== undefined
										? {
												calm:
													(cur.multNextPlayedResource?.calm ?? 1) * mult.calm
											}
										: {}),
									...(mult.attack !== undefined
										? {
												attack:
													(cur.multNextPlayedResource?.attack ?? 1) *
													mult.attack
											}
										: {})
								}
							}
						: {}),
					...(inc.mayTrashCardsFromDiscard !== undefined
						? {
								mayTrashCardsFromDiscard:
									(cur?.mayTrashCardsFromDiscard ?? 0) +
									(inc?.mayTrashCardsFromDiscard ?? 0)
							}
						: {})
				},
				stateActionLogs: newActionLog
			}
		}

		default:
			return {
				...state,
				stateActionLogs: newActionLog
			}
	}
}

// ---------------------------------------------------------------------------
// Initial state & constants
// ---------------------------------------------------------------------------

export const HAND_SIZE = 3

// Placeholder state — immediately replaced by ENQ_GAME_SETUP_NORMAL on first render.
// No Math.random() here; all game randomness is seeded through GameRng.
export const initialState: GameState = {
	bFarmHealth: 6,
	bTowerHealth: 6,
	bGateHealth: 12,
	bFarmHealthMAX: 6,
	bTowerHealthMAX: 6,
	bGateHealthMAX: 12,
	fFear: 0,
	fFearMax: 9,
	fFearamid: [
		'NONE',
		'DRAW_HERO',
		'DAMAGE_FARM',
		'DRAW_HERO',
		'DAMAGE_TOWER',
		'DRAW_HERO',
		'NONE',
		'DAMAGE_GATE',
		'DAMAGE_GATE',
		'GAMEOVER'
	],
	commandUsed: {
		attack: 0,
		calm: 0,
		refreshCitizens: 0,
		repair: 0
	},

	gameOutcome: undefined,

	pDeck: [],
	pHand: [],
	pPlayed: {},
	pDiscard: [],
	hDeck: [],
	hDeckRemaining: 0,
	vDeck: [],

	eEnemyDeck: [],
	eEnemyRow: [],
	eEnemyDiscard: [],
	eEnemyRowMax: 2,

	vRow: [],
	vDiscard: [],

	cCoins: 0,
	cRepair: 0,
	cBonusRepairFarm: 0,
	cBonusRepairGate: 0,
	cBonusRepairTower: 0,
	cCalm: 0,
	cAttack: 0,

	bTowerBonusMinHealth: 1,
	bTowerBonusDamage: 1,
	bTowerBonusDamageCurrent: 1,
	bFarmBonusMinHealth: 1,
	bFarmBonusRecruit: 1,
	bFarmBonusRecruitCurrent: 1,

	activeEffects: {},

	stateActionLogs: []
}
