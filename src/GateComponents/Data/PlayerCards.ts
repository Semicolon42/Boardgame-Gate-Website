export interface iCitizenCard {
	id: number
	name: string
	image: string

	cost: number
	actionCoins: number
	actionRepair: number
	actionCalm: number
	actionFight: number
	actionBonusId?: string
	actionBonusText?: string
}

export const CITIZEN_CARD_LIST: iCitizenCard[] = [
	{
		id: 0,
		name: 'Generic',
		image: 'generic',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionFight: 1
	},
	{
		id: 1,
		name: 'Generic',
		image: 'generic',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionFight: 1
	},
	{
		id: 2,
		name: 'Generic',
		image: 'generic',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionFight: 1
	},
	{
		id: 3,
		name: 'Generic',
		image: 'generic',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionFight: 1
	}
]

export function GET_CITIZEN_CARD(id: number): iCitizenCard {
	const cardNotFound: iCitizenCard = {
		id,
		name: 'Not Found',
		image: 'not_found',

		cost: 3,
		actionCoins: 1,
		actionRepair: 1,
		actionCalm: 1,
		actionFight: 1,
		actionBonusText: 'id=' + id
	}

	return CITIZEN_CARD_LIST.find(it => it.id === id) ?? cardNotFound
}
