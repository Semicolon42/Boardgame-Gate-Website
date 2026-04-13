import type {GameState} from '../gameStateReducer'
import type {AtomicHandler, Expander, SubActionType} from './types'

export const expanders: Partial<Record<SubActionType['type'], Expander>> = {
	ENQ_GAME_START: (_action, _state: GameState): SubActionType[] => {
		return [
			// Prepare the player starter deck
			// Prepare the village deck
			// Prepare the enemy deck
			// Draw the enemy card
			{type: 'ENQ_ENEMY_DRAW_SINGLE_CARD'},
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
		{type: 'ENQ_PLAYER_DRAW_N', count: 3}
	],
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
		const {text, color, target} = action as Extract<
			SubActionType,
			{type: 'SHOW_FLOATING_TEXT'}
		>
		let rect: DOMRect | undefined
		if (target.kind === 'ENEMY_CARD') {
			const idx = ctx.currentState.eEnemyRow.findIndex(
				c => c.instanceId === target.instanceId
			)
			if (idx >= 0) {
				const offset = ctx.currentState.eEnemyRowMax - ctx.currentState.eEnemyRow.length
				rect = ctx.enemySlotsRef.current[offset + idx]?.getBoundingClientRect()
			}
		} else if (target.kind === 'BUILDING_FARM') {
			rect = ctx.farmRef.current?.getBoundingClientRect()
		} else if (target.kind === 'BUILDING_GATE') {
			rect = ctx.gateRef.current?.getBoundingClientRect()
		} else if (target.kind === 'BUILDING_TOWER') {
			rect = ctx.towerRef.current?.getBoundingClientRect()
		}
		if (rect === undefined) {
			ctx.setQueue(q => q.slice(1))
			return
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
