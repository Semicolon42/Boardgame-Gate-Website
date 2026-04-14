import type {RefObject} from 'react'
import {useLayoutEffect, useRef} from 'react'
import type {EnemyCardInstance} from '../Boards/gameStateReducer'

// Reuse the same animation keyframes as XCard
import '@/GateComponents/Cards/XEnemyCard.css'
import {getEnemyCard} from '../Data/EnemyCardsData'
import {ScaledName} from '../UIComponents/misc'

interface XEnemyCardProps {
	card: EnemyCardInstance
	onAnimationEnd?: () => void
	moveFrom?: {x: number; y: number} | undefined
	moveTo?: {x: number; y: number} | undefined
	isFadingOut?: boolean
	isAttackable?: boolean | undefined
	onAttack?: ((enemy: EnemyCardInstance, amount: number) => void) | undefined
	/** CSS class injected by parent — used for grid-area stacking. */
	className?: string
}

export function XEnemyCard({
	card,
	onAnimationEnd,
	moveFrom,
	moveTo,
	isFadingOut = false,
	isAttackable = false,
	onAttack,
	className = ''
}: XEnemyCardProps) {
	const ref = useRef<HTMLElement>(null)
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

	const outlineClass = isAttackable
		? 'outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover) cursor-pointer'
		: 'outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'

	const containerClass = [
		'flex h-[140px] w-[100px] shrink-0 flex-col items-start justify-start rounded-xl p-[5px] text-white text-left XENEMYCARD outline-4',
		'bg-(--color-enemy-card-face)',
		isFadingOut ? 'card-fade-out-animate' : '',
		outlineClass,
		className
	].join(' ')

	const inner = (
		<div>
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
	if (isAttackable && onAttack !== undefined) {
		return (
			<button
				className={containerClass}
				onAnimationEnd={onAnimationEnd}
				onClick={() => onAttack(card, 1)}
				ref={ref as RefObject<HTMLButtonElement>}
				type='button'
			>
				{inner}
			</button>
		)
	}

	return (
		<div
			className={containerClass}
			onAnimationEnd={onAnimationEnd}
			ref={ref as RefObject<HTMLDivElement>}
		>
			{inner}
		</div>
	)
}
