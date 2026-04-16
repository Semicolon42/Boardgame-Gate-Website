import {GetEnemyCardRange} from '@/GateComponents/Data/EnemyCardsData'
import {GetRange as GetPlayerCardRange} from '@/GateComponents/Data/PlayerCards'
import {
	type FearAction,
	type GameState,
	makeCardInstances,
	makeEnemyCardInstances
} from '../gameStateReducer'
import type {
	AtomicHandler,
	AttackSource,
	Expander,
	SubActionType
} from './types'

function fearActionToSubActions(fearAction: FearAction): SubActionType[] {
	switch (fearAction) {
		case 'DRAW_HERO':
			return [{type: 'HERO_DECK_DRAW_TO_DISCARD'}]
		case 'DAMAGE_FARM':
			return [
				{
					type: 'EXECUTE_GAME_STATE_UPDATE',
					gameStateAction: {
						type: 'BUILDING_CHANGE_HEALTH',
						building: 'farm',
						healthChange: -1
					}
				},
				{
					type: 'SHOW_FLOATING_TEXT',
					text: '-1',
					color: 'var(--color-text-damage)',
					target: {kind: 'BUILDING_FARM'},
					attackSource: {kind: 'FEARAMID'} satisfies AttackSource
				}
			]
		case 'DAMAGE_GATE':
			return [
				{
					type: 'EXECUTE_GAME_STATE_UPDATE',
					gameStateAction: {
						type: 'BUILDING_CHANGE_HEALTH',
						building: 'gate',
						healthChange: -1
					}
				},
				{
					type: 'SHOW_FLOATING_TEXT',
					text: '-1',
					color: 'var(--color-text-damage)',
					target: {kind: 'BUILDING_GATE'},
					attackSource: {kind: 'FEARAMID'} satisfies AttackSource
				}
			]
		case 'DAMAGE_TOWER':
			return [
				{
					type: 'EXECUTE_GAME_STATE_UPDATE',
					gameStateAction: {
						type: 'BUILDING_CHANGE_HEALTH',
						building: 'tower',
						healthChange: -1
					}
				},
				{
					type: 'SHOW_FLOATING_TEXT',
					text: '-1',
					color: 'var(--color-text-damage)',
					target: {kind: 'BUILDING_TOWER'},
					attackSource: {kind: 'FEARAMID'} satisfies AttackSource
				}
			]
		case 'NONE':
			return []
		case 'GAMEOVER':
			return [
				{
					type: 'EXECUTE_GAME_STATE_UPDATE',
					gameStateAction: {type: 'UPDATE_GAME_OUTCOME', outcome: 'LOSS'}
				}
			]
		default: {
			const _exhaustive: never = fearAction
			throw new Error(`Unknown fear action: ${_exhaustive}`)
		}
	}
}

export const expanders: Partial<Record<SubActionType['type'], Expander>> = {
	ENQ_GAME_SETUP_NORMAL: (_action, _state: GameState): SubActionType[] => {
		const starterPlayerDeck = makeCardInstances([1, 2, 3])
		const startingVillagerDeck = makeCardInstances(
			GetPlayerCardRange('VILLAGER').sort(() => 0.5 - Math.random())
		)
		const startingHeroDeck = makeCardInstances(
			GetPlayerCardRange('HERO').sort(() => 0.5 - Math.random())
		)
		const startingEnemeyDeck = makeEnemyCardInstances([
			...GetEnemyCardRange('L1').sort(() => 0.5 - Math.random()),
			...GetEnemyCardRange('L2').sort(() => 0.5 - Math.random()),
			...GetEnemyCardRange('L3').sort(() => 0.5 - Math.random())
		])
		const newState: GameState = {
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

			gameOutcome: undefined,

			pDeck: starterPlayerDeck,
			pHand: [],
			pPlayed: {},
			pDiscard: [],
			hDeck: startingHeroDeck,
			hDeckRemaining: startingHeroDeck.length,
			vDeck: startingVillagerDeck,

			eEnemyDeck: startingEnemeyDeck,
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
		return [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'SET_GAME_STATE',
					nextState: newState
				}
			}
		]
	},
	ENQ_GAME_START: (_action, _state: GameState): SubActionType[] => {
		return [
			// Prepare the player starter deck
			// Prepare the village deck
			// Prepare the enemy deck
			// Draw the enemy card
			{type: 'ENQ_ENEMY_DRAW_SINGLE_CARD'},
			{type: 'ENQ_VILLAGER_ROW_FILL'},
			// Draw the player's first cards
			{type: 'ENQ_PLAYER_DRAW_N', count: 3}
		]
	},
	ENQ_GAME_END_TURN: (_action, state: GameState): SubActionType[] => [
		{type: 'ENQ_ENEMY_TURN'},
		...state.pHand
			.map<SubActionType>(card => ({type: 'PLAYER_DISCARD_SINGLE_CARD', card}))
			.reverse(),
		{
			type: 'EXECUTE_GAME_STATE_UPDATE',
			gameStateAction: {
				type: 'UPADTE_RESOURCES',
				coins: -state.cCoins,
				attack: -state.cAttack,
				repair: -state.cRepair,
				bonusRepairFarm: -state.cBonusRepairFarm,
				bonusRepairGate: -state.cBonusRepairGate,
				bonusRepairTower: -state.cBonusRepairTower,
				calm: -state.cCalm
			}
		},
		{
			type: 'EXECUTE_GAME_STATE_UPDATE',
			gameStateAction: {type: 'CLEAR_PLAYED_CARDS'}
		},
		{
			type: 'EXECUTE_GAME_STATE_UPDATE',
			gameStateAction: {
				type: 'TURN_START_RESET'
			}
		},
		{type: 'ENQ_PLAYER_DRAW_N', count: 3}
	],
	ENQ_ADD_FEAR: (action, state: GameState): SubActionType[] => {
		const {attackSource} = action as Extract<
			SubActionType,
			{type: 'ENQ_ADD_FEAR'}
		>
		const oldFear = state.fFear
		const newFear = Math.min(oldFear + 1, state.fFearMax)
		if (newFear === oldFear) return []
		const result: SubActionType[] = [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {type: 'CHANGE_FEAR', amount: 1}
			},
			{
				type: 'SHOW_FLOATING_TEXT',
				text: '+1',
				color: 'var(--color-text-damage)',
				target: {kind: 'FEARAMID'},
				attackSource
			}
		]
		const fearAction = state.fFearamid[newFear]
		if (fearAction !== undefined)
			result.push(...fearActionToSubActions(fearAction))
		if (newFear >= state.fFearMax) {
			result.push({
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {type: 'UPDATE_GAME_OUTCOME', outcome: 'LOSS'}
			})
		}
		return result
	},
	ENQ_GAME_OVER: (_action, _state: GameState): SubActionType[] => {
		return [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {type: 'UPDATE_GAME_OUTCOME', outcome: 'WIN'}
			}
		]
	}
}

export const atomicHandlers: Partial<
	Record<SubActionType['type'], AtomicHandler>
> = {
	EXECUTE_GAME_STATE_UPDATE: (action, ctx) => {
		const {gameStateAction} = action as Extract<
			SubActionType,
			{type: 'EXECUTE_GAME_STATE_UPDATE'}
		>
		ctx.dispatch(gameStateAction)
		ctx.setQueue(q => q.slice(1))
	},
	SHOW_FLOATING_TEXT: (action, ctx) => {
		const {text, color, target, attackSource} = action as Extract<
			SubActionType,
			{type: 'SHOW_FLOATING_TEXT'}
		>
		let rect: DOMRect | undefined
		switch (target.kind) {
			case 'ENEMY_CARD': {
				const idx = ctx.currentState.eEnemyRow.findIndex(
					c => c.instanceId === target.instanceId
				)
				if (idx >= 0) {
					const offset =
						ctx.currentState.eEnemyRowMax - ctx.currentState.eEnemyRow.length
					rect =
						ctx.enemySlotsRef.current[offset + idx]?.getBoundingClientRect()
				}
				break
			}
			case 'BUILDING_FARM':
				rect = ctx.farmRef.current?.getBoundingClientRect()
				break
			case 'BUILDING_GATE':
				rect = ctx.gateRef.current?.getBoundingClientRect()
				break
			case 'BUILDING_TOWER':
				rect = ctx.towerRef.current?.getBoundingClientRect()
				break
			case 'FEARAMID':
				rect = ctx.fearamidRef.current?.getBoundingClientRect()
				break
			default:
		}
		if (rect === undefined) {
			ctx.setQueue(q => q.slice(1))
			return
		}
		if (attackSource !== undefined && target.kind !== 'ENEMY_CARD') {
			ctx.setAnimatingAttackVisualization({attackSource, attackTarget: target})
		}
		ctx.setAnimatingFloatingText({
			text,
			color,
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		})
		ctx.setIsAnimating(true)
	},
	DEBUG_ALERT: (action, ctx) => {
		const {message} = action as Extract<SubActionType, {type: 'DEBUG_ALERT'}>
		alert(message)
		ctx.setQueue(q => q.slice(1))
	}
}
