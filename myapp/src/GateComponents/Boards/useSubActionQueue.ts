// ---------------------------------------------------------------------------
// Layer 2b: Sub-action queue hook — sequences animated sub-actions one at a time
// ---------------------------------------------------------------------------
//
// SubActionTypes are units of work that wrap GameAction(s) + optional animation.
// The queue processes one sub-action at a time, waiting for each animation
// to complete (via signalAnimationComplete) before starting the next.
//
// Domain logic (expanders + atomic handlers) lives in subactions/.

import type {Dispatch, RefObject} from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {GameAction, GameState} from './gameStateReducer'
import * as enemy from './subactions/enemySubActions'
import * as gameOverhead from './subactions/gameOverheadSubActions'
import * as playerCard from './subactions/playerCardSubActions'
import type {
	AnimatingCardSpec,
	AnimatingVillagerRowSpec,
	AtomicHandler,
	Expander,
	SubActionContext,
	SubActionType
} from './subactions/types'
import * as villager from './subactions/villagerSubActions'

// Re-export types consumed by the rest of the app
export type {
	AnimatingCardSpec,
	AnimatingVillagerRowSpec,
	EnqueueFn,
	SubActionType
} from './subactions/types'

// ---------------------------------------------------------------------------
// Registry — assembled once at module load time
// ---------------------------------------------------------------------------

const allExpanderActionHandlers: Partial<Record<SubActionType['type'], Expander>> = {
	...gameOverhead.expanders,
	...playerCard.expanders,
	...villager.expanders,
	...enemy.expanders
}

const allAtomicActionHandlers: Partial<Record<SubActionType['type'], AtomicHandler>> = {
	...gameOverhead.atomicHandlers,
	...playerCard.atomicHandlers,
	...villager.atomicHandlers,
	...enemy.atomicHandlers
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSubActionQueue(
	state: GameState,
	dispatch: Dispatch<GameAction>,
	deckRef: RefObject<HTMLDivElement | null>,
	discardRef: RefObject<HTMLDivElement | null>,
	villagerDeckRef: RefObject<HTMLDivElement | null>,
	eDeckRef: RefObject<HTMLDivElement | null>,
	enemySlotsRef: RefObject<(HTMLDivElement | null)[]>
) {
	const [queue, setQueue] = useState<SubActionType[]>([{type: 'ENQ_GAME_START'}])
	const [isAnimating, setIsAnimating] = useState(false)
	const [animatingCard, setAnimatingCard] = useState<AnimatingCardSpec | null>(null)
	const [animatingClearVillagerRow, setAnimatingClearVillagerRow] =
		useState<AnimatingVillagerRowSpec | null>(null)
	const [animatingEnemyShifts, setAnimatingEnemyShifts] = useState<
		Record<string, {x: number; y: number}>
	>({})
	const [animatingEnemyRemove, setAnimatingEnemyRemove] = useState<string | null>(null)

	// Track latest state in a ref to avoid stale closures inside the effect
	// without making `state` a dependency (which would re-run the effect on
	// every state change, not just queue/animation changes).
	const stateRef = useRef(state)
	stateRef.current = state

	// For exit animations: the state mutation is deferred until after the
	// animation so the card stays rendered during the slide/fade.
	const pendingOnCompleteRef = useRef<(() => void) | null>(null)

	/**
	 * Call this from a card's onAnimationEnd to advance the queue.
	 * Also runs any deferred dispatch (e.g. removing a card from state after its exit animation).
	 */
	const signalAnimationComplete = useCallback(() => {
		pendingOnCompleteRef.current?.()
		pendingOnCompleteRef.current = null
		setAnimatingCard(null)
		setAnimatingClearVillagerRow(null)
		setAnimatingEnemyShifts({})
		setAnimatingEnemyRemove(null)
		setIsAnimating(false)
		setQueue(q => q.slice(1))
	}, [])

	useEffect(() => {
		if (queue.length === 0 || isAnimating) return

		const head = queue[0]
		if (head === undefined) return
		const currentState = stateRef.current

		// Expand high-level (ENQ_*) sub-actions into atomic sequences.
		const expander = allExpanderActionHandlers[head.type]
		if (expander) {
			setQueue(q => [...(expander as Expander)(head, currentState), ...q.slice(1)])
			return
		}

		// Snapshot DOM positions before any dispatch — positions are from the pre-update DOM.
		const ctx: SubActionContext = {
			dispatch,
			currentState,
			setQueue,
			setIsAnimating,
			setAnimatingCard,
			setAnimatingClearVillagerRow,
			setAnimatingEnemyShifts,
			setAnimatingEnemyRemove,
			pendingOnCompleteRef,
			deckPos: deckRef.current?.getBoundingClientRect(),
			discardPos: discardRef.current?.getBoundingClientRect(),
			villagerDeckPos: villagerDeckRef.current?.getBoundingClientRect(),
			eDeckPos: eDeckRef.current?.getBoundingClientRect(),
			enemySlotsRef
		}

		const handler = allAtomicActionHandlers[head.type]
		if (handler) {
			;(handler as AtomicHandler)(head, ctx)
		} else {
			setQueue(q => q.slice(1))
		}
	}, [queue, isAnimating, dispatch, deckRef, discardRef, villagerDeckRef, eDeckRef, enemySlotsRef])

	const enqueue = useCallback((actions: SubActionType[]) => {
		setQueue(q => [...q, ...actions])
	}, [])

	return {
		enqueue,
		queue,
		signalAnimationComplete,
		/** True whenever the queue is non-empty (including mid-animation). */
		isProcessing: queue.length > 0,
		animatingCard,
		animatingClearVillagerRow,
		animatingEnemyShifts,
		animatingEnemyRemove
	}
}
