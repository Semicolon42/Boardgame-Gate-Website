// ---------------------------------------------------------------------------
// Layer 3: UI/animation orchestration — wires game logic + animation together
// ---------------------------------------------------------------------------
//
// This hook is the single entry point for GameBoard. It wires together:
//   - Layer 1: gameStateReducer (pure state machine)
//   - Layer 2: useSubActionQueue (animated sub-action sequencing)
//
// Action logic is split by domain into actions/ — each is a plain factory
// function (not a hook) that closes over enqueue/dispatch.

import {useReducer, useRef} from 'react'
import {gameStateReducer, initialState} from './gameStateReducer'
import {useSubActionQueue} from './useSubActionQueue'
import {makeBuildingActions} from './actions/buildingActions'
import {makeEnemyActions} from './actions/enemyActions'
import {makePlayerActions} from './actions/playerActions'
import {makeVillagerActions} from './actions/villagerActions'

export function useGameActions() {
	const [state, dispatch] = useReducer(gameStateReducer, initialState)

	const deckRef = useRef<HTMLDivElement>(null)
	const discardRef = useRef<HTMLDivElement>(null)
	const villageDeckRef = useRef<HTMLDivElement>(null)
	const eDeckRef = useRef<HTMLDivElement>(null)
	const enemySlotsRef = useRef<(HTMLDivElement | null)[]>([])

	const {
		enqueue,
		queue,
		signalAnimationComplete,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove
	} = useSubActionQueue(
		state,
		dispatch,
		deckRef,
		discardRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef
	)

	return {
		state,
		deckRef,
		discardRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove,
		signalAnimationComplete,
		queue,
		...makePlayerActions(enqueue, dispatch),
		...makeVillagerActions(enqueue),
		...makeEnemyActions(enqueue),
		...makeBuildingActions(enqueue)
	}
}
