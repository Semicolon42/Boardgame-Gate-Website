import type {BuildingType} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

export function makeBuildingActions(_enqueue: EnqueueFn) {
	/** TODO: implement player repair building logic */
	const playerRepairBuilding = (_building: BuildingType): void => {
		// TODO
	}

	/** TODO: implement player spend coin logic */
	const playerSpendCoin = (
		_coinAction: 'CALM' | 'ATTACK' | 'REPAIR' | 'REPLACE_BUY_ROW'
	): void => {
		// TODO
	}

	return {playerRepairBuilding, playerSpendCoin}
}
