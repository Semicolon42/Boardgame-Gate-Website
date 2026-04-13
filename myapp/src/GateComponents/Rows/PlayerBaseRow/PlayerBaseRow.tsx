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
	const cnBase = 'block h-[150px] w-[100px] bg-black text-white'
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

function Fearamid(props: {fear: number}) {
	const {fear} = props
	return (
		<div className='block h-[150px] w-[100px] bg-black text-white'>
			<div>Fearamid</div>
			<div>{`Fear: ${fear}`}</div>
		</div>
	)
}

interface PlayerBaseRowProps {
	farmRef: RefObject<HTMLDivElement | null>
	gateRef: RefObject<HTMLDivElement | null>
	towerRef: RefObject<HTMLDivElement | null>
	onRepair: (building: BuildingType) => void
	canRepair: boolean
	farmHealth: number
	gateHealth: number
	towerHealth: number
}

export function PlayerBaseRow({
	farmRef,
	gateRef,
	towerRef,
	onRepair,
	canRepair,
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
			<Fearamid fear={0} />
		</div>
	)
}
