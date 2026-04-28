import {WaIcon} from '@awesome.me/webawesome/dist/react'
import type {RefObject} from 'react'
import {CardSlot} from '@/GateComponents/Boards/Stacks/CardSlot'
import type {CardInstance} from '../gameStateReducer'

import {cnStackTitle} from './stackStyles'

export function PlayerDeck(props: {
	deck: CardInstance[]
	deckRef: RefObject<HTMLDivElement | null>
	mayDrawCards: number
	onDrawBonusCard: () => void
	onViewDeck: () => void
}) {
	const {deck, deckRef, mayDrawCards, onDrawBonusCard, onViewDeck} = props

	if (deck?.length === 0) {
		if (mayDrawCards > 0) {
			return (
				<CardSlot
					bottomText={`May Draw ${mayDrawCards}`}
					onClick={onDrawBonusCard}
					ref={deckRef}
					title='Deck'
				/>
			)
		}
		return <CardSlot ref={deckRef} title='Deck' />
	}

	const containerClass =
		'relative flex flex-col h-[140px] w-[100px] items-center justify-center rounded-xl bg-(--color-card-back) text-(--color-card-text) outline-4 outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover) cursor-pointer'

	if (mayDrawCards > 0) {
		return (
			<div className={containerClass} ref={deckRef}>
				{/* Top half — open deck dialog */}
				<div
					className='absolute top-0 left-0 right-0 h-1/2 z-10'
					onClick={onViewDeck}
					role='button'
				/>
				{/* Bottom half — draw bonus card; named peer drives text highlight */}
				<div
					className='peer/bottom absolute bottom-0 left-0 right-0 h-1/2 z-10'
					onClick={onDrawBonusCard}
					role='button'
				/>
				<div className={cnStackTitle}>Deck</div>
				<WaIcon className='text-6xl' name='dungeon' variant='classic' />
				<div className='absolute bottom-1 w-full text-center text-xs peer-hover/bottom:font-bold pointer-events-none'>
					May Draw {mayDrawCards}
				</div>
			</div>
		)
	}

	return (
		<div
			className={containerClass}
			onClick={onViewDeck}
			ref={deckRef}
			role='button'
		>
			<div className={cnStackTitle}>Deck</div>
			<WaIcon className='text-6xl' name='dungeon' variant='classic' />
		</div>
	)
}
