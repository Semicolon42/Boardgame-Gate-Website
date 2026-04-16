import type {ReactElement, RefObject} from 'react'
import {useRef} from 'react'
import type {EnemyCardInstance} from '../Boards/gameStateReducer'

// Reuse the same animation keyframes as XCard
import '@/GateComponents/Cards/XEnemyCard.css'
import {WaIcon} from '@awesome.me/webawesome/dist/react'
import theme from '@/themes'
import {getEnemyCard, type IEnemyCard} from '../Data/EnemyCardsData'
import {EnemyValueBadge} from '../UIComponents/EnemyValueBadge'
import {ScaledName} from '../UIComponents/misc'
import {useFallawayAnimation} from './useFallawayAnimation'
import {useSlideAnimation} from './useSlideAnimation'

interface XEnemyCardProps {
	card: EnemyCardInstance
	onAnimationEnd?: () => void
	moveFrom?: {x: number; y: number} | undefined
	moveTo?: {x: number; y: number} | undefined
	isDiscarded?: boolean
	isAttackable?: boolean | undefined
	isAttacking?: boolean | undefined
	onAttack?: ((enemy: EnemyCardInstance, amount: number) => void) | undefined
	/** CSS class injected by parent — used for grid-area stacking. */
	className?: string
}

function EnemyAttackValue(props: {enemyCard: IEnemyCard}) {
	const {enemyCard} = props
	const attackEntries = (['farm', 'gate', 'tower'] as const)
		.map(b => ({building: b, value: enemyCard.attack[b] ?? 0}))
		.filter(e => e.value > 0)
	const firstAttack = attackEntries[0]
	const typeMap = {farm: 'FARM', gate: 'GATE', tower: 'TOWER'} as const
	let divEnemyAttack: ReactElement | undefined
	if (attackEntries.length > 1 && firstAttack) {
		divEnemyAttack = (
			<EnemyValueBadge type='MULTI_ATTACK' value={`${firstAttack.value}`} />
		)
	} else if (firstAttack) {
		divEnemyAttack = (
			<EnemyValueBadge
				type={typeMap[firstAttack.building]}
				value={`${firstAttack.value}`}
			/>
		)
	}
	return divEnemyAttack
}

export function XEnemyCard({
	card,
	onAnimationEnd,
	moveFrom,
	moveTo,
	isDiscarded = false,
	isAttackable = false,
	isAttacking = false,
	onAttack,
	className = ''
}: XEnemyCardProps) {
	const ref = useRef<HTMLElement>(null)
	const enemyInfo = getEnemyCard(card.cardId)

	const onAnimationEndRef = useRef(onAnimationEnd)
	onAnimationEndRef.current = onAnimationEnd

	const slideSpec = moveFrom
		? {type: 'FROM' as const, pos: moveFrom}
		: moveTo
			? {type: 'TO' as const, pos: moveTo}
			: undefined
	useSlideAnimation(ref, slideSpec)
	useFallawayAnimation(
		ref,
		{...theme.enemyDiscard},
		isDiscarded,
		onAnimationEndRef
	)

	const outlineClass = isAttackable
		? 'outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover) cursor-pointer'
		: isAttacking
			? 'outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover)'
			: 'outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'

	const containerClass = [
		'flex flex-col h-[140px] w-[100px]',
		'shrink-0 items-start justify-start rounded-xl p-[5px] text-white text-left',
		'bg-(--color-enemy-card-face) outline-4',
		isDiscarded ? 'card-fade-out-animate' : '',
		outlineClass,
		className
	].join(' ')

	const inner = (
		<div className='w-full'>
			<div className='flex items-center gap-[4px] px-[5px]'>
				<ScaledName text={enemyInfo.name} />
				<div className='grid h-[22px] w-[22px] shrink-0 place-items-center'>
					<WaIcon
						className='[grid-area:1/1] text-lg color'
						name='star'
						variant='solid'
					/>
					<span className='text-stroke-enemy-vp text-sm font-extrabold text-black relative z-[1] [grid-area:1/1] leading-none [paint-order:stroke_fill]'>
						{enemyInfo.vp}
					</span>
				</div>
			</div>
			<div>
				<div className='flex flex-col w-[40px]'>
					<EnemyValueBadge type='HEALTH' value={`${card.health}`} />
					<EnemyAttackValue enemyCard={enemyInfo} />
					{enemyInfo.fear && (
						<EnemyValueBadge type='FEAR' value={`${enemyInfo.fear}`} />
					)}
				</div>
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
