import type {ReactElement} from 'react'
import type {GameAction} from './Boards/gameStateReducer'

function ActionCard(display: string): ReactElement {
	return (
		<div className='rounded-xl border-2 bg-blue-200 text-xs'>{display}</div>
	)
}

function convertActionCards(action: GameAction): ReactElement[] {
	switch (action.type) {
		case 'MULTI_ACTION': {
			return [
				ActionCard(' --- MULTI_ACTION START'),
				...action.actions.flatMap(act => convertActionCards(act)),
				ActionCard(' --- MULTI_ACTION END')
			]
		}
		case 'STACK_ADD_CARDS':
		case 'STACK_REMOVE_CARDS':
		case 'STACK_CLEAR_ALL_CARDS':
		case 'STACK_SHUFFLE':
		case 'BUILDING_CHANGE_HEALTH':
		case 'ACTION_LOGS_CLEAR':
			return [ActionCard(JSON.stringify(action))]
	}
	return [ActionCard(`UNHANDLED LOG -- ${JSON.stringify(action)}`)]
}

export interface ActionColumnProps {
	actionLog: GameAction[]
}

export function ActionColumn({actionLog}: ActionColumnProps) {
	return (
		<div className='sticky top-0 h-screen min-w-48 overflow-y-auto'>
			{actionLog.map(act => convertActionCards(act))}
		</div>
	)
}
