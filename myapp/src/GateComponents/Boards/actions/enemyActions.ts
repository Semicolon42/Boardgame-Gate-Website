import type {BuildingType, EnemyCardInstance} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

export function makeEnemyActions(enqueue: EnqueueFn) {
	/** TODO: implement logic to attack an enemy */
	const attackEnemy = (enemy: EnemyCardInstance, damage: number): void => {
		// TODO
	}

	return {
		attackEnemy
	}
}