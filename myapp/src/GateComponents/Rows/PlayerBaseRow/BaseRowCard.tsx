import {WaIcon, WaTooltip} from '@awesome.me/webawesome/dist/react'
import {type RefObject, useId} from 'react'
import type {BuildingType} from '@/GateComponents/Boards/gameStateReducer'

function HealthDice({health, maxHealth}: {health: number; maxHealth: number}) {
	const dice: {name: string; variant: string; color: string}[] = []
	let ch = health
	for (let i = maxHealth; i > 0; i -= 6) {
		if (ch > 6) {
			dice.push(die(6))
			ch -= 6
		} else if (ch > 0) {
			dice.push(die(ch))
			ch -= 6
		} else {
			dice.push(die(0))
		}
	}
	return (
		<div className='flex gap-[2px]'>
			{dice.map(({name, variant, color}) => (
				<WaIcon
					className={`text-3xl h-[20px] w-[20px] m-1 ${color}`}
					name={name}
					variant={variant}
				/>
			))}
		</div>
	)
}

function die(face: number): {name: string; variant: string; color: string} {
	const redDie = 'text-red-500 bg-white'
	const whiteDie = 'text-white'
	switch (face) {
		case 1:
			return {name: 'dice-one', variant: 'classic', color: redDie}
		case 2:
			return {name: 'dice-two', variant: 'classic', color: redDie}
		case 3:
			return {name: 'dice-three', variant: 'classic', color: redDie}
		case 4:
			return {name: 'dice-four', variant: 'classic', color: redDie}
		case 5:
			return {name: 'dice-five', variant: 'classic', color: redDie}
		case 6:
			return {name: 'dice-six', variant: 'classic', color: redDie}
		default:
			return {name: 'square', variant: 'regular', color: whiteDie}
	}
}

export function PlayerBaseCard(props: {
	name: string
	image: BuildingType
	health: number
	maxHealth: number
	onRepair?: () => undefined | undefined
	canRepair?: boolean
	isUnderAttack?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {
		name,
		image,
		health,
		maxHealth,
		divRef,
		canRepair,
		isUnderAttack,
		onRepair
	} = props
	const id = useId()
	let icon = {name: 'question', variant: 'classic'}
	let buildingText = ''
	const cnIcon = 'text-5xl'
	switch (image) {
		case 'farm':
			icon = {name: 'house', variant: 'regular'}
			buildingText = '+1 to first Recruit'
			break
		case 'gate':
			icon = {name: 'archway', variant: 'classic'}
			buildingText = 'Keep Alive'
			break
		case 'tower':
			icon = {name: 'chess-rook', variant: 'regular'}
			buildingText = '+1 to first Attack'
			break
	}
	const tooltipRepair = canRepair ? 'Repair 1' : undefined

	let cn = [
		'h-[150px] w-[100px] flex flex-col gap-1',
		'items-center justify-center',
		'bg-(--color-base-back-normal) text-(--color-base-text)',
		'outline-4 outline-color:var(--color-red)'
	].join(' ')
	if (canRepair) {
		cn += [
			' cursor-pointer',
			' outline-(--color-outline-active)',
			' hover:outline-(--color-outline-active-hover)'
		].join(' ')
	} else if (isUnderAttack) {
		cn +=
			' outline-(--color-outline-attackable) hover:outline-(--color-outline-attackable-hover)'
	} else {
		cn += [
			' cursor-pointer',
			' outline-(--color-outline-normal)',
			' hover:outline-(--color-outline-normal-hover)'
		].join(' ')
	}
	return (
		<>
			<div
				className={cn}
				id={id}
				ref={divRef}
				{...(onRepair && canRepair ? {role: 'button', onClick: onRepair} : {})}
			>
				<div className='text-2xl'>{name}</div>
				<WaIcon className={cnIcon} name={icon.name} variant={icon.variant} />
				<HealthDice health={health} maxHealth={maxHealth} />
				<div className='text-xs'>{buildingText} </div>
			</div>
			{tooltipRepair !== '' && (
				<WaTooltip for={id} placement='top'>
					{tooltipRepair}
				</WaTooltip>
			)}
		</>
	)
}
