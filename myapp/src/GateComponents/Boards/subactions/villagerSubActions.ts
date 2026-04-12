import {getCitizenCard} from '@/GateComponents/Data/PlayerCards'
import type {GameState} from '../gameStateReducer'
import type {AtomicHandler, Expander, SubActionType} from './types'

export const expanders: Partial<Record<SubActionType['type'], Expander>> = {
	ENQ_VILLAGER_DRAW_SINGLE_CARD: (
		_action,
		state: GameState
	): SubActionType[] => {
		if (state.vDeck.length === 0) {
			if (state.vDiscard.length === 0) return []
			return [
				{type: 'VILLAGER_SHUFFLE_DISCARD_INTO_DECK'},
				{type: 'VILLAGER_SHUFFLE_DECK'},
				{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'}
			]
		}
		const card = state.vDeck[0]
		if (card === undefined) return []
		return [{type: 'VILLAGER_ROW_DRAW_CARD', card}]
	},

	ENQ_VILLAGER_ROW_BUY_CARD: (action, _state): SubActionType[] => {
		const {card} = action as Extract<
			SubActionType,
			{type: 'ENQ_VILLAGER_ROW_BUY_CARD'}
		>
		return [
			{
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'UPADTE_RESOURCES',
					coins: -getCitizenCard(card.cardId).cost
				}
			},
			{type: 'VILLAGER_ROW_BUY_CARD', card},
			{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'}
		]
	},

	ENQ_VILLAGER_ROW_CLEAR: (_action, _state): SubActionType[] => [
		{type: 'VILLAGER_ROW_CLEAR'},
		{type: 'ENQ_VILLAGER_ROW_FILL'}
	],

	ENQ_VILLAGER_ROW_FILL: (_action, state: GameState): SubActionType[] => {
		if (state.vRow.length < 4) {
			return [
				{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'},
				{type: 'ENQ_VILLAGER_ROW_FILL'}
			]
		}
		return []
	}
}

export const atomicHandlers: Partial<
	Record<SubActionType['type'], AtomicHandler>
> = {
	VILLAGER_ROW_DRAW_CARD: (action, ctx) => {
		const {card} = action as Extract<
			SubActionType,
			{type: 'VILLAGER_ROW_DRAW_CARD'}
		>
		ctx.dispatch({
			type: 'MULTI_ACTION',
			actions: [
				{
					type: 'STACK_REMOVE_CARDS',
					stack: 'VILLAGER_DECK',
					instanceIds: [card.instanceId]
				},
				{type: 'STACK_ADD_CARDS', stack: 'VILLAGER_ROW', cards: [card]}
			]
		})
		ctx.setIsAnimating(true)
		ctx.setAnimatingCard({
			type: 'VILLAGER',
			instanceId: card.instanceId,
			moveFrom: ctx.villagerDeckPos
				? {x: ctx.villagerDeckPos.left, y: ctx.villagerDeckPos.top}
				: undefined
		})
	},

	VILLAGER_ROW_BUY_CARD: (action, ctx) => {
		const {card} = action as Extract<
			SubActionType,
			{type: 'VILLAGER_ROW_BUY_CARD'}
		>
		if (card === undefined) {
			ctx.setQueue(q => q.slice(1))
			return
		}
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({
				type: 'MULTI_ACTION',
				actions: [
					{
						type: 'STACK_REMOVE_CARDS',
						stack: 'VILLAGER_ROW',
						instanceIds: [card.instanceId]
					},
					{type: 'STACK_ADD_CARDS', stack: 'DISCARD', cards: [card]}
				]
			})
		}
		ctx.setIsAnimating(true)
		ctx.setAnimatingCard({
			type: 'VILLAGER',
			instanceId: card.instanceId,
			moveTo: ctx.discardPos
				? {x: ctx.discardPos.left, y: ctx.discardPos.top}
				: undefined
		})
	},

	VILLAGER_ROW_CLEAR: (action, ctx) => {
		const {cards} = action as Extract<
			SubActionType,
			{type: 'VILLAGER_ROW_CLEAR'}
		>
		const cardsToDiscard = cards ?? ctx.currentState.vRow
		ctx.pendingOnCompleteRef.current = () => {
			ctx.dispatch({
				type: 'MULTI_ACTION',
				actions: [
					{type: 'STACK_CLEAR_ALL_CARDS', stack: 'VILLAGER_ROW'},
					{
						type: 'STACK_ADD_CARDS',
						stack: 'VILLAGER_DISCARD',
						cards: cardsToDiscard
					}
				]
			})
		}
		ctx.setIsAnimating(true)
		ctx.setAnimatingClearVillagerRow({
			moveTo: ctx.villagerDeckPos
				? {x: ctx.villagerDeckPos.left, y: ctx.villagerDeckPos.top}
				: undefined
		})
	},

	VILLAGER_SHUFFLE_DISCARD_INTO_DECK: (_action, ctx) => {
		const shuffled = [...ctx.currentState.vDiscard].sort(
			() => Math.random() - 0.5
		)
		ctx.dispatch({
			type: 'STACK_ADD_CARDS',
			stack: 'VILLAGER_DECK',
			cards: shuffled
		})
		ctx.dispatch({type: 'STACK_CLEAR_ALL_CARDS', stack: 'VILLAGER_DISCARD'})
		ctx.setQueue(q => q.slice(1))
	},

	VILLAGER_SHUFFLE_DECK: (_action, ctx) => {
		ctx.dispatch({type: 'STACK_SHUFFLE', stack: 'VILLAGER_DECK'})
		ctx.setQueue(q => q.slice(1))
	}
}
