import {getCitizenCard} from '@/GateComponents/Data/PlayerCards'
import type {GameAction, GameState} from '../gameStateReducer'
import type {
	AtomicHandler,
	Expander,
	FloatingTextTarget,
	SubActionType
} from './types'

export const expanders: Partial<Record<SubActionType['type'], Expander>> = {
	ENQ_PLAYER_PLAY_CARD: (action, _state): SubActionType[] => {
		const {card, cardPlayType} = action as Extract<
			SubActionType,
			{type: 'ENQ_PLAYER_PLAY_CARD'}
		>
		const cardInfo = getCitizenCard(card.cardId)
		return [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'MULTI_ACTION',
					actions: [
						{
							type: 'UPADTE_RESOURCES',
							coins: cardPlayType === 'COINS' ? cardInfo.actionCoins : 0,
							attack: cardPlayType === 'ATTACK' ? cardInfo.actionAttack : 0,
							repair: cardPlayType === 'REPAIR' ? cardInfo.actionRepair : 0,
							bonusRepairFarm:
								cardPlayType === 'REPAIR'
									? (cardInfo.actionRepairBonusFarm ?? 0)
									: 0,
							bonusRepairGate:
								cardPlayType === 'REPAIR'
									? (cardInfo.actionRepairBonusGate ?? 0)
									: 0,
							bonusRepairTower:
								cardPlayType === 'REPAIR'
									? (cardInfo.actionRepairBonusTower ?? 0)
									: 0,
							calm: cardPlayType === 'CALM' ? cardInfo.actionCalm : 0
						},
						{
							type: 'MARK_CARD_PLAYED',
							instanceId: card.instanceId,
							cardPlayType
						}
					]
				}
			}
		]
	},

	ENQ_DISCARD_HAND: (_action, state: GameState): SubActionType[] =>
		state.pHand.map<SubActionType>(card => ({
			type: 'PLAYER_DISCARD_SINGLE_CARD',
			card
		})),

	ENQ_PLAYER_DRAW_N: (action, _state): SubActionType[] => {
		const {count} = action as Extract<
			SubActionType,
			{type: 'ENQ_PLAYER_DRAW_N'}
		>
		return Array.from(
			{length: count},
			(): SubActionType => ({type: 'ENQ_PLAYER_DRAW_SINGLE_CARD'})
		)
	},

	ENQ_PLAYER_DRAW_SINGLE_CARD: (_action, state: GameState): SubActionType[] => {
		if (state.pDeck.length === 0) {
			if (state.pDiscard.length === 0) return []
			return [
				{type: 'PLAYER_SHUFFLE_DISCARD_INTO_DECK'},
				{type: 'PLAYER_SHUFFLE_SHUFFLE_DECK'},
				{type: 'ENQ_PLAYER_DRAW_SINGLE_CARD'}
			]
		}
		const card = state.pDeck[0]
		if (card === undefined) return []
		return [{type: 'PLAYER_DRAW_CARD', card}]
	},

	ENQ_CALM_FEARAMID: (action, state: GameState): SubActionType[] => {
		const {amount} = action as Extract<
			SubActionType,
			{type: 'ENQ_PLAYER_REPAIR_BUILDING'}
		>
		if (state.fFear < amount) {
			return []
		}
		return [
			{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {type:'CHANGE_FEAR', amount:-amount}},
			{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {type:'UPADTE_RESOURCES', calm:-amount}},
			{type: 'SHOW_FLOATING_TEXT', target: {kind: 'FEARAMID'}, color: 'green', text: ''+amount}
		]
	},

	ENQ_PLAYER_REPAIR_BUILDING: (action, state: GameState): SubActionType[] => {
		const {building, amount} = action as Extract<
			SubActionType,
			{type: 'ENQ_PLAYER_REPAIR_BUILDING'}
		>
		const actionResourceUpdate: GameAction = {
			type: 'UPADTE_RESOURCES',
			repair: -1
		}
		let buildingTarget: FloatingTextTarget = {kind: 'BUILDING_FARM'}
		let repairAmout = amount
		switch (building) {
			case 'farm': {
				buildingTarget = {kind: 'BUILDING_FARM'}
				repairAmout += state.cBonusRepairFarm
				actionResourceUpdate.bonusRepairFarm = -state.cBonusRepairFarm
				break
			}
			case 'gate': {
				buildingTarget = {kind: 'BUILDING_GATE'}
				repairAmout += state.cBonusRepairGate
				actionResourceUpdate.bonusRepairGate = -state.cBonusRepairGate
				break
			}
			case 'tower': {
				buildingTarget = {kind: 'BUILDING_TOWER'}
				repairAmout += state.cBonusRepairTower
				actionResourceUpdate.bonusRepairTower = -state.cBonusRepairTower
				break
			}
		}
		return [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'BUILDING_CHANGE_HEALTH',
					building,
					healthChange: repairAmout
				}
			},
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: actionResourceUpdate
			},
			{
				type: 'SHOW_FLOATING_TEXT',
				target: buildingTarget,
				color: 'green',
				text: `${repairAmout}`
			}
		]
	}
}

export const atomicHandlers: Partial<
	Record<SubActionType['type'], AtomicHandler>
> = {
	PLAYER_DRAW_CARD: (action, ctx) => {
		const {card} = action as Extract<SubActionType, {type: 'PLAYER_DRAW_CARD'}>
		ctx.dispatch({
			type: 'MULTI_ACTION',
			actions: [
				{
					type: 'STACK_REMOVE_CARDS',
					stack: 'DECK',
					instanceIds: [card.instanceId]
				},
				{type: 'STACK_ADD_CARDS', stack: 'HAND', cards: [card]}
			]
		})
		ctx.setIsAnimating(true)
		ctx.setAnimatingCard({
			type: 'PLAYER',
			instanceId: card.instanceId,
			moveFrom: ctx.deckPos
				? {x: ctx.deckPos.left, y: ctx.deckPos.top}
				: undefined
		})
	},

	PLAYER_DISCARD_SINGLE_CARD: (action, ctx) => {
		const {card} = action as Extract<
			SubActionType,
			{type: 'PLAYER_DISCARD_SINGLE_CARD'}
		>
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({
				type: 'MULTI_ACTION',
				actions: [
					{
						type: 'STACK_REMOVE_CARDS',
						stack: 'HAND',
						instanceIds: [card.instanceId]
					},
					{type: 'STACK_ADD_CARDS', stack: 'DISCARD', cards: [card]}
				]
			})
		}
		ctx.setIsAnimating(true)
		ctx.setAnimatingCard({
			type: 'PLAYER',
			instanceId: card.instanceId,
			moveTo: ctx.discardPos
				? {x: ctx.discardPos.left, y: ctx.discardPos.top}
				: undefined
		})
	},

	PLAYER_SHUFFLE_DISCARD_INTO_DECK: (_action, ctx) => {
		const shuffled = [...ctx.currentState.pDiscard].sort(
			() => Math.random() - 0.5
		)
		ctx.dispatch({type: 'STACK_ADD_CARDS', stack: 'DECK', cards: shuffled})
		ctx.dispatch({type: 'STACK_CLEAR_ALL_CARDS', stack: 'DISCARD'})
		ctx.setQueue(q => q.slice(1))
	},

	PLAYER_SHUFFLE_SHUFFLE_DECK: (_action, ctx) => {
		ctx.dispatch({type: 'STACK_SHUFFLE', stack: 'DECK'})
		ctx.setQueue(q => q.slice(1))
	}
}
