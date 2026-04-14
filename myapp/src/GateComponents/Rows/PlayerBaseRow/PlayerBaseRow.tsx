import type {RefObject} from 'react'
import type {BuildingType} from '@/GateComponents/Boards/gameStateReducer'

function PlayerBaseCard(props: {
	name: string
	image: string
	health: number
	onRepair?: () => undefined | undefined
	canRepair?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {name, image, health, divRef, canRepair, onRepair} = props
	const cnBase = 'block h-[150px] w-[100px] bg-(--color-base-back-normal) text-(--color-base-text)'
	let cnOutline = 'outline-4 outline-color:var(--color-red)'
	if (canRepair) {
		cnOutline += ' outline-(--color-outline-active)'
		cnOutline += ' hover:outline-(--color-outline-active-hover)'
	} else {
		cnOutline += ' outline-(--color-outline-normal)'
		cnOutline += ' hover:outline-(--color-outline-normal-hover)'
	}
	return (
		<div
			className={`${cnBase} ${cnOutline}`}
			ref={divRef}
			{...(onRepair && canRepair ? {role: 'button', onClick: onRepair} : {})}
		>
			<div>{name}</div>
			<div>{image}</div>
			<div>{health}</div>
		</div>
	)
}

function Fearamid(props: {
	fear: number, 
	onCalm?: () => undefined | undefined
	canCalm?: boolean
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {fear, onCalm, canCalm, divRef} = props
	const cnBase = 'block h-[150px] w-[100px] bg-(--color-base-back-normal) text-(--color-base-text)'
	let cnOutline = 'outline-4 outline-color:var(--color-red)'
	if (canCalm) {
		cnOutline += ' outline-(--color-outline-active)'
		cnOutline += ' hover:outline-(--color-outline-active-hover)'
	} else {
		cnOutline += ' outline-(--color-outline-normal)'
		cnOutline += ' hover:outline-(--color-outline-normal-hover)'
	}
	return (
		<div 
			className={`${cnBase} ${cnOutline}`}
			ref={divRef}
			{...(onCalm && canCalm ? {role: 'button', onClick: onCalm} : {})} 
		>
			<div>Fearamid</div>
			<div>{`Fear: ${fear}`}</div>
		</div>
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
	farmHealth: number
	gateHealth: number
	towerHealth: number
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
	farmHealth,
	gateHealth,
	towerHealth
}: PlayerBaseRowProps) {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={farmRef}
				health={farmHealth}
				image='farm'
				name='Farm'
				onRepair={() => {
					onRepair('farm')
				}}
			/>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={gateRef}
				health={gateHealth}
				image='gate'
				name='Gate'
				onRepair={() => {
					onRepair('gate')
				}}
			/>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={towerRef}
				health={towerHealth}
				image='tower'
				name='Tower'
				onRepair={() => {
					onRepair('tower')
				}}
			/>
			<Fearamid 
				fear={0} 
				divRef={fearamidRef} 
				canCalm={canCalm}
				onCalm={() => {
					onCalm()
				}}
			/>
		</div>
	)
}
