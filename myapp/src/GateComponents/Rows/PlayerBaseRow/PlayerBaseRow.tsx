import {useId, type RefObject} from 'react'
import type {BuildingType, FearAction} from '@/GateComponents/Boards/gameStateReducer'
import { WaIcon, WaTooltip } from '@awesome.me/webawesome/dist/react'

function feaIcon(action: FearAction): {name: string, variant: string} {
	switch(action) {
		case 'DRAW_HERO': return {name: '', variant: ''}
		case 'DAMAGE_FARM': return {name: '', variant: ''}
		case 'DAMAGE_GATE': return {name: '', variant: ''}
		case 'DAMAGE_TOWER': return {name: '', variant: ''}
		case 'NONE': return {name: '', variant: ''}
		case 'GAMEOVER': return {name: '', variant: ''}
		default: return {name: '', variant: ''}
	}
}

function HealthDice({health, maxHealth}: {health: number; maxHealth: number}) {
	const dice: {name: string, variant: string, color: string}[] = []
	let ch = health
	for(let i = maxHealth; i > 0; i -= 6) {
		if (ch > 6) {
			dice.push(die(6))
			ch -= 6
		} else if(ch > 0) {
			dice.push(die(ch))
			ch -= 6
		} else {
			dice.push(die(0))
		}
	}
	return (
		<div className='flex gap-[2px]'>
			{dice.map(({name, variant, color}) => (
				<WaIcon name={name} variant={variant} className={'text-3xl h-[20px] w-[20px] m-1 ' + color}/>
			))}
		</div>
	)
}

function die(face: number): {name: string, variant: string, color: string} {
	const redDie = 'text-red-500 bg-white'
	const whiteDie = 'text-white'
	switch(face) {
		case 1: return {name: 'dice-one', variant: 'classic', color: redDie}
		case 2: return {name: 'dice-two', variant: 'classic', color: redDie}
		case 3: return {name: 'dice-three', variant: 'classic', color: redDie}
		case 4: return {name: 'dice-four', variant: 'classic', color: redDie}
		case 5: return {name: 'dice-five', variant: 'classic', color: redDie}
		case 6: return {name: 'dice-six', variant: 'classic', color: redDie}
		default: return {name: 'square', variant: 'regular', color: whiteDie}
	}
}

function PlayerBaseCard(props: {
	name: string
	image: BuildingType
	health: number
	maxHealth: number
	onRepair?: () => undefined | undefined
	canRepair?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {name, image, health, maxHealth, divRef, canRepair, onRepair} = props
	const id = useId()
	let icon = {name: 'question', variant: 'classic'}
	let buildingText = ''
	const cnIcon='text-5xl'
	switch(image) {
		case 'farm':
			icon = {name: 'house', variant: 'regular'}
			buildingText='+1 to first Recruit'
			break;
		case 'gate':
			icon = {name: 'archway', variant: 'classic'}
			buildingText='Keep Alive'
			break;
		case 'tower':
			icon = {name: 'chess-rook', variant: 'regular'}
			buildingText='+1 to first Attack'
			break;
	}
	let tooltipRepair = canRepair ? 'Repair 1' : undefined

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
				ref={divRef}
				id={id}
				{...(onRepair && canRepair ? {role: 'button', onClick: onRepair} : {})}
			>
				<div className='text-2xl'>{name}</div>
				<WaIcon name={icon.name} variant={icon.variant} className={cnIcon} />
				<HealthDice health={health} maxHealth={maxHealth} />
				<div className='text-xs'>{buildingText} </div>
			</div>
			{tooltipRepair !== '' && <WaTooltip for={id} placement='top'>{tooltipRepair}</WaTooltip>}
		</>
	)
}

function Fearamid(props: {
	fear: number
	onCalm?: () => undefined | undefined
	canCalm?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {fear, onCalm, canCalm, divRef} = props
	const id=useId()
	let cn = [
		'h-[150px] w-[100px] flex flex-col',
		'items-center justify-center gap-2',
		'bg-(--color-base-back-normal) text-(--color-base-text)',
		'outline-4 outline-color:var(--color-red)'
	].join(' ')
	if (canCalm) {
		cn += ' cursor-pointer outline-(--color-outline-active) hover:outline-(--color-outline-active-hover)'
	} else {
		cn += ' outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
	}
	return (
		<>
			<div
				className={`${cn}`}
				id={id}
				ref={divRef}
				{...(onCalm && canCalm ? {role: 'button', onClick: onCalm} : {})}
			>
				<div>Fearamid</div>
				<div>{`Fear: ${fear}`}</div>
			</div>
			{canCalm && <WaTooltip for={id} placement='top'>Calm 1</WaTooltip>}
		</>
	)
}

interface PlayerBaseRowProps {
	farmRef: RefObject<HTMLDivElement | null>
	gateRef: RefObject<HTMLDivElement | null>
	towerRef: RefObject<HTMLDivElement | null>
	fearamidRef: RefObject<HTMLDivElement | null>
	canRepair: boolean
	onRepair: (building: BuildingType) => void
	canCalm: boolean
	onCalm: () => void
	healthFarm: number
	healthMaxFarm: number
	healthGate: number
	healthGateMax: number
	healthTower: number
	healthTowerMax: number
	fear: number
}

export function PlayerBaseRow({
	farmRef,
	gateRef,
	towerRef,
	fearamidRef,
	onRepair,
	canRepair,
	canCalm,	
	onCalm,
	healthFarm,
	healthMaxFarm,
	healthGate,
	healthGateMax,
	healthTower,
	healthTowerMax,
	fear
}: PlayerBaseRowProps) {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={farmRef}
				health={healthFarm}
				maxHealth={healthMaxFarm}
				image='farm'
				name='Farm'
				onRepair={() => {
					onRepair('farm')
				}}
			/>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={gateRef}
				health={healthGate}
				maxHealth={healthGateMax}
				image='gate'
				name='Gate'
				onRepair={() => {
					onRepair('gate')
				}}
			/>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={towerRef}
				health={healthTower}
				maxHealth={healthTowerMax}
				image='tower'
				name='Tower'
				onRepair={() => {
					onRepair('tower')
				}}
			/>
			<Fearamid
				canCalm={canCalm}
				divRef={fearamidRef}
				fear={fear}
				onCalm={() => {
					onCalm()
				}}
			/>
		</div>
	)
}
