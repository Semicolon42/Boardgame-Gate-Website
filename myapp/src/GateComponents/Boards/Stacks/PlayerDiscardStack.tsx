import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {ReactElement, RefObject} from 'react'
import {CardSlot} from '@/GateComponents/Boards/Stacks/CardSlot'
import type {CardInstance} from '../gameStateReducer'

import {cnStackTitle} from './stackStyles'

export function PlayerDiscard(props: {
	discard: CardInstance[]
	ref: RefObject<HTMLDivElement | null>
	onViewDiscard: () => void
	mayTrashFromDiscard: boolean
}): ReactElement {
	const {discard, ref, onViewDiscard, mayTrashFromDiscard} = props
	if (discard.length > 0) {
		return (
			<div
				className='relative flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-face) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'
				onClick={onViewDiscard}
				ref={ref}
				role='button'
			>
				<div className={cnStackTitle}>Discard</div>

				{mayTrashFromDiscard && (
					<div className='absolute bottom-0 text-xs text-(--color-card-text)'>
						Can Trash
						<WaIcon name='trash' variant='classic' />
					</div>
				)}
			</div>
		)
	}
	return <CardSlot ref={ref} title='Discard' />
}
