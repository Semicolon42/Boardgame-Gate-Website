import {WaTab, WaTabGroup} from '@awesome.me/webawesome/dist/react'
import type {WaTabShowEvent} from '@awesome.me/webawesome/dist/react/tab-group/index.js'
import type {CSSProperties} from 'react'
import type {ActivePanel} from './GameLayout'

interface Props {
	onSelect: (panel: ActivePanel) => void
}

const navStyle: CSSProperties = {
	'--indicator-color': 'var(--color-outline-active)',
	'--track-color': 'var(--color-outline-normal)',
	'--track-width': '2px',
} as CSSProperties

export function GameNav({onSelect}: Props) {
	return (
		<WaTabGroup
			className='game-nav'
			style={navStyle}
			onWaTabShow={(e: WaTabShowEvent) => onSelect(e.detail.name as ActivePanel)}
		>
			<WaTab slot='nav' panel='game'>Game</WaTab>
			<WaTab slot='nav' panel='stats'>Stats</WaTab>
			<WaTab slot='nav' panel='tutorial'>How to Play</WaTab>
		</WaTabGroup>
	)
}
