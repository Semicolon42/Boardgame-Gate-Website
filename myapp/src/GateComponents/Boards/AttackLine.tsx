import type {RefObject} from 'react'
import type {EnemyCardInstance} from './gameStateReducer'
import type {AttackVisualizationSpec} from './useSubActionQueue'

interface AttackLineProps {
	spec: AttackVisualizationSpec
	enemySlotsRef: RefObject<(HTMLDivElement | null)[]>
	enemyCards: EnemyCardInstance[]
	enemyRowMax: number
	farmRef: RefObject<HTMLDivElement | null>
	gateRef: RefObject<HTMLDivElement | null>
	towerRef: RefObject<HTMLDivElement | null>
	fearamidRef: RefObject<HTMLDivElement | null>
}

export function AttackLine({
	spec,
	enemySlotsRef,
	enemyCards,
	enemyRowMax,
	farmRef,
	gateRef,
	towerRef,
	fearamidRef
}: AttackLineProps) {
	let sourceRect: DOMRect | undefined
	if (spec.attackSource.kind === 'ENEMY') {
		const idx = enemyCards.findIndex(c => c.instanceId === spec.attackSource.instanceId)
		const offset = enemyRowMax - enemyCards.length
		const el = idx >= 0 ? enemySlotsRef.current[offset + idx] : null
		sourceRect = el?.getBoundingClientRect()
	} else {
		sourceRect = fearamidRef.current?.getBoundingClientRect()
	}

	const targetRef =
		spec.attackTarget.kind === 'BUILDING_FARM'
			? farmRef
			: spec.attackTarget.kind === 'BUILDING_GATE'
				? gateRef
				: spec.attackTarget.kind === 'BUILDING_TOWER'
					? towerRef
					: fearamidRef
	const targetRect = targetRef.current?.getBoundingClientRect()

	if (!sourceRect || !targetRect) return null

	return (
		<svg
			style={{
				position: 'fixed',
				inset: 0,
				width: '100vw',
				height: '100vh',
				pointerEvents: 'none',
				zIndex: 9990
			}}
		>
			<line
				x1={sourceRect.left + sourceRect.width / 2}
				y1={sourceRect.top + sourceRect.height / 2}
				x2={targetRect.left + targetRect.width / 2}
				y2={targetRect.top + targetRect.height / 2}
				stroke='rgb(200, 0, 0)'
				strokeWidth={4}
				strokeLinecap='round'
			/>
		</svg>
	)
}
