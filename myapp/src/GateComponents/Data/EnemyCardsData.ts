import type {BuildingType} from '../Boards/gameStateReducer'

export type EnemyCardType = 'DEBUG' | 'L1' | 'L2' | 'L3' | 'Z'

export function GetRange(type: EnemyCardType) {
	return ENEMY_CARD_LIST.filter(c => c.type === type).map(c => c.id)
}

export interface IEnemyCard {
	id: number
	name: string
	image: string
	type: EnemyCardType

	stars: number
	health: number
	attack: Partial<Record<BuildingType, number>>
	fear?: number | undefined
	specialAbility?: string | undefined
}

const GENERIC_DEBUG_ENEMY: IEnemyCard = {
	id: 0,
	name: 'Generic',
	image: 'generic',
	type: 'DEBUG',

	stars: 0,
	health: 1,
	attack: {
		farm: 1
	},
	fear: 1,
	specialAbility: 'generic'
}

export const ENEMY_CARD_LIST: IEnemyCard[] = [
	GENERIC_DEBUG_ENEMY,
	{
		id: 1,
		name: 'Speyeder',
		image: 'generic',
		type: 'L1',

		stars: 1,
		health: 3,
		attack: {
			gate: 1
		},
		fear: 1
	},
	{
		id: 2,
		name: 'Skulepede',
		image: 'generic',
		type: 'L1',

		stars: 2,
		health: 3,
		attack: {
			tower: 2
		}
	},
	{
		id: 3,
		name: 'Plague Rat',
		image: 'generic',
		type: 'L1',

		stars: 3,
		health: 4,
		attack: {
			farm: 1
		},
		fear: 1
	},
	{
		id: 4,
		name: 'Rot Worm',
		image: 'generic',
		type: 'L2',

		stars: 4,
		health: 5,
		attack: {
			farm: 2
		},
		fear: 1
	},
	{
		id: 5,
		name: 'Rat Lord',
		image: 'generic',
		type: 'L2',

		stars: 5,
		health: 6,
		attack: {
			gate: 2
		}
	},
	{
		id: 6,
		name: 'Dark Priest',
		image: 'generic',
		type: 'L2',

		stars: 6,
		health: 5,
		attack: {
			tower: 2
		},
		fear: 1,
	},
	{
		id: 7,
		name: 'Death Guard',
		image: 'generic',
		type: 'L3',

		stars: 7,
		health: 1,
		attack: {
			tower: 1
		},
		fear: 2
	},
	{
		id: 8,
		name: 'Abombination',
		image: 'generic',
		type: 'L3',

		stars: 8,
		health: 6,
		attack: {
			farm: 2
		},
		fear: 1,
	},
	{
		id: 9,
		name: 'Grave Lord',
		image: 'generic',
		type: 'L3',

		stars: 0,
		health: 7,
		attack: {
			farm: 1,
			gate: 1, 
			tower: 1,
		},
		fear: 1,
		specialAbility: 'generic'
	},
	{
		id: 20,
		name: 'ZOLTAR',
		image: 'zoltar',
		type: 'Z',

		stars: 9,
		health: 11,
		attack: {
			all: 2
		},
		fear: 2
	}
]

export function getEnemyCard(id: number): IEnemyCard {
	return ENEMY_CARD_LIST.find(it => it.id === id) ?? GENERIC_DEBUG_ENEMY
}
