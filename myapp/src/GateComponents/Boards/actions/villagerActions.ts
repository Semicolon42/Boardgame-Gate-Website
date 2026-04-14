import type {CardInstance} from '../gameStateReducer'
import type {EnqueueFn, SubActionType} from '../useSubActionQueue'

export function makeVillagerActions(enqueue: EnqueueFn) {
	const gameVillagerRowClear = (cost?: number | undefined): void => {
		const actionQueue: SubActionType[] = []
		if (cost) {
			actionQueue.push({
				type: 'EXECUTE_GAME_STATE_UPDATE',
				gameStateAction: {
					type: 'UPADTE_RESOURCES',
					coins: -cost
				}
			})
		}
		actionQueue.push({type: 'ENQ_VILLAGER_ROW_CLEAR'})
		enqueue(actionQueue)
	}

	const gameBuyCard = (card: CardInstance): void => {
		enqueue([{type: 'ENQ_VILLAGER_ROW_BUY_CARD', card}])
	}

	return {gameVillagerRowClear, gameBuyCard}
}
