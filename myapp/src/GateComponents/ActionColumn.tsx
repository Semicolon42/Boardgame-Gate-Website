import React, { type ReactElement } from "react"
import { type GameAction } from "./Boards/gameStateReducer"


function ActionCard(display: string): ReactElement {
	return <div className="bg-blue-200 border-2 rounded-xl">
		{display}
	</div>
}

function convertActionCards(action: GameAction): ReactElement[] {
	switch(action.type) {
		case 'MULTI_ACTION': {
			return [
				ActionCard(' --- MULTIACTION START'),
				...action.actions.flatMap((act)=>convertActionCards(act)),
				ActionCard(' --- MULTIACTION END')
			]
		}
		case 'STACK_ADD_CARDS':
		case 'STACK_REMOVE_CARDS':
		case 'STACK_CLEAR_ALL_CARDS':
		case 'STACK_SHUFFLE':
		case 'BUILDING_CHANGE_HEALTH':
		case 'ACTION_LOGS_CLEAR':
			return [
				ActionCard(JSON.stringify(action))
			]
	}
	return [ActionCard(`ERROR -- ${JSON.stringify(action)}`)]
}


export interface ActionColumnProps {
	actionLog: GameAction[],
}

export function ActionColumn({ actionLog }: ActionColumnProps) {
	return (
		<div>
			{actionLog.map((act)=>convertActionCards(act))}
		</div>
	)
}