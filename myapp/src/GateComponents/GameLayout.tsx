import {usePostHog} from '@posthog/react'
import {useState, type CSSProperties} from 'react'
import {GameBoard} from './Boards/GameBoard'
import {GameStatsView} from './Stats/GameStatsView'
import {TutorialView} from './Tutorial/TutorialView'
import {WaTab, WaTabGroup, WaTabPanel} from '@awesome.me/webawesome/dist/react'
import type {WaTabShowEvent} from '@awesome.me/webawesome/dist/react/tab-group/index.js'

export type ActivePanel = 'game' | 'stats' | 'tutorial'

export function GameLayout() {
	const [activePanel, setActivePanel] = useState<ActivePanel>('game')
	const posthog = usePostHog()

	const select = (panel: ActivePanel) => {
		posthog?.capture('navbar', {nav: panel})
		setActivePanel(panel)
	}
	const navStyle: CSSProperties = {
		'--wa-color-neutral-on-quiet': 'var(--color-navigation-text)',
		'--indicator-color': 'var(--color-navigation-text-active)',
		'--track-color': 'var(--color-navigation-highlight)',
		'--track-width': '2px'
	} as CSSProperties

	return (
		<div className='flex flex-col h-dvh w-full max-w-2xl mx-auto'>
			<WaTabGroup
				className='game-nav'
				onWaTabShow={(e: WaTabShowEvent) => select(e.detail.name as ActivePanel)}
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
				<WaTabPanel name='game' >
					<GameBoard />
				</WaTabPanel>
				<WaTabPanel name='stats' >
					<GameStatsView isActive={activePanel === 'stats'} />
				</WaTabPanel>
				<WaTabPanel name='tutorial' >
					<TutorialView isActive={activePanel === 'tutorial'} />
				</WaTabPanel>
			</WaTabGroup>
		</div>
	)
}
