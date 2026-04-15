import {WaIcon, WaTooltip} from '@awesome.me/webawesome/dist/react'
import type {ReactElement} from 'react'
import {useId} from 'react'

export type EnemyValueBadgeType =
	| 'HEALTH'
	| 'FARM'
	| 'GATE'
	| 'TOWER'
	| 'FEAR'
	| 'MULTI_ATTACK'
	| 'UNKNOWN'

export function EnemyValueBadge(props: {
	value: string
	type: EnemyValueBadgeType
}): ReactElement {
	const {value, type} = props
	const id = useId()
	let icon: ReactElement | undefined = undefined
	let tooltipText: string | undefined = 'default'
	switch (type) {
		case 'HEALTH':
			icon = <WaIcon name='heart' variant='regular' />
			tooltipText = 'Health'
			break
		case 'FARM':
			icon = <WaIcon name='house' variant='regular' />
			tooltipText = 'Attacks the Farm'
			break
		case 'GATE':
			icon = <WaIcon name='archway' variant='classic' />
			tooltipText = 'Attacks the Gate'
			break
		case 'TOWER':
			icon = <WaIcon name='chess-rook' variant='regular' />
			tooltipText = 'Attacks the Tower'
			break
		case 'FEAR':
			icon = <WaIcon name='eye' variant='regular' />
			tooltipText = 'Causes Fear'
			break
		case 'MULTI_ATTACK':
			icon = <WaIcon name='chess' variant='classic' />
			tooltipText = 'Attacks all buildings'
			break
		case 'UNKNOWN':
			icon = <WaIcon name='question' variant='regular' />
			break
		default:
			icon = <WaIcon name='circle-question' variant='regular' />
	}

	const cn: string = ['outline-2', 'outline-transparent bg-transparent'].join(
		' '
	)

	return (
		<>
			<div className={cn} id={id}>
				{icon}
				{value}
			</div>
			{tooltipText && <WaTooltip for={id}>{tooltipText}</WaTooltip>}
		</>
	)
}
