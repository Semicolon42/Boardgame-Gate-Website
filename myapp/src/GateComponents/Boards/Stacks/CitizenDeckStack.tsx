import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {RefObject} from 'react'

import {cnStackTitle} from './stackStyles'

export function CitizenDeck(props: {
	ref: RefObject<HTMLDivElement | null>
	onViewDeck: () => void
}) {
	const {ref, onViewDeck} = props
	return (
		<div
			className='relative flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'
			onClick={onViewDeck}
			ref={ref}
			role='button'
		>
			<div className={cnStackTitle}>Village</div>
			<WaIcon className='text-6xl' name='dungeon' variant='classic' />
		</div>
	)
}
