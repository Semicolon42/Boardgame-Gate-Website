import {XCard} from '@/GateComponents/Cards/XCard'

function PlayerBaseCard(props: {name: string; image: any; health: number}) {
	const {name, image, health} = props
	return (
		<div class='block h-[150px] w-[100px] bg-black text-white'>
			<div>{name}</div>
			<div>{image}</div>
			<div>{health}</div>
		</div>
	)
}

function Fearamid(props: {fear: number}) {
	const {fear} = props
	return (
		<div class='block h-[150px] w-[100px] bg-black text-white'>
			<div>Fearaid</div>
			<div>{`Fear: ${fear}`}</div>
		</div>
	)
}

export function PlayerBaseRow() {
	return (
		<div className='flex space-x-3 p-[2px]'>
			<PlayerBaseCard health={6} image='farm' name='Farm' />
			<PlayerBaseCard health={6} image='farm' name='Gate' />
			<PlayerBaseCard health={6} image='farm' name='Farm' />
			<Fearamid fear={3} />
		</div>
	)
}
