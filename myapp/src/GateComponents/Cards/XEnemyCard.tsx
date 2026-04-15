import type {ReactElement, RefObject} from 'react'
import {useEffect, useLayoutEffect, useRef} from 'react'
import type {EnemyCardInstance} from '../Boards/gameStateReducer'

// Reuse the same animation keyframes as XCard
import '@/GateComponents/Cards/XEnemyCard.css'
import theme from '@/themes'
import {getEnemyCard, type IEnemyCard} from '../Data/EnemyCardsData'
import {EnemyValueBadge} from '../UIComponents/EnemyValueBadge'
import {ScaledName} from '../UIComponents/misc'

interface XEnemyCardProps {
	card: EnemyCardInstance
	onAnimationEnd?: () => void
	moveFrom?: {x: number; y: number} | undefined
	moveTo?: {x: number; y: number} | undefined
	isDiscarded?: boolean
	isAttackable?: boolean | undefined
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
	onAttack,
	className = ''
}: XEnemyCardProps) {
	const ref = useRef<HTMLElement>(null)
	const enemyInfo = getEnemyCard(card.cardId)

	const onAnimationEndRef = useRef(onAnimationEnd)
	onAnimationEndRef.current = onAnimationEnd

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

	useEffect(() => {
		if (!isDiscarded) return
		const el = ref.current
		if (!el) return

		const {
			durationMs,
			speedPxPerMs,
			gravityPxPerMs2,
			minRotationDeg,
			maxRotationDeg,
			opacityFadeStartProgress,
			keyframeSteps
		} = theme.enemyDiscard
		const sign = Math.random() < 0.5 ? 1 : -1
		const finalRotation =
			sign *
			(minRotationDeg + Math.random() * (maxRotationDeg - minRotationDeg))
		const vy = -speedPxPerMs

		const keyframes = Array.from({length: keyframeSteps + 1}, (_, i) => {
			const progress = i / keyframeSteps
			const t = progress * durationMs
			const y = vy * t + 0.5 * gravityPxPerMs2 * t * t
			const rotateDeg = progress * finalRotation
			const opacity =
				progress < opacityFadeStartProgress
					? 1
					: 1 -
						(progress - opacityFadeStartProgress) /
							(1 - opacityFadeStartProgress)
			return {
				transform: `translate(0px, ${y}px) rotate(${rotateDeg}deg)`,
				opacity,
				offset: progress
			}
		})

		const anim = el.animate(keyframes, {duration: durationMs, fill: 'forwards'})
		anim.onfinish = () => {
			onAnimationEndRef.current?.()
		}
		return () => {
			anim.cancel()
		}
	}, [isDiscarded])

	const outlineClass = isAttackable
		? 'outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover) cursor-pointer'
		: 'outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'

	const containerClass = [
		'flex h-[140px] w-[100px] shrink-0 flex-col items-start justify-start rounded-xl p-[5px] text-white text-left XENEMYCARD outline-4',
		'bg-(--color-enemy-card-face)',
		isDiscarded ? 'card-fade-out-animate' : '',
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
