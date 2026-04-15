import {type RefObject} from 'react'
import type {BuildingType, FearAction} from '@/GateComponents/Boards/gameStateReducer'
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
	attackedTarget?: 'farm' | 'gate' | 'tower' | 'fearamid' | null
	fearamidAttacking?: boolean
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
	fearamid,
	attackedTarget,
	fearamidAttacking = false
}: PlayerBaseRowProps) {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<PlayerBaseCard
				canRepair={canRepair}
				divRef={farmRef}
				health={healthFarm}
				maxHealth={healthMaxFarm}
				image='farm'
				isUnderAttack={attackedTarget === 'farm'}
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
				isUnderAttack={attackedTarget === 'gate'}
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
				isUnderAttack={attackedTarget === 'tower'}
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
				isUnderAttack={attackedTarget === 'fearamid' || fearamidAttacking}
				onCalm={() => {
					onCalm()
				}}
			/>
		</div>
	)
}
