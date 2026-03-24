// ---------------------------------------------------------------------------
// Sub-action queue — sequences animated game sub-actions one at a time
// ---------------------------------------------------------------------------
//
// SubActions are units of work that wrap GameAction(s) + optional animation.
// The queue processes one sub-action at a time, waiting for each animation
// to complete (via signalAnimationComplete) before starting the next.
//
// Expander sub-actions (END_TURN, PLAYER_DRAW_N, etc.) are replaced inline
// with their expanded forms using current game state at expansion time — so
// DRAW_SINGLE_CARD can re-queue a shuffle if the deck runs dry mid-sequence.

import type {Dispatch, RefObject} from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {GameAction, GameState} from './gameStateReducer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubActionType =
	| 'DRAW_SINGLE_CARD'
	| 'DISCARD_SINGLE_CARD'
	| 'SHUFFLE_DISCARD_INTO_DECK'
	| 'SHUFFLE_DECK'
	| 'PLAYER_DRAW_N'
	| 'DISCARD_HAND'
	| 'END_TURN'

export interface SubAction {
	type: SubActionType
	/** Card ID — required for DISCARD_SINGLE_CARD */
	cardId?: number
	/** Draw count — used by PLAYER_DRAW_N */
	count?: number
}

/** Animation spec passed down to the component tree. */
export interface AnimatingCardSpec {
	cardId: number
	/** Enter animation: card slides FROM this screen position into its DOM slot. */
	moveFrom?: {x: number; y: number} | undefined
	/** Exit animation: card slides FROM its DOM slot TO this screen position. */
	moveTo?: {x: number; y: number} | undefined
}

// ---------------------------------------------------------------------------
// Pure expander
// ---------------------------------------------------------------------------

/**
 * Returns expanded sub-actions for high-level types, or null if the action
 * is already atomic and should be processed directly.
 */
function expandSubAction(
	action: SubAction,
	state: GameState
): SubAction[] | null {
	switch (action.type) {
		case 'END_TURN':
			return [
				...state.pHand.map<SubAction>(cardId => ({
					type: 'DISCARD_SINGLE_CARD',
					cardId
				})).reverse(),
				{type: 'PLAYER_DRAW_N', count: 3}
			]
		case 'DISCARD_HAND':
			return state.pHand.map<SubAction>(cardId => ({
				type: 'DISCARD_SINGLE_CARD',
				cardId
			}))
		case 'PLAYER_DRAW_N': {
			const count = action.count ?? 1
			return Array.from(
				{length: count},
				(): SubAction => ({type: 'DRAW_SINGLE_CARD'})
			)
		}
		case 'DRAW_SINGLE_CARD':
			if (state.pDeck.length === 0) {
				if (state.pDiscard.length === 0) return [] // nothing to draw
				// Deck empty — shuffle discard in, then retry the draw
				return [
					{type: 'SHUFFLE_DISCARD_INTO_DECK'},
					{type: 'SHUFFLE_DECK'},
					{type: 'DRAW_SINGLE_CARD'}
				]
			}
			return null // atomic
		default:
			return null // atomic
	}
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSubActionQueue(
	state: GameState,
	dispatch: Dispatch<GameAction>,
	deckRef: RefObject<HTMLDivElement | null>,
	discardRef: RefObject<HTMLDivElement | null>
) {
	const [queue, setQueue] = useState<SubAction[]>([])
	const [isAnimating, setIsAnimating] = useState(false)
	const [animatingCard, setAnimatingCard] = useState<AnimatingCardSpec | null>(
		null
	)

	// Track latest state in a ref to avoid stale closures inside the effect
	// without making `state` a dependency (which would re-run the effect on
	// every state change, not just queue/animation changes).
	const stateRef = useRef(state)
	stateRef.current = state

	// For exit animations (DISCARD_SINGLE_CARD): the state mutation is deferred
	// until after the animation so the card stays rendered during the slide.
	const pendingOnCompleteRef = useRef<(() => void) | null>(null)

	/**
	 * Call this from XCard's onAnimationEnd to advance the queue.
	 * Also runs any deferred dispatch (e.g. removing a discarded card from hand).
	 */
	const signalAnimationComplete = useCallback(() => {
		pendingOnCompleteRef.current?.()
		pendingOnCompleteRef.current = null
		setAnimatingCard(null)
		setIsAnimating(false)
		setQueue(q => q.slice(1))
	}, [])

	useEffect(() => {
		if (queue.length === 0 || isAnimating) return

		const head = queue[0]
		if (head === undefined) return

		const currentState = stateRef.current

		// Expanders: replace head with expanded actions; effect re-runs immediately
		const expanded = expandSubAction(head, currentState)
		if (expanded !== null) {
			setQueue(q => [...expanded, ...q.slice(1)])
			return
		}

		// Atomic actions
		const deckPos = deckRef.current?.getBoundingClientRect()
		const discardPos = discardRef.current?.getBoundingClientRect()

		switch (head.type) {
			case 'DRAW_SINGLE_CARD': {
				const cardId = currentState.pDeck[0]
				if (cardId === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				// Dispatch immediately — card appears in hand, then animates FROM deck
				dispatch({type: 'STACK_REMOVE_CARDS', stack: 'DECK', cardIds: [cardId]})
				dispatch({type: 'STACK_ADD_CARDS', stack: 'HAND', cardIds: [cardId]})
				setIsAnimating(true)
				setAnimatingCard({
					cardId,
					moveFrom: deckPos ? {x: deckPos.left, y: deckPos.top} : undefined
				})
				break
			}

			case 'DISCARD_SINGLE_CARD': {
				const {cardId} = head
				if (cardId === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				// Defer dispatch until after the exit animation — the card must remain
				// in state.pHand so it keeps rendering while it slides to the discard pile.
				pendingOnCompleteRef.current = () => {
					dispatch({
						type: 'MULTI_ACTION',
						actions: [
							{
								type: 'STACK_REMOVE_CARDS',
								stack: 'HAND',
								cardIds: [cardId]
							},
							{
								type: 'STACK_ADD_CARDS',
								stack: 'DISCARD',
								cardIds: [cardId]
							}
						]
					})
				}
				setIsAnimating(true)
				setAnimatingCard({
					cardId,
					moveTo: discardPos
						? {x: discardPos.left, y: discardPos.top}
						: undefined
				})
				break
			}

			case 'SHUFFLE_DISCARD_INTO_DECK': {
				const shuffled = [...currentState.pDiscard].sort(
					() => Math.random() - 0.5
				)
				dispatch({type: 'STACK_ADD_CARDS', stack: 'DECK', cardIds: shuffled})
				dispatch({type: 'STACK_CLEAR_ALL_CARDS', stack: 'DISCARD'})
				setQueue(q => q.slice(1))
				break
			}

			case 'SHUFFLE_DECK': {
				dispatch({type: 'STACK_SHUFFLE', stack: 'DECK'})
				setQueue(q => q.slice(1))
				break
			}
		}
	}, [queue, isAnimating, dispatch, deckRef, discardRef])

	const enqueue = useCallback((actions: SubAction[]) => {
		setQueue(q => [...q, ...actions])
	}, [])

	return {
		enqueue,
		signalAnimationComplete,
		/** True whenever the queue is non-empty (including mid-animation). */
		isProcessing: queue.length > 0,
		animatingCard
	}
}
