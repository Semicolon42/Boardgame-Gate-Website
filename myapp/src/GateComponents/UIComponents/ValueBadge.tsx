import {WaBadge, WaIcon} from '@awesome.me/webawesome/dist/react'
import type {ReactElement} from 'react'
import type {CardPlayType} from '../Cards/XCard'

export function ValueBadge(props: {
	value: string
	type: CardPlayType
	variant: 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'none'
}): ReactElement {
	const {value, type, variant} = props
	let icon: ReactElement | undefined = undefined
	switch (type) {
		case 'ATTACK':
			icon = <WaIcon name='arrow-trend-up' />
			break
		case 'COINS':
			icon = <WaIcon name='circle' variant='regular' />
			break
		case 'REPAIR':
			icon = <WaIcon name='plus' />
			break
		case 'CALM':
			icon = <WaIcon name='eye' variant='regular' />
			break
		default:
			icon = <WaIcon name='circle-question' variant='regular' />
	}

	return (
		<WaBadge
			appearance={variant === 'none' ? 'outlined' : 'filled'}
			className='text-base pl-2 pr-2'
			pill={true}
			variant={variant !== 'none' ? variant : 'neutral'}
		>
			{value}
			{icon}
		</WaBadge>
	)
}
