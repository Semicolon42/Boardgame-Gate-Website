// ---------------------------------------------------------------------------
// Layer 3: UI/animation orchestration — wires game logic + animation together
// ---------------------------------------------------------------------------
//
// This hook is the single entry point for GameBoard. It wires together:
//   - Layer 1: gameStateReducer (pure state machine)
//   - Layer 2: useGameStateActions (pure game logic)
//   - Animation: useDrawAnimation (animation state, scheduling, cleanup)

import {useReducer, useRef} from 'react'
import {type BuildingType, type GameAction, type GameState, gameStateReducer, initialState} from './gameStateReducer'

export function useGameActions() {
	const [state, dispatch] = useReducer(gameStateReducer, initialState)

	const deckRef = useRef<HTMLDivElement>(null)
	const discardRef = useRef<HTMLDivElement>(null)


/**
 * Computes the GameActions required to draw `n` cards from the player's deck,
 * including a discard-to-deck replenishment shuffle if needed.
 *
 * Returns:
 *   prepActions  — deck replenishment + STACK_REMOVE_CARDS (everything except
 *                  ADD_CARD_TO_HAND, which callers dispatch separately so they
 *                  can stagger animated draws or batch non-animated ones)
 *   drawnCardIds — ordered card IDs that will be drawn
 */
 function computeDrawCards(
		state: GameState,
		n: number
	): {
		prepActions: GameAction[]
		drawnCardIds: number[]
	} {
		const prepActions: GameAction[] = []

		// Take snapshots so we can compute without mutating state
		let deckSnapshot = [...state.pDeck]
		const discardSnapshot = [...state.pDiscard]

		// If deck can't satisfy the draw and discard has cards, shuffle discard
		// into deck. Shuffle is computed here (Math.random) — not via STACK_SHUFFLE
		// reducer action — to keep the reducer pure/deterministic.
		if (deckSnapshot.length < n && discardSnapshot.length > 0) {
			const shuffledDiscard = [...discardSnapshot].sort(() => Math.random() - 0.5)
			deckSnapshot = [...deckSnapshot, ...shuffledDiscard]

			prepActions.push({type: 'STACK_ADD_CARDS', stack: 'DECK', cardIds: shuffledDiscard})
			prepActions.push({type: 'STACK_CLEAR_ALL_CARDS', stack: 'DISCARD'})
		}

		// Draw up to n cards from front of (possibly replenished) deck
		const drawnCardIds = deckSnapshot.slice(0, n)

		if (drawnCardIds.length === 0) {
			return {prepActions: [], drawnCardIds: []}
		}

		prepActions.push({type: 'STACK_REMOVE_CARDS', stack: 'DECK', cardIds: drawnCardIds})

		return {prepActions, drawnCardIds}
	}

	/**
	 * drawCards (animated) — dispatches deck prep atomically, then hands off
	 * to useCardMoveFromAnimation to stagger ADD_CARD_TO_HAND actions so each
	 * card gets its own render and XCard moveFrom animation.
	 */
	const gameDrawCards = (n: number): void => {
		const {prepActions, drawnCardIds} = computeDrawCards(state, n)
		if (drawnCardIds.length === 0) return

		if (prepActions.length > 0) {
			dispatch({type: 'MULTI_ACTION', actions: prepActions})
		}
		dispatch({type: 'STACK_ADD_CARDS', stack: 'HAND', cardIds: drawnCardIds})
	}

	const gameEndTurn = (): void => {
		const START_HAND_SIZE = 3;
		let deck = []
		let actions: GameAction[] = [
				{type: 'STACK_ADD_CARDS', stack: 'DISCARD', cardIds: state.pHand},
				{type: 'STACK_CLEAR_ALL_CARDS', stack: 'HAND'}
			]
		if (state.pDeck.length < START_HAND_SIZE) { 
			deck = [...state.pDeck, ...state.pDiscard]
			actions.push({type: 'STACK_REMOVE_CARDS', stack: 'DISCARD', cardIds: state.pDiscard})
			actions.push({type: 'STACK_ADD_CARDS', stack: 'DECK', cardIds: state.pDiscard})
		} else {
			deck = [...state.pDeck]
		}
		deck = deck.sort(()=>.5-Math.random())
		let drawnCards = deck.slice(START_HAND_SIZE)
		actions.push({type: 'STACK_REMOVE_CARDS', stack: 'DECK', cardIds: drawnCards})
		actions.push({type: 'STACK_ADD_CARDS', stack: 'HAND', cardIds: drawnCards})
		dispatch({type: 'MULTI_ACTION', actions})
	}

	const clearActionLogs = (): void => {
		dispatch({type:'ACTION_LOGS_CLEAR'})
	}

	/** TODO: implement buy card logic */
	const buyCard = (_cardId: number): void => {
		// TODO
	}

	/** TODO: implement play card logic */
	const playCard = (_cardId: number): void => {
		// TODO
	}

	/** TODO: implement player attack enemy logic */
	const playerAttackEnemy = (_enemyId: number): void => {
		// TODO
	}

	/** TODO: implement player repair building logic */
	const playerRepairBuilding = (_building: BuildingType): void => {
		// TODO
	}

	/** TODO: implement player spend coin logic */
	const playerSpendCoin = (
		_coinAction: 'CALM' | 'ATTACK' | 'REPAIR' | 'REPLACE_BUY_ROW'
	): void => {
		// TODO
	}

	/** TODO: implement enemy attack building logic */
	const enemyAttackBuilding = (_building: BuildingType): void => {
		// TODO
	}

	/** TODO: implement enemy raise fear logic */
	const enemyRaiseFear = (): void => {
		// TODO
	}

	/** TODO: implement trigger fear effect logic */
	const triggerFearEffect = (): void => {
		// TODO
	}

	/** TODO: implement draw new enemy logic */
	const drawNewEnemy = (): void => {
		// TODO
	}

	/** TODO: implement enemy dies logic */
	const enemyDies = (_enemyId: number): void => {
		// TODO
	}

	/** TODO: implement add hero card to discard logic */
	const addHeroCardToDiscard = (): void => {
		// TODO
	}

	return {
		state,
		deckRef,
		gameDrawCards,
		gameEndTurn,
		buyCard,
		playCard,
		playerAttackEnemy,
		playerRepairBuilding,
		playerSpendCoin,
		enemyAttackBuilding,
		enemyRaiseFear,
		triggerFearEffect,
		drawNewEnemy,
		enemyDies,
		addHeroCardToDiscard,
		clearActionLogs,
	}
}

