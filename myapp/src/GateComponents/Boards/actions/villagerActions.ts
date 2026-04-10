import type {CardInstance} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

export function makeVillagerActions(enqueue: EnqueueFn) {
	const gameVillagerRowClear = (): void => {
		enqueue([{type: 'ENQ_VILLAGER_ROW_CLEAR'}])
	}

	const gameBuyCard = (card: CardInstance): void => {
		enqueue([{type: 'ENQ_VILLAGER_ROW_BUY_CARD', card}])
	}

	return {gameVillagerRowClear, gameBuyCard}
}
