import {WaIcon, WaTooltip} from '@awesome.me/webawesome/dist/react'
import {type RefObject, useId} from 'react'
import type {FearAction} from '@/GateComponents/Boards/gameStateReducer'

function fearIcon(action: FearAction): {
	name: string
	variant: string
	tooltip?: string
} {
	switch (action) {
		case 'DRAW_HERO':
			return {name: 'sun', variant: 'classic', tooltip: 'Draw Hero Card'}
		case 'DAMAGE_FARM':
			return {name: 'house', variant: 'regular', tooltip: '1 damage to Farm'}
		case 'DAMAGE_GATE':
			return {name: 'archway', variant: 'classic', tooltip: '1 damage to Gate'}
		case 'DAMAGE_TOWER':
			return {
				name: 'chess-rook',
				variant: 'regular',
				tooltip: '1 damage to Tower'
			}
		case 'NONE':
			return {name: '', variant: ''}
		case 'GAMEOVER':
			return {name: 'x', variant: 'classic', tooltip: 'Game Over'}
		default:
			return {name: 'question', variant: 'classic', tooltip: '?'}
	}
}

// Pyramid row layout: each sub-array is a row (top→bottom), values are 0-based fearamid indices
const FEARAMID_ROWS = [[9], [7, 8], [4, 5, 6], [0, 1, 2, 3]] as const

function FearSlot({action, isActive}: {action: FearAction; isActive: boolean}) {
	const id = useId()
	const {name, variant, tooltip} = fearIcon(action)
	const border = isActive
		? 'border-dashed border-white'
		: 'border-dashed border-gray-500'
	return (
		<div className='relative'>
			<div
				className={[
					'flex h-[20px] w-[20px] items-center justify-center',
					'rounded-sm border text-sm',
					border,
					isActive ? 'bg-(--fearamid-color-highlight)' : ''
				].join(' ')}
				id={id}
			>
				<WaIcon name={name} variant={variant} />
			</div>
			{tooltip && (
				<WaTooltip for={id} placement='top'>
					{tooltip}
				</WaTooltip>
			)}
		</div>
	)
}

export function Fearamid(props: {
	fear: number
	fearamid: FearAction[]
	onCalm?: () => undefined | undefined
	canCalm?: boolean
	isUnderAttack?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {fear, fearamid, onCalm, canCalm, isUnderAttack, divRef} = props
	const id = useId()
	let cn = [
		'h-[150px] w-[100px] flex flex-col',
		'items-center justify-center gap-[3px]',
		'bg-(--color-base-back-normal) text-(--color-base-text)',
		'outline-4'
	].join(' ')
	if (canCalm) {
		cn +=
			' cursor-pointer outline-(--color-outline-active) hover:outline-(--color-outline-active-hover)'
	} else if (isUnderAttack) {
		cn +=
			' outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover)'
	} else {
		cn +=
			' outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
	}
	return (
		<>
			<div
				className={cn}
				id={id}
				ref={divRef}
				{...(onCalm && canCalm ? {role: 'button', onClick: onCalm} : {})}
			>
				<div className='text-xs'>Fearamid</div>
				{FEARAMID_ROWS.map((rowIndices, rowIdx) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: stable positional row
					<div className='flex gap-[2px]' key={rowIdx}>
						{rowIndices.map(fearIdx => (
							<FearSlot
								action={fearamid[fearIdx] ?? 'NONE'}
								isActive={fearIdx === fear}
								key={fearIdx}
							/>
						))}
					</div>
				))}
			</div>
			{canCalm && (
				<WaTooltip for={id} placement='top'>
					Calm 1
				</WaTooltip>
			)}
		</>
	)
}
