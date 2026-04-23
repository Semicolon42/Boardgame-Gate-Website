// ---------------------------------------------------------------------------
// Game record reducer — accumulates per-game stats in parallel with the game
// state reducer. Kept entirely separate from GameState so the simulation layer
// stays clean.
// ---------------------------------------------------------------------------

export interface GameRecord {
	date: string
	outcome: 'WIN' | 'LOSS'
	turnCount: number
	finalFear: number
	fearGained: number
	fearHealed: number
	damageTakenByBuilding: {farm: number; gate: number; tower: number}
	repairByBuilding: {farm: number; gate: number; tower: number}
	damageDealtToEnemies: number
	/** cardId → number of times played this game */
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
		case 'RECORD_RESET':
			return {...initialGameRecord}

		case 'RECORD_TURN_END':
			return {...state, turnCount: state.turnCount + 1}

		case 'RECORD_FEAR_CHANGE':
			if (action.amount > 0) {
				return {...state, fearGained: state.fearGained + action.amount}
			}
			return {...state, fearHealed: state.fearHealed + Math.abs(action.amount)}

		case 'RECORD_BUILDING_HEALTH_CHANGE': {
			const b = action.building
			if (action.amount > 0) {
				return {
					...state,
					repairByBuilding: {
						...state.repairByBuilding,
						[b]: state.repairByBuilding[b] + action.amount
					}
				}
			}
			return {
				...state,
				damageTakenByBuilding: {
					...state.damageTakenByBuilding,
					[b]: state.damageTakenByBuilding[b] + Math.abs(action.amount)
				}
			}
		}

		case 'RECORD_ENEMY_DAMAGE':
			return {
				...state,
				damageDealtToEnemies: state.damageDealtToEnemies + action.amount
			}

		case 'RECORD_CARD_PLAYED':
			return {
				...state,
				cardPlayCounts: {
					...state.cardPlayCounts,
					[action.cardId]: (state.cardPlayCounts[action.cardId] ?? 0) + 1
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

		default: {
			const _exhaustive: never = action
			throw new Error(
				`Unknown GameRecordAction: ${JSON.stringify(_exhaustive)}`
			)
		}
	}
}
