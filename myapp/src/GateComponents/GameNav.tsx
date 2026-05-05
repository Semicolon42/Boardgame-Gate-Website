import {WaButton} from '@awesome.me/webawesome/dist/react'
import type {ActivePanel} from './GameLayout'

interface Props {
	activePanel: ActivePanel
	onSelect: (panel: ActivePanel) => void
}

export function GameNav({activePanel, onSelect}: Props) {
	return (
		<nav className='flex gap-2 p-2 border-b'>
			<WaButton
				appearance={activePanel === 'game' ? 'filled' : 'outlined'}
				onClick={() => onSelect('game')}
				variant='brand'
			>
				Game
			</WaButton>
			<WaButton
				appearance={activePanel === 'stats' ? 'filled' : 'outlined'}
				onClick={() => onSelect('stats')}
				variant='neutral'
			>
				Stats
			</WaButton>
			<WaButton
				appearance={activePanel === 'tutorial' ? 'filled' : 'outlined'}
				onClick={() => onSelect('tutorial')}
				variant='neutral'
			>
				How to Play
			</WaButton>
		</nav>
	)
}
