import {useId, type RefObject} from 'react'
import type {BuildingType, FearAction} from '@/GateComponents/Boards/gameStateReducer'
import { WaIcon, WaTooltip } from '@awesome.me/webawesome/dist/react'

function fearIcon(action: FearAction): {name: string, variant: string, tooltip?: string} {
	switch(action) {
		case 'DRAW_HERO': return {name: 'sun', variant: 'classic', tooltip: 'Draw Hero Card'}
		case 'DAMAGE_FARM': return {name: 'house', variant: 'regular', tooltip: '1 damage to Farm'}
		case 'DAMAGE_GATE': return {name: 'archway', variant: 'classic', tooltip: '1 damage to Gate'}
		case 'DAMAGE_TOWER': return {name: 'chess-rook', variant: 'regular', tooltip: '1 damage to Tower'}
		case 'NONE': return {name: '', variant: ''}
		case 'GAMEOVER': return {name: 'x', variant: 'classic', tooltip: 'Game Over'}
		default: return {name: 'question', variant: 'classic', tooltip: '?'}
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

// Pyramid row layout: each sub-array is a row (top→bottom), values are 0-based fearamid indices
const FEARAMID_ROWS = [[9], [7, 8], [4, 5, 6], [0, 1, 2, 3]] as const

function FearSlot({action, isActive}: {action: FearAction; isActive: boolean}) {
	const id = useId()
	const {name, variant, tooltip} = fearIcon(action)
	const border = isActive ? 'border-dashed border-white' : 'border-dashed border-gray-500' 
	return (
		<div className='relative'>
			<div
				id={id}
				className={[
					'flex h-[20px] w-[20px] items-center justify-center',
					'rounded-sm border text-sm',
					border,
					isActive ? 'bg-(--fearamid-color-highlight)' : ''
				].join(' ')}
			>
				<WaIcon name={name} variant={variant} />
			</div>
			{tooltip && <WaTooltip for={id} placement='top'>{tooltip}</WaTooltip>}
		</div>
	)
}

function Fearamid(props: {
	fear: number
	fearamid: FearAction[]
	onCalm?: () => undefined | undefined
	canCalm?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {fear, fearamid, onCalm, canCalm, divRef} = props
	const id = useId()
	let cn = [
		'h-[150px] w-[100px] flex flex-col',
		'items-center justify-center gap-[3px]',
		'bg-(--color-base-back-normal) text-(--color-base-text)',
		'outline-4'
	].join(' ')
	if (canCalm) {
		cn += ' cursor-pointer outline-(--color-outline-active) hover:outline-(--color-outline-active-hover)'
	} else {
		cn += ' outline-(--color-outline-normal) hover:outline-(--color-outline-normal-hover)'
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
					<div key={rowIdx} className='flex gap-[2px]'>
						{rowIndices.map(fearIdx => (
							<FearSlot
								key={fearIdx}
								action={fearamid[fearIdx] ?? 'NONE'}
								isActive={fearIdx === fear}
							/>
						))}
					</div>
				))}
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
	fearamid: FearAction[]
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
	fear,
	fearamid
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
				fearamid={fearamid}
				onCalm={() => {
					onCalm()
				}}
			/>
		</div>
	)
}
