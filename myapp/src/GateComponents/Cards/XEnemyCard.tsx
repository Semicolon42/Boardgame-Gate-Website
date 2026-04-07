import type {RefObject} from 'react'
import {useLayoutEffect, useRef} from 'react'
import type {EnemyCardInstance} from '../Boards/gameStateReducer'

// Reuse the same animation keyframes as XCard
import '@/GateComponents/Cards/XEnemyCard.css'
import { getEnemyCard } from '../Data/EnemyCardsData'
import { ScaledName } from '../UIComponents/misc'

interface XEnemyCardProps {
	card: EnemyCardInstance
	onAnimationEnd?: () => void
	moveFrom?: {x: number; y: number} | undefined
	moveTo?: {x: number; y: number} | undefined
	isFadingOut?: boolean
	/** CSS class injected by parent — used for grid-area stacking. */
	className?: string
}

export function XEnemyCard({
	card,
	onAnimationEnd,
	moveFrom,
	moveTo,
	isFadingOut = false,
	className = ''
}: XEnemyCardProps) {
	const ref = useRef<HTMLDivElement>(null)
	const enemyInfo = getEnemyCard(card.cardId)

	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		el.classList.remove('card-move-from-animate', 'card-move-to-animate')

		const rect = el.getBoundingClientRect()

		if (moveFrom) {
			el.style.setProperty('--slide-x', `${moveFrom.x - rect.left}px`)
			el.style.setProperty('--slide-y', `${moveFrom.y - rect.top}px`)
			el.classList.add('card-move-from-animate')
		} else if (moveTo) {
			el.style.setProperty('--slide-x', `${moveTo.x - rect.left}px`)
			el.style.setProperty('--slide-y', `${moveTo.y - rect.top}px`)
			el.classList.add('card-move-to-animate')
		}
	}, [moveFrom, moveTo])

	return (
		<div
			className={`flex h-[140px] w-[100px] shrink-0 flex-col items-start rounded-xl bg-red-800 p-[5px] text-white XENEMYCARD ${isFadingOut ? 'card-fade-out-animate' : ''} ${className} outline-4 outline-black`}
			onAnimationEnd={onAnimationEnd}
			ref={ref as RefObject<HTMLDivElement>}
		>
			<div className='flex items-center gap-[4px] px-[5px] w-full'>
				<ScaledName text={enemyInfo.name} />
				<div className='flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-gray-700 bg-white font-bold text-xs text-black'>
					{enemyInfo.stars}
				</div>
			</div>
			<div>
				<div className='text-xs'>Type: {card.cardId}</div>
				<div className='text-xs'>HP: {card.health}</div>
			</div>
		</div>
	)
}
