import {usePostHog} from '@posthog/react'
import {useState} from 'react'
import {GameBoard} from './Boards/GameBoard'
import {GameNav} from './GameNav'
import {GameStatsView} from './Stats/GameStatsView'
import {TutorialView} from './Tutorial/TutorialView'

export type ActivePanel = 'game' | 'stats' | 'tutorial'

function viewClasses(isActive: boolean) {
	return [
		'absolute inset-0 overflow-auto transition-opacity duration-200',
		isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
	].join(' ')
}

export function GameLayout() {
	const [activePanel, setActivePanel] = useState<ActivePanel>('game')
	const posthog = usePostHog()

	const select = (panel: ActivePanel) => {
		posthog?.capture('navbar', {nav: panel})
		setActivePanel(panel)
	}

	return (
		<div className='flex flex-col h-dvh'>
			<GameNav onSelect={select} />
			{/*
			 * All three views stay mounted so game state is never lost on navigation.
			 * Switching views is a CSS opacity fade — no layout reflow or resize.
			 */}
			<div className='relative flex-1 overflow-hidden'>
				<div className={viewClasses(activePanel === 'game')}>
					<GameBoard />
				</div>
				<div className={viewClasses(activePanel === 'stats')}>
					<GameStatsView isActive={activePanel === 'stats'} />
				</div>
				<div className={viewClasses(activePanel === 'tutorial')}>
					<TutorialView isActive={activePanel === 'tutorial'} />
				</div>
			</div>
		</div>
	)
}
