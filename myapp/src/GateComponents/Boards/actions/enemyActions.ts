import type {EnemyCardInstance} from '../gameStateReducer'
import type {EnqueueFn} from '../useSubActionQueue'

export function makeEnemyActions(enqueue: EnqueueFn) {
	/** TODO: implement logic to attack an enemy */
	const gameAttackEnemy = (enemy: EnemyCardInstance, damage: number): void => {
		enqueue([{type: 'ENQ_ATTACK_ENEMY', enemy, damage}])
	}

	return {
		gameAttackEnemy
	}
}
