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
import {gameRecordReducer, initialGameRecord} from '../Stats/gameRecordReducer'
import {makeBuildingActions} from './actions/buildingActions'
import {makeEnemyActions} from './actions/enemyActions'
import {makePlayerActions} from './actions/playerActions'
import {makeVillagerActions} from './actions/villagerActions'
import {gameStateReducer, initialState} from './gameStateReducer'
import {useSubActionQueue} from './useSubActionQueue'

export function useGameActions() {
	const [state, dispatch] = useReducer(gameStateReducer, initialState)
	const [gameRecord, recordDispatch] = useReducer(
		gameRecordReducer,
		initialGameRecord
	)

	const deckRef = useRef<HTMLDivElement>(null)
	const discardRef = useRef<HTMLDivElement>(null)
	const hDeckRef = useRef<HTMLDivElement>(null)
	const villageDeckRef = useRef<HTMLDivElement>(null)
	const eDeckRef = useRef<HTMLDivElement>(null)
	const enemySlotsRef = useRef<(HTMLDivElement | null)[]>([])
	const farmRef = useRef<HTMLDivElement>(null)
	const gateRef = useRef<HTMLDivElement>(null)
	const towerRef = useRef<HTMLDivElement>(null)
	const fearamidRef = useRef<HTMLDivElement>(null)

	const {
		enqueue,
		queue,
		signalAnimationComplete,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove,
		animatingFloatingText,
		animatingHeroToDiscard,
		animatingAttackVisualization,
		signalExileComplete
	} = useSubActionQueue(
		state,
		dispatch,
		recordDispatch,
		deckRef,
		discardRef,
		hDeckRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef,
		farmRef,
		gateRef,
		towerRef,
		fearamidRef
	)

	return {
		state,
		gameRecord,
		deckRef,
		discardRef,
		villageDeckRef,
		eDeckRef,
		enemySlotsRef,
		farmRef,
		gateRef,
		towerRef,
		fearamidRef,
		isProcessing,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove,
		animatingFloatingText,
		animatingHeroToDiscard,
		animatingAttackVisualization,
		signalExileComplete,
		hDeckRef,
		signalAnimationComplete,
		queue,
		...makePlayerActions(enqueue, dispatch, recordDispatch),
		...makeVillagerActions(enqueue),
		...makeEnemyActions(enqueue),
		...makeBuildingActions(enqueue)
	}
}
