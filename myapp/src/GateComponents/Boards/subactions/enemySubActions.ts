import {getEnemyCard} from '@/GateComponents/Data/EnemyCardsData'
import type {EnemyCardInstance, GameState} from '../gameStateReducer'
import type {AtomicHandler, Expander, SubActionType} from './types'

export const expanders: Partial<Record<SubActionType['type'], Expander>> = {
	ENQ_ENEMY_TURN: (_action, state: GameState): SubActionType[] => [
		...state.eEnemyRow.map<SubActionType>(enemyCard => ({
			type: 'ENQ_ENEMY_SINGLE_ATTACK',
			enemyCard
		})),
		{type: 'ENQ_ENEMY_DRAW_SINGLE_CARD'}
	],
	ENQ_ENEMY_SINGLE_ATTACK: (action, state: GameState): SubActionType[] => {
		const {enemyCard} = action as Extract<
			SubActionType,
			{type: 'ENQ_ENEMY_SINGLE_ATTACK'}
		>
		const enemyInfo = getEnemyCard(enemyCard.cardId)
		const result: SubActionType[] = []

		const farmAttack = enemyInfo.attack.farm ?? 0
		const towerAttack = enemyInfo.attack.tower ?? 0
		const actualFarmDamage = Math.min(farmAttack, state.bFarmHealth)
		const actualTowerDamage = Math.min(towerAttack, state.bTowerHealth)
		const gateDamage =
			(enemyInfo.attack.gate ?? 0) +
			(farmAttack - actualFarmDamage) +
			(towerAttack - actualTowerDamage)
		const actualGateDamage = Math.min(gateDamage, state.bGateHealth)

		if (actualFarmDamage > 0) {
			result.push({
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'BUILDING_CHANGE_HEALTH',
					building: 'farm',
					healthChange: -actualFarmDamage
				}
			})
			result.push({
				type: 'SHOW_FLOATING_TEXT',
				text: `-${actualFarmDamage}`,
				color: 'var(--color-text-damage)',
				target: {kind: 'BUILDING_FARM'},
				attackSource: {kind: 'ENEMY', instanceId: enemyCard.instanceId}
			})
		}
		if (actualGateDamage > 0) {
			result.push({
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'BUILDING_CHANGE_HEALTH',
					building: 'gate',
					healthChange: -actualGateDamage
				}
			})
			result.push({
				type: 'SHOW_FLOATING_TEXT',
				text: `-${actualGateDamage}`,
				color: 'var(--color-text-damage)',
				target: {kind: 'BUILDING_GATE'},
				attackSource: {kind: 'ENEMY', instanceId: enemyCard.instanceId}
			})
		}
		if (actualTowerDamage > 0) {
			result.push({
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'BUILDING_CHANGE_HEALTH',
					building: 'tower',
					healthChange: -actualTowerDamage
				}
			})
			result.push({
				type: 'SHOW_FLOATING_TEXT',
				text: `-${actualTowerDamage}`,
				color: 'var(--color-text-damage)',
				target: {kind: 'BUILDING_TOWER'},
				attackSource: {kind: 'ENEMY', instanceId: enemyCard.instanceId}
			})
		}

		const fear = enemyInfo.fear ?? 0
		for (let i = 0; i < fear; i++)
			result.push({
				type: 'ENQ_ADD_FEAR',
				attackSource: {kind: 'ENEMY', instanceId: enemyCard.instanceId}
			})

		return result
	},
	ENQ_ENEMY_DRAW_SINGLE_CARD: (_action, state: GameState): SubActionType[] => {
		// Check if there are any cards left in the enemy deck
		if (state.eEnemyDeck.length === 0) return []

		// Check if the enemy row is full.  If so, exile the oldest enemy (it attacks the gate) then draw
		if (state.eEnemyRow.length >= state.eEnemyRowMax) {
			const discardEnemy = state.eEnemyRow[0]
			if (discardEnemy === undefined) return []
			const gateDamage = Math.min(1, state.bGateHealth)
			return [
				gateDamage > 0
					? {
							type: 'ENEMY_EXILE_WITH_GATE_ATTACK' as const,
							enemyCard: discardEnemy,
							gateDamage
						}
					: {
							type: 'ENEMY_ROW_REMOVE_INSTANCE' as const,
							enemyCard: discardEnemy
						},
				{type: 'ENQ_ENEMY_DRAW_SINGLE_CARD'}
			]
		}
		// Draw a single card
		const newEnemy = state.eEnemyDeck[0]
		if (newEnemy === undefined) return []
		return [{type: 'ENEMY_ROW_DRAW_CARD', enemyCard: newEnemy}]
	},
	ENQ_ATTACK_ENEMY: (action, state: GameState): SubActionType[] => {
		const {enemy, damage} = action as Extract<
			SubActionType,
			{type: 'ENQ_ATTACK_ENEMY'}
		>
		const targetEnemey = state.eEnemyRow.find(
			e => e.instanceId === enemy.instanceId
		)
		if (targetEnemey === undefined) {
			return []
		}
		const delta = targetEnemey.health - damage
		const bonusUsed = Math.max(state.bTowerBonusDamageCurrent, delta, 0)
		const damageUsed = Math.max(damage, targetEnemey.health, 0)
		const totalDamage = damageUsed + bonusUsed
		const actionsDamageEnemy: SubActionType[] = [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'UPADTE_RESOURCES',
					attack: -damageUsed,
					towerBonusDmaageCurrent: -bonusUsed
				}
			},
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'ENEMY_DAMAGE',
					targetInstanceId: targetEnemey.instanceId,
					damage: totalDamage
				}
			},
			{
				type: 'SHOW_FLOATING_TEXT',
				color: 'red',
				text: `${totalDamage}`,
				target: {kind: 'ENEMY_CARD', instanceId: targetEnemey.instanceId}
			}
		]

		if (targetEnemey.health <= damage) {
			return [
				...actionsDamageEnemy,
				{
					type: 'ENEMY_ROW_REMOVE_INSTANCE',
					enemyCard: targetEnemey
				}
			]
		}
		return actionsDamageEnemy
	}
}

export const atomicHandlers: Partial<
	Record<SubActionType['type'], AtomicHandler>
> = {
	ENEMY_ROW_REMOVE_INSTANCE: (action, ctx) => {
		const {enemyCard} = action as {
			type: 'ENEMY_ROW_REMOVE_INSTANCE'
			enemyCard: EnemyCardInstance | undefined
		}
		const uuid = enemyCard?.instanceId
		if (uuid === undefined) {
			ctx.setQueue(q => q.slice(1))
			return
		}
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({type: 'ENEMY_ROW_DISCARD_INSTANCE', uuid})
		}
		ctx.setAnimatingEnemyRemove(uuid)
		ctx.setIsAnimating(true)
	},

	ENEMY_ROW_REMOVE_OLDEST: (_action, ctx) => {
		const oldest = ctx.currentState.eEnemyRow[0]
		if (oldest === undefined) {
			ctx.setQueue(q => q.slice(1))
			return
		}
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({type: 'ENEMY_ROW_DISCARD_OLDEST'})
		}
		ctx.setAnimatingEnemyRemove(oldest.instanceId)
		ctx.setIsAnimating(true)
	},

	ENEMY_EXILE_WITH_GATE_ATTACK: (action, ctx) => {
		const {enemyCard, gateDamage} = action as Extract<
			SubActionType,
			{type: 'ENEMY_EXILE_WITH_GATE_ATTACK'}
		>

		// Immediate gate damage
		ctx.dispatch({
			type: 'BUILDING_CHANGE_HEALTH',
			building: 'gate',
			healthChange: -gateDamage
		})

		// Exile animation — defer enemy removal until signalExileComplete fires
		ctx.setAnimatingEnemyRemove(enemyCard.instanceId)
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({
				type: 'ENEMY_ROW_DISCARD_INSTANCE',
				uuid: enemyCard.instanceId
			})
		}

		// Floating text + attack visualization — signalAnimationComplete advances queue
		const gateRect = ctx.gateRef.current?.getBoundingClientRect()
		if (gateRect) {
			ctx.setAnimatingFloatingText({
				text: `-${gateDamage}`,
				color: 'var(--color-text-damage)',
				x: gateRect.left + gateRect.width / 2,
				y: gateRect.top + gateRect.height / 2
			})
			ctx.setAnimatingAttackVisualization({
				attackSource: {kind: 'ENEMY', instanceId: enemyCard.instanceId},
				attackTarget: {kind: 'BUILDING_GATE'}
			})
		}

		ctx.setIsAnimating(true)
	},

	ENEMY_ROW_DRAW_CARD: (action, ctx) => {
		const {enemyCard} = action as {
			type: 'ENEMY_ROW_DRAW_CARD'
			enemyCard: EnemyCardInstance
		}
		const currentRow = ctx.currentState.eEnemyRow
		const offset = ctx.currentState.eEnemyRowMax - currentRow.length
		const shiftMap: Record<string, {x: number; y: number}> = {}
		for (let i = 0; i < currentRow.length; i++) {
			const c = currentRow[i]
			if (c === undefined) continue
			const slotEl = ctx.enemySlotsRef.current[offset + i]
			const rect = slotEl?.getBoundingClientRect()
			if (rect) shiftMap[c.instanceId] = {x: rect.left, y: rect.top}
		}
		ctx.dispatch({
			type: 'MULTI_ACTION',
			actions: [
				{type: 'ENEMY_DECK_REMOVE_CARD', instanceId: enemyCard.instanceId},
				{type: 'ENEMY_ROW_ADD_CARD', card: enemyCard}
			]
		})
		ctx.setAnimatingEnemyShifts(shiftMap)
		ctx.setIsAnimating(true)
		ctx.setAnimatingCard({
			type: 'ENEMY',
			instanceId: enemyCard.instanceId,
			moveFrom: ctx.eDeckPos
				? {x: ctx.eDeckPos.left, y: ctx.eDeckPos.top}
				: undefined
		})
	}
}
