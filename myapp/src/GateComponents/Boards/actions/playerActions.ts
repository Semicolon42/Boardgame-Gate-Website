import type {Dispatch} from 'react'
import type {CardPlayHandler} from '../../Cards/XCard'
import type {CardInstance, GameAction} from '../gameStateReducer'
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

	const playCard: CardPlayHandler = (card: CardInstance, cardPlayType): void => {
		enqueue([{type: 'ENQ_PLAYER_PLAY_CARD', card, cardPlayType}])
	}

	const clearActionLogs = (): void => {
		dispatch({type: 'ACTION_LOGS_CLEAR'})
	}

	const gainGenericResource = (type: ResourceType, amount: number, cost: number): void => {
		switch(type) {
			case 'COINS': {
				enqueue([{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {
					type: 'UPADTE_RESOURCES',
					coins: amount - cost
				}}])
				return
			}
			case 'REPAIR': {
				enqueue([{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {
					type: 'UPADTE_RESOURCES',
					coins: -cost,
					repair: amount
				}}])
				return
			}
			case 'CALM': {
				enqueue([{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {
					type: 'UPADTE_RESOURCES',
					calm: -cost,
					repair: amount
				}}])
				return 
			}
			case 'ATTACK': {
				enqueue([{type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {
					type: 'UPADTE_RESOURCES',
					attack: -cost,
					repair: amount
				}}])
				return
			}
		}
		
	}

	return {gameDrawCards, gameEndTurn, playCard, gainGenericResource, clearActionLogs}
}
