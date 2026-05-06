import {WaTab, WaTabGroup} from '@awesome.me/webawesome/dist/react'
import type {WaTabShowEvent} from '@awesome.me/webawesome/dist/react/tab-group/index.js'
import type {CSSProperties} from 'react'
import type {ActivePanel} from './GameLayout'

interface Props {
	onSelect: (panel: ActivePanel) => void
}

// updates the colors for the  
const navStyle: CSSProperties = {
	'--wa-color-neutral-on-quiet': 'var(--color-navigation-text)',
	'--indicator-color': 'var(--color-navigation-text-active)',
	'--track-color': 'var(--color-navigation-highlight)',
	'--track-width': '2px'
} as CSSProperties

export function GameNav({onSelect}: Props) {
	return (
		<WaTabGroup
			className='game-nav'
			onWaTabShow={(e: WaTabShowEvent) =>
				onSelect(e.detail.name as ActivePanel)
			}
			style={navStyle}
		>
			<WaTab panel='game' slot='nav'>
				Game
			</WaTab>
			<WaTab panel='stats' slot='nav'>
				Stats
			</WaTab>
			<WaTab panel='tutorial' slot='nav'>
				How to Play
			</WaTab>
		</WaTabGroup>
	)
}
