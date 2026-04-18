
import type { RefObject } from 'react'
import { WaIcon } from '@awesome.me/webawesome/dist/react'
import { CardSlot } from '@/GateComponents/Boards/Stacks/CardSlot'
import {cnStackTitle} from './stackStyles'

export function HeroDeck(props: {
	cardsRemaining: number
	hDeckRef?: RefObject<HTMLDivElement | null> | undefined
	onViewHeroDeck?: (() => void) | undefined
}) {
	const {cardsRemaining, hDeckRef, onViewHeroDeck} = props
	if (cardsRemaining === 0) {
		return <CardSlot />
	}
	const cn = [
		'flex flex-col h-[140px] w-[100px] items-center justify-center gap-2',
		'bg-(--color-card-back) text-(--color-card-text) rounded-xl',
		'outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)',
		onViewHeroDeck ? 'cursor-pointer' : ''
	].join(' ')

	return (
		<div
			className={cn}
			ref={hDeckRef}
			{...(onViewHeroDeck ? {role: 'button', onClick: onViewHeroDeck} : {})}
		>
			<div className={cnStackTitle}>Hero</div>
			<WaIcon className='text-6xl' name='dungeon' variant='classic' />
		</div>
	)
}