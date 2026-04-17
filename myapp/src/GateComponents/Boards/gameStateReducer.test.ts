import {
	gameStateReducer,
	initialState,
	makeCardInstances,
	makeEnemyCardInstances
} from './gameStateReducer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reduce<T extends Parameters<typeof gameStateReducer>[1]>(
	action: T,
	base = initialState
) {
	return gameStateReducer(base, action)
}

// ---------------------------------------------------------------------------
// UPADTE_RESOURCES
// ---------------------------------------------------------------------------

describe('UPADTE_RESOURCES', () => {
	it('adds coins', () => {
		expect(reduce({type: 'UPADTE_RESOURCES', coins: 3}).cCoins).toBe(3)
	})
	it('adds attack', () => {
		expect(reduce({type: 'UPADTE_RESOURCES', attack: 2}).cAttack).toBe(2)
	})
	it('adds repair', () => {
		expect(reduce({type: 'UPADTE_RESOURCES', repair: 1}).cRepair).toBe(1)
	})
	it('adds calm', () => {
		expect(reduce({type: 'UPADTE_RESOURCES', calm: 4}).cCalm).toBe(4)
	})
	it('adds bonus repair farm', () => {
		expect(reduce({type: 'UPADTE_RESOURCES', bonusRepairFarm: 2}).cBonusRepairFarm).toBe(2)
	})
	it('accumulates across multiple actions', () => {
		const s1 = reduce({type: 'UPADTE_RESOURCES', coins: 2})
		const s2 = gameStateReducer(s1, {type: 'UPADTE_RESOURCES', coins: 3})
		expect(s2.cCoins).toBe(5)
	})
	it('ignores undefined fields', () => {
		const next = reduce({type: 'UPADTE_RESOURCES', coins: 1})
		expect(next.cAttack).toBe(initialState.cAttack)
	})
})

// ---------------------------------------------------------------------------
// BUILDING_CHANGE_HEALTH
// ---------------------------------------------------------------------------

describe('BUILDING_CHANGE_HEALTH', () => {
	it('reduces farm health', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'farm', healthChange: -2})
		expect(next.bFarmHealth).toBe(initialState.bFarmHealth - 2)
	})
	it('reduces gate health', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'gate', healthChange: -3})
		expect(next.bGateHealth).toBe(initialState.bGateHealth - 3)
	})
	it('reduces tower health', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'tower', healthChange: -1})
		expect(next.bTowerHealth).toBe(initialState.bTowerHealth - 1)
	})
	it('repairs farm health', () => {
		const low = {...initialState, bFarmHealth: 2}
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'farm', healthChange: 2}, low)
		expect(next.bFarmHealth).toBe(4)
	})
	it('clamps farm health at 0', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'farm', healthChange: -999})
		expect(next.bFarmHealth).toBe(0)
	})
	it('clamps farm health at max', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'farm', healthChange: 999})
		expect(next.bFarmHealth).toBe(initialState.bFarmHealthMAX)
	})
	it('clamps gate health at max', () => {
		const next = reduce({type: 'BUILDING_CHANGE_HEALTH', building: 'gate', healthChange: 999})
		expect(next.bGateHealth).toBe(initialState.bGateHealthMAX)
	})
})

// ---------------------------------------------------------------------------
// CHANGE_FEAR
// ---------------------------------------------------------------------------

describe('CHANGE_FEAR', () => {
	it('increases fear', () => {
		const next = reduce({type: 'CHANGE_FEAR', amount: 3})
		expect(next.fFear).toBe(3)
	})
	it('decreases fear', () => {
		const base = {...initialState, fFear: 5}
		const next = reduce({type: 'CHANGE_FEAR', amount: -2}, base)
		expect(next.fFear).toBe(3)
	})
})

// ---------------------------------------------------------------------------
// ENEMY_DAMAGE
// ---------------------------------------------------------------------------

describe('ENEMY_DAMAGE', () => {
	it('reduces enemy health', () => {
		const [enemy] = makeEnemyCardInstances([1]) // Speyeder, 3 health
		const base = {...initialState, eEnemyRow: [enemy!]}
		const next = reduce({type: 'ENEMY_DAMAGE', damage: 2, targetInstanceId: enemy!.instanceId}, base)
		expect(next.eEnemyRow[0]?.health).toBe(1)
	})
	it('does not affect other enemies', () => {
		const [a, b] = makeEnemyCardInstances([1, 2])
		const base = {...initialState, eEnemyRow: [a!, b!]}
		const next = reduce({type: 'ENEMY_DAMAGE', damage: 2, targetInstanceId: a!.instanceId}, base)
		expect(next.eEnemyRow[1]?.health).toBe(b!.health)
	})
	it('does nothing if instanceId not found', () => {
		const [enemy] = makeEnemyCardInstances([1])
		const base = {...initialState, eEnemyRow: [enemy!]}
		const next = reduce({type: 'ENEMY_DAMAGE', damage: 2, targetInstanceId: 'nope'}, base)
		expect(next.eEnemyRow[0]?.health).toBe(enemy!.health)
	})
})

// ---------------------------------------------------------------------------
// STACK_ADD_CARDS / STACK_REMOVE_CARDS
// ---------------------------------------------------------------------------

describe('STACK_ADD_CARDS / STACK_REMOVE_CARDS', () => {
	it('adds cards to hand', () => {
		const [card] = makeCardInstances([1])
		const next = reduce({type: 'STACK_ADD_CARDS', stack: 'HAND', cards: [card!]})
		expect(next.pHand).toContain(card)
	})
	it('removes cards from hand', () => {
		const [card] = makeCardInstances([1])
		const base = {...initialState, pHand: [card!]}
		const next = reduce({type: 'STACK_REMOVE_CARDS', stack: 'HAND', instanceIds: [card!.instanceId]}, base)
		expect(next.pHand).toHaveLength(0)
	})
	it('adds cards to discard', () => {
		const [card] = makeCardInstances([2])
		const next = reduce({type: 'STACK_ADD_CARDS', stack: 'DISCARD', cards: [card!]})
		expect(next.pDiscard).toContain(card)
	})
})

// ---------------------------------------------------------------------------
// MARK_CARD_PLAYED / CLEAR_PLAYED_CARDS
// ---------------------------------------------------------------------------

describe('MARK_CARD_PLAYED / CLEAR_PLAYED_CARDS', () => {
	it('marks a card as played', () => {
		const [card] = makeCardInstances([1])
		const base = {...initialState, pHand: [card!]}
		const next = reduce({type: 'MARK_CARD_PLAYED', instanceId: card!.instanceId, cardPlayType: 'COINS'}, base)
		expect(next.pPlayed[card!.instanceId]).toBe('COINS')
	})
	it('clears all played cards', () => {
		const [card] = makeCardInstances([1])
		const base = {...initialState, pPlayed: {[card!.instanceId]: 'ATTACK'}}
		const next = reduce({type: 'CLEAR_PLAYED_CARDS'}, base)
		expect(next.pPlayed).toEqual({})
	})
})

// ---------------------------------------------------------------------------
// UPDATE_GAME_OUTCOME
// ---------------------------------------------------------------------------

describe('UPDATE_GAME_OUTCOME', () => {
	it('sets win outcome', () => {
		expect(reduce({type: 'UPDATE_GAME_OUTCOME', outcome: 'WIN'}).gameOutcome).toBe('WIN')
	})
	it('sets loss outcome', () => {
		expect(reduce({type: 'UPDATE_GAME_OUTCOME', outcome: 'LOSS'}).gameOutcome).toBe('LOSS')
	})
})

// ---------------------------------------------------------------------------
// MULTI_ACTION
// ---------------------------------------------------------------------------

describe('MULTI_ACTION', () => {
	it('applies all actions in sequence', () => {
		const next = reduce({
			type: 'MULTI_ACTION',
			actions: [
				{type: 'UPADTE_RESOURCES', coins: 2},
				{type: 'UPADTE_RESOURCES', attack: 3}
			]
		})
		expect(next.cCoins).toBe(2)
		expect(next.cAttack).toBe(3)
	})
})
