import {WaBadge, WaIcon} from '@awesome.me/webawesome/dist/react'
import type {ReactElement} from 'react'

export type EnemyValueBadgeType = 'HEALTH' | 'FARM' | 'GATE' | 'TOWER' | 'FEAR' | 'MULTI_ATTACK' | 'UNKNOWN'

export function EnemyValueBadge(props: {
	value: string
	type: EnemyValueBadgeType
}): ReactElement {
	const {value, type} = props
	let icon: ReactElement | undefined = undefined
	switch (type) {
		case 'HEALTH':
			icon = <WaIcon name='heart' variant='regular' />
			break;
		case 'FARM':
			icon = <WaIcon name='house' variant='regular' />
			break;
		case 'GATE':
			icon = <WaIcon name='dungeon' variant='classic'/>
			break;
		case 'TOWER':
			icon = <WaIcon name='chess-rook' variant='regular' />
			break;
		case 'FEAR':
			icon = <WaIcon name='eye' variant='regular' />
			break;
		case 'MULTI_ATTACK':
			icon = <WaIcon name='city' variant='regular' />
			break;
		case 'UNKNOWN':
			icon = <WaIcon name='question' variant='regular' />
			break;
		default:
			icon = <WaIcon name='circle-question' variant='regular' />
	}
	
	const cn: string = [
		'outline-2',
		'outline-transparent bg-transparent',
		'hover:outline-(--color-outline-active-hover)'
	].join(' ')

	return (
		<div className={cn}>
			{icon}
			{value}
		</div>
	)
}
