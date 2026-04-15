import {useId, type RefObject} from 'react'
import type {BuildingType, FearAction} from '@/GateComponents/Boards/gameStateReducer'
import { WaIcon, WaTooltip } from '@awesome.me/webawesome/dist/react'
import { PlayerBaseCard } from './BaseRowCard'
import { Fearamid } from './Fearamid'

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
