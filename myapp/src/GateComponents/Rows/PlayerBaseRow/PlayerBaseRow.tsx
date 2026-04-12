import type {RefObject} from 'react'

function PlayerBaseCard(props: {
	name: string
	image: string
	health: number
	divRef?: RefObject<HTMLDivElement | null>
}) {
	const {name, image, health, divRef} = props
	return (
		<div className='block h-[150px] w-[100px] bg-black text-white' ref={divRef}>
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
	farmRef?: RefObject<HTMLDivElement | null>
	gateRef?: RefObject<HTMLDivElement | null>
	towerRef?: RefObject<HTMLDivElement | null>
}

export function PlayerBaseRow({
	farmRef,
	gateRef,
	towerRef
}: PlayerBaseRowProps) {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<PlayerBaseCard divRef={farmRef} health={6} image='farm' name='Farm' />
			<PlayerBaseCard divRef={gateRef} health={12} image='gate' name='Gate' />
			<PlayerBaseCard divRef={towerRef} health={6} image='tower' name='Tower' />
			<Fearamid fear={0} />
		</div>
	)
}
