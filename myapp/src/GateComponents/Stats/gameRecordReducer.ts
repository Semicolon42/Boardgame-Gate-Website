export interface GameRecord {
	date: string
	seed: number
	outcome: 'WIN' | 'LOSS'
	turnCount: number
	finalFear: number
	fearGained: number
	fearHealed: number
	damageTakenByBuilding: {farm: number; gate: number; tower: number}
	repairByBuilding: {farm: number; gate: number; tower: number}
	damageDealtToEnemies: number
	cardPlayCounts: Record<number, number>
	purchasedCardIds: number[]
	bonusCardsDrawn: number
}

export type GameRecordAction =
	| {type: 'RECORD_TURN_END'}
	| {type: 'RECORD_FEAR_CHANGE'; amount: number}
	| {
			type: 'RECORD_BUILDING_HEALTH_CHANGE'
			building: 'farm' | 'gate' | 'tower'
			amount: number
	  }
	| {type: 'RECORD_ENEMY_DAMAGE'; amount: number}
	| {type: 'RECORD_CARD_PLAYED'; cardId: number}
	| {type: 'RECORD_CARD_PURCHASED'; cardId: number}
	| {type: 'RECORD_BONUS_DRAW'}
	| {type: 'RECORD_GAME_END'; outcome: 'WIN' | 'LOSS'; finalFear: number}
	| {type: 'RECORD_RESET'}

export const initialGameRecord: GameRecord = {
	date: '',
	seed: 0,
	outcome: 'LOSS',
	turnCount: 0,
	finalFear: 0,
	fearGained: 0,
	fearHealed: 0,
	damageTakenByBuilding: {farm: 0, gate: 0, tower: 0},
	repairByBuilding: {farm: 0, gate: 0, tower: 0},
	damageDealtToEnemies: 0,
	cardPlayCounts: {},
	purchasedCardIds: [],
	bonusCardsDrawn: 0
}

export function gameRecordReducer(
	state: GameRecord,
	action: GameRecordAction
): GameRecord {
	switch (action.type) {
		case 'RECORD_TURN_END':
			return {...state, turnCount: state.turnCount + 1}

		case 'RECORD_FEAR_CHANGE':
			if (action.amount > 0) {
				return {...state, fearGained: state.fearGained + action.amount}
			}
			return {...state, fearHealed: state.fearHealed + Math.abs(action.amount)}

		case 'RECORD_BUILDING_HEALTH_CHANGE': {
			if (action.amount > 0) {
				return {
					...state,
					repairByBuilding: {
						...state.repairByBuilding,
						[action.building]:
							state.repairByBuilding[action.building] + action.amount
					}
				}
			}
			return {
				...state,
				damageTakenByBuilding: {
					...state.damageTakenByBuilding,
					[action.building]:
						state.damageTakenByBuilding[action.building] +
						Math.abs(action.amount)
				}
			}
		}

		case 'RECORD_ENEMY_DAMAGE':
			return {
				...state,
				damageDealtToEnemies: state.damageDealtToEnemies + action.amount
			}

		case 'RECORD_CARD_PLAYED': {
			const prev = state.cardPlayCounts[action.cardId] ?? 0
			return {
				...state,
				cardPlayCounts: {...state.cardPlayCounts, [action.cardId]: prev + 1}
			}
		}

		case 'RECORD_CARD_PURCHASED':
			return {
				...state,
				purchasedCardIds: [...state.purchasedCardIds, action.cardId]
			}

		case 'RECORD_BONUS_DRAW':
			return {...state, bonusCardsDrawn: state.bonusCardsDrawn + 1}

		case 'RECORD_GAME_END':
			return {
				...state,
				outcome: action.outcome,
				finalFear: action.finalFear,
				date: new Date().toISOString()
			}

		case 'RECORD_RESET':
			return initialGameRecord

		default: {
			const _exhaustive: never = action
			return _exhaustive
		}
	}
}
