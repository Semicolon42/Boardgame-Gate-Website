import type {SubActionType} from '@/GateComponents/Boards/subactions/types'

export type CitizenCardType = 'VILLAGER' | 'HERO' | 'STARTER' | 'DEBUG'
export const HERO_PLACEHOLDER_CARD_ID = 99

export function GetRange(type: CitizenCardType) {
	return CITIZEN_CARD_LIST.filter(c => c.type === type).map(c => c.id)
}

export interface IntCitizenCard {
	id: number
	name: string
	image: string
	type: CitizenCardType

	cost: number
	actionCoins: number
	actionRepair: number
	actionCalm: number
	actionAttack: number

	actionRepairBonusFarm?: number | undefined
	actionRepairBonusGate?: number | undefined
	actionRepairBonusTower?: number | undefined

	actionBonusAction?: SubActionType
	actionBonusText?: string
	
	canTrashFromDiscard?: boolean
}

export const CITIZEN_CARD_LIST: IntCitizenCard[] = [
	{
		id: HERO_PLACEHOLDER_CARD_ID,
		name: 'Hero',
		image: 'hero_placeholder',
		type: 'VILLAGER',

		cost: 0,
		actionCoins: 0,
		actionRepair: 0,
		actionCalm: 0,
		actionAttack: 0,
		actionBonusText: 'Hero revealed when draw'
	},
	{
		id: 0,
		name: 'Generic',
		image: 'generic',
		type: 'DEBUG',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 1
	},
	{
		id: 1,
		name: 'Guard',
		image: 'guard',
		type: 'STARTER',

		cost: 0,
		actionCoins: 1,
		actionRepair: 0,
		actionCalm: 0,
		actionAttack: 1
	},
	{
		id: 2,
		name: 'Monk',
		image: 'monk',
		type: 'STARTER',

		cost: 0,
		actionCoins: 1,
		actionRepair: 0,
		actionCalm: 1,
		actionAttack: 0
	},
	{
		id: 3,
		name: 'Farmer',
		image: 'farmer',
		type: 'STARTER',

		cost: 0,
		actionCoins: 1,
		actionRepair: 1,
		actionRepairBonusFarm: 1,
		actionCalm: 0,
		actionAttack: 0,
		actionBonusText: '+1 when repairing the FARM'
	},
	{
		id: 10,
		name: 'Tax Collector',
		image: 'tax_collector',
		type: 'VILLAGER',

		cost: 2,
		actionCoins: 2,
		actionRepair: 0,
		actionCalm: 0,
		actionAttack: 0,
		canTrashFromDiscard: true,
		actionBonusText: 'May trash this card from discard'
	},
	{
		id: 11,
		name: 'Mercenary',
		image: 'mercenary',
		type: 'VILLAGER',

		cost: 2,
		actionCoins: 0,
		actionRepair: 1,
		actionCalm: 0,
		actionAttack: 2
	},
	{
		id: 12,
		name: 'Minstrel',
		image: 'minstrel',
		type: 'VILLAGER',

		cost: 2,
		actionCoins: 2,
		actionRepair: 0,
		actionCalm: 1,
		actionAttack: 0
	},
	{
		id: 13,
		name: 'Craftsman',
		image: 'craftsman',
		type: 'VILLAGER',

		cost: 3,
		actionCoins: 1,
		actionRepair: 2,
		actionRepairBonusFarm: 1,
		actionRepairBonusGate: 1,
		actionCalm: 0,
		actionAttack: 1,
		actionBonusText: '+1 when repairing FARM or GATE'
	},
	{
		id: 14,
		name: 'Mason',
		image: 'mason',
		type: 'VILLAGER',

		cost: 3,
		actionCoins: 1,
		actionRepair: 2,
		actionCalm: 0,
		actionAttack: 1,
		actionRepairBonusTower: 1,
		actionBonusText: '+1 when repairing TOWER'
	},
	{
		id: 15,
		name: 'Warden',
		image: 'warden',
		type: 'VILLAGER',

		cost: 3,
		actionCoins: 0,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 2
	},
	{
		id: 16,
		name: 'Druid',
		image: 'druid',
		type: 'VILLAGER',

		cost: 3,
		actionCoins: 0,
		actionRepair: 2,
		actionCalm: 2,
		actionAttack: 0
	},
	{
		id: 17,
		name: 'Druid',
		image: 'druid',
		type: 'VILLAGER',

		cost: 3,
		actionCoins: 0,
		actionRepair: 2,
		actionCalm: 2,
		actionAttack: 0
	},
	{
		id: 18,
		name: 'Rat Catcher',
		image: 'rat_catcher',
		type: 'VILLAGER',

		cost: 4,
		actionCoins: 1,
		actionRepair: 0,
		actionCalm: 2,
		actionAttack: 1
	},
	{
		id: 19,
		name: 'Blacksmith',
		image: 'blacksmith',
		type: 'VILLAGER',

		cost: 4,
		actionCoins: 1,
		actionRepair: 2,
		actionCalm: 0,
		actionAttack: 0,
		actionBonusAction: {type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {type:'UPDATE_ACTIVE_EFFECTS', effects: { multipleNextPlayedResource: {attack: 2}}}},
		actionBonusText: 'Double attack of next play'
	},
	{
		id: 20,
		name: 'Swindler',
		image: 'swindler',
		type: 'VILLAGER',

		cost: 4,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 1,
		actionBonusAction: {type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {type:'ADD_ACTIVE_EFFECTS', effects: { mayDrawCards: 1}}},
		actionBonusText: 'May draw 1 card'
	},
	{
		id: 21,
		name: 'Priest',
		image: 'priest',
		type: 'VILLAGER',

		cost: 4,
		actionCoins: 2,
		actionRepair: 0,
		actionCalm: 2,
		actionAttack: 1
	},
	{
		id: 22,
		name: 'Guardian',
		image: 'guardian',
		type: 'VILLAGER',

		cost: 5,
		actionCoins: 0,
		actionRepair: 2,
		actionCalm: 2,
		actionAttack: 2
	},
	{
		id: 23,
		name: 'Tinkerer',
		image: 'tinkerer',
		type: 'VILLAGER',

		cost: 5,
		actionCoins: 1,
		actionRepair: 3,
		actionCalm: 0,
		actionAttack: 1
	},
	{
		id: 24,
		name: 'Alchemist',
		image: 'alchemist',
		type: 'VILLAGER',

		cost: 6,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 2,
		actionBonusAction:: 'alchemist',
		actionBonusText: 'May trash a discarded card '
	},
	{
		id: 23,
		name: 'Champion',
		image: 'champion',
		type: 'VILLAGER',

		cost: 6,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 2,
		actionAttack: 3
	},
	{
		id: 101,
		name: 'Baroness',
		image: 'baroness',
		type: 'HERO',

		cost: 0,
		actionCoins: 4,
		actionRepair: 0,
		actionCalm: 0,
		actionAttack: 0
	},
	{
		id: 102,
		name: 'Engineer',
		image: 'engineer',
		type: 'HERO',

		cost: 0,
		actionCoins: 0,
		actionRepair: 4,
		actionCalm: 0,
		actionAttack: 0
	},
	{
		id: 103,
		name: 'Bishop',
		image: 'engineer',
		type: 'HERO',

		cost: 0,
		actionCoins: 0,
		actionRepair: 0,
		actionCalm: 3,
		actionAttack: 0
	},
	{
		id: 104,
		name: 'Knight',
		image: 'engineer',
		type: 'HERO',

		cost: 0,
		actionCoins: 0,
		actionRepair: 0,
		actionCalm: 0,
		actionAttack: 4
	},
	{
		id: 105,
		name: 'Traveler',
		image: 'traveler',
		type: 'HERO',

		cost: 0,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 1,
		actionBonusAction: {type: 'EXECUTE_GAME_STATE_UPDATE', gameStateAction: {type:'ADD_ACTIVE_EFFECTS', effects: { mayDrawCards: 2}}},
		actionBonusText: 'May draw 2 cards'
	}
]

export function getCitizenCard(id: number): IntCitizenCard {
	const cardNotFound: IntCitizenCard = {
		id,
		name: 'Not Found',
		image: 'not_found',
		type: 'DEBUG',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionAttack: 1,
		actionBonusText: `id=${id}`
	}

	return CITIZEN_CARD_LIST.find(it => it.id === id) ?? cardNotFound
}
