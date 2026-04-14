import type {Dispatch} from 'react'
import type {CardPlayHandler} from '../../Cards/XCard'
import type {BuildingType, CardInstance, GameAction} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

type ResourceType = 'COINS' | 'REPAIR' | 'CALM' | 'ATTACK'

export function makePlayerActions(
	enqueue: EnqueueFn,
	dispatch: Dispatch<GameAction>
) {
	const gameDrawCards = (n: number): void => {
		enqueue([{type: 'ENQ_PLAYER_DRAW_N', count: n}])
	}

	const gameEndTurn = (): void => {
		enqueue([{type: 'ENQ_GAME_END_TURN'}])
	}

	const gameOver = (): void => {
		enqueue([{type: 'ENQ_GAME_OVER'}])
	}

	const playCard: CardPlayHandler = (
		card: CardInstance,
		cardPlayType
	): void => {
		enqueue([{type: 'ENQ_PLAYER_PLAY_CARD', card, cardPlayType}])
	}

	const clearActionLogs = (): void => {
		dispatch({type: 'ACTION_LOGS_CLEAR'})
	}

	const gameGainGenericResource = (
		type: ResourceType,
		amount: number,
		cost: number
	): void => {
		switch (type) {
			case 'COINS': {
				enqueue([
					{
						type: 'EXECUTE_GAME_STATE_UPDATE',
						gameStateAction: {
							type: 'UPADTE_RESOURCES',
							coins: amount - cost
						}
					}
				])
				return
			}
			case 'REPAIR': {
				enqueue([
					{
						type: 'EXECUTE_GAME_STATE_UPDATE',
						gameStateAction: {
							type: 'UPADTE_RESOURCES',
							coins: -cost,
							repair: amount
						}
					}
				])
				return
			}
			case 'CALM': {
				enqueue([
					{
						type: 'EXECUTE_GAME_STATE_UPDATE',
						gameStateAction: {
							type: 'UPADTE_RESOURCES',
							coins: -cost,
							calm: amount
						}
					}
				])
				return
			}
			case 'ATTACK': {
				enqueue([
					{
						type: 'EXECUTE_GAME_STATE_UPDATE',
						gameStateAction: {
							type: 'UPADTE_RESOURCES',
							coins: -cost,
							attack: amount
						}
					}
				])
				return
			}
		}
	}

	const gameRepairBase = (building: BuildingType, repairAmount: number) => {
		enqueue([
			{type: 'ENQ_PLAYER_REPAIR_BUILDING', building, amount: repairAmount}
		])
	}

	return {
		gameDrawCards,
		gameEndTurn,
		gameOver,
		playCard,
		gameGainGenericResource,
		gameRepairBase,
		clearActionLogs
	}
}
