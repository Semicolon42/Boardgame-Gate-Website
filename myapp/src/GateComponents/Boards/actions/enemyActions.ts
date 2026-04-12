import type {EnemyCardInstance} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

export function makeEnemyActions(_enqueue: EnqueueFn) {
	/** TODO: implement logic to attack an enemy */
	const attackEnemy = (_enemy: EnemyCardInstance, _damage: number): void => {
		// TODO
	}

	return {
		attackEnemy
	}
}
