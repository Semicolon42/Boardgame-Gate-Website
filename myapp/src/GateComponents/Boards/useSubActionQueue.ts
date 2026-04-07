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
// PLAYER_DRAW_SINGLE_CARD can re-queue a shuffle if the deck runs dry mid-sequence.

import type {Dispatch, RefObject} from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {CardPlayType} from '../Cards/XCard'
import {getCitizenCard} from '../Data/PlayerCards'
import type {
	CardInstance,
	EnemyCardInstance,
	GameAction,
	GameState
} from './gameStateReducer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubActionType =
	| 'ENQ_PLAYER_PLAY_CARD'
	| 'ENQ_PLAYER_DRAW_SINGLE_CARD'
	| 'ENQ_PLAYER_DRAW_N'
	| 'ENQ_DISCARD_HAND'
	| 'ENQ_VILLAGER_DRAW_SINGLE_CARD'
	| 'ENQ_VILLAGER_ROW_CLEAR'
	| 'ENQ_VILLAGER_ROW_FILL'
	| 'ENQ_VILLAGER_ROW_BUY_CARD'
	| 'ENQ_END_TURN'
	| 'PLAYER_DRAW_CARD'
	| 'PLAYER_DISCARD_SINGLE_CARD'
	| 'PLAYER_SHUFFLE_DISCARD_INTO_DECK'
	| 'PLAYER_SHUFFLE_SHUFFLE_DECK'
	| 'VILLAGER_SHUFFLE_DISCARD_INTO_DECK'
	| 'VILLAGER_SHUFFLE_DECK'
	| 'VILLAGER_ROW_CLEAR'
	| 'VILLAGER_ROW_DRAW_CARD'
	| 'VILLAGER_ROW_BUY_CARD'
	| 'EXECUTE_GAMTE_STATE_UPDATE'
	| 'ENQ_ENEMY_DRAW_SINGLE_CARD'
	| 'ENEMY_ROW_REMOVE_OLDEST'
	| 'ENEMY_ROW_DRAW_CARD'

export interface SubAction {
	type: SubActionType
	/** Single card instance — carries both identity and type for draw/discard/play */
	card?: CardInstance | undefined
	/** Draw count — used by ENQ_PLAYER_DRAW_N */
	count?: number | undefined
	/** Multiple card instances — used by VILLAGER_ROW_CLEAR */
	cards?: CardInstance[] | undefined
	/** How the card was played — used by ENQ_PLAYER_PLAY_CARD */
	cardPlayType?: CardPlayType | undefined
	/** Game state action to dispatch — used by EXECUTE_GAMTE_STATE_UPDATE */
	gameStateAction?: GameAction | undefined
	/** Enemy card instance — used by ENEMY_ROW_DRAW_CARD */
	enemyCard?: EnemyCardInstance | undefined
}

/** Animation spec passed down to the component tree. */
export interface AnimatingCardSpec {
	type: 'PLAYER' | 'ENEMY' | 'VILLAGER'
	instanceId: string
	/** Enter animation: card slides FROM this screen position into its DOM slot. */
	moveFrom?: {x: number; y: number} | undefined
	/** Exit animation: card slides FROM its DOM slot TO this screen position. */
	moveTo?: {x: number; y: number} | undefined
}

export interface AnimatingVillagerRowSpec {
	/** Exit animation: card slides FROM its DOM slot TO this screen position. */
	moveTo?: {x: number; y: number} | undefined
}

// ---------------------------------------------------------------------------
// Pure expander
// ---------------------------------------------------------------------------

function subactionPlayCard(action: SubAction, _state: GameState): SubAction[] {
	const cardInfo = getCitizenCard(action.card?.cardId ?? -1)
	return [
		{
			type: 'EXECUTE_GAMTE_STATE_UPDATE',
			gameStateAction: {
				type: 'MULTI_ACTION',
				actions: [
					{
						type: 'UPADTE_RESOURCES',
						coins: action.cardPlayType === 'COINS' ? cardInfo.actionCoins : 0,
						attack:
							action.cardPlayType === 'ATTACK' ? cardInfo.actionAttack : 0,
						repair:
							action.cardPlayType === 'REPAIR' ? cardInfo.actionRepair : 0,
						bonusRepairFarm:
							action.cardPlayType === 'REPAIR'
								? (cardInfo.actionRepairBonusFarm ?? 0)
								: 0,
						bonusRepairGate:
							action.cardPlayType === 'REPAIR'
								? (cardInfo.actionRepairBonusGate ?? 0)
								: 0,
						bonusRepairTower:
							action.cardPlayType === 'REPAIR'
								? (cardInfo.actionRepairBonusTower ?? 0)
								: 0,
						calm: action.cardPlayType === 'CALM' ? cardInfo.actionCalm : 0
					},
					{
						type: 'MARK_CARD_PLAYED',
						instanceId: action.card?.instanceId ?? '',
						cardPlayType: action.cardPlayType
					}
				]
			}
		}
	]
}

/**
 * Returns expanded sub-actions for high-level types, or null if the action
 * is already atomic and should be processed directly.
 */
function expandSubAction(
	action: SubAction,
	state: GameState
): SubAction[] | null {
	switch (action.type) {
		case 'ENQ_PLAYER_PLAY_CARD':
			return subactionPlayCard(action, state)

		case 'ENQ_END_TURN':
			return [
				...state.pHand
					.map<SubAction>(card => ({type: 'PLAYER_DISCARD_SINGLE_CARD', card}))
					.reverse(),
				{
					type: 'EXECUTE_GAMTE_STATE_UPDATE',
					gameStateAction: {
						type: 'UPADTE_RESOURCES',
						coins: -state.cCoins,
						attack: -state.cAttack,
						repair: -state.cRepair,
						bonusRepairFarm: -state.cBonusRepairFarm,
						bonusRepairGate: -state.cBonusRepairGate,
						bonusRepairTower: -state.cBonusRepairTower,
						calm: -state.cCalm
					}
				},
				{
					type: 'EXECUTE_GAMTE_STATE_UPDATE',
					gameStateAction: {type: 'CLEAR_PLAYED_CARDS'}
				},
				{type: 'ENQ_PLAYER_DRAW_N', count: 3}
			]

		case 'ENQ_DISCARD_HAND':
			return state.pHand.map<SubAction>(card => ({
				type: 'PLAYER_DISCARD_SINGLE_CARD',
				card
			}))

		case 'ENQ_PLAYER_DRAW_N': {
			const count = action.count ?? 1
			return Array.from(
				{length: count},
				(): SubAction => ({type: 'ENQ_PLAYER_DRAW_SINGLE_CARD'})
			)
		}

		case 'ENQ_PLAYER_DRAW_SINGLE_CARD': {
			if (state.pDeck.length === 0) {
				if (state.pDiscard.length === 0) return [] // nothing to draw
				return [
					{type: 'PLAYER_SHUFFLE_DISCARD_INTO_DECK'},
					{type: 'PLAYER_SHUFFLE_SHUFFLE_DECK'},
					{type: 'ENQ_PLAYER_DRAW_SINGLE_CARD'}
				]
			}
			const card = state.pDeck[0]
			if (card === undefined) return []
			return [{type: 'PLAYER_DRAW_CARD', card}]
		}

		case 'ENQ_VILLAGER_DRAW_SINGLE_CARD': {
			if (state.vDeck.length === 0) {
				if (state.vDiscard.length === 0) return [] // nothing to draw
				return [
					{type: 'VILLAGER_SHUFFLE_DISCARD_INTO_DECK'},
					{type: 'VILLAGER_SHUFFLE_DECK'},
					{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'}
				]
			}
			const card = state.vDeck[0]
			if (card === undefined) return []
			return [{type: 'VILLAGER_ROW_DRAW_CARD', card}]
		}

		case 'ENQ_VILLAGER_ROW_BUY_CARD':
			return [
				{
					type: 'EXECUTE_GAMTE_STATE_UPDATE',
					gameStateAction: {
						type: 'UPADTE_RESOURCES',
						coins: -getCitizenCard(action.card?.cardId ?? -1).cost
					}
				},
				{type: 'VILLAGER_ROW_BUY_CARD', card: action.card},
				{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'}
			]

		case 'ENQ_VILLAGER_ROW_CLEAR':
			return [{type: 'VILLAGER_ROW_CLEAR'}, {type: 'ENQ_VILLAGER_ROW_FILL'}]

		case 'ENQ_VILLAGER_ROW_FILL':
			if (state.vRow.length < 4) {
				return [
					{type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'},
					{type: 'ENQ_VILLAGER_ROW_FILL'}
				]
			}
			return [] // row is full — atomic no-op

		case 'ENQ_ENEMY_DRAW_SINGLE_CARD': {
			if (state.eEnemyDeck.length === 0) return [] // no enemies to draw
			const enemyCard = state.eEnemyDeck[0]
			if (enemyCard === undefined) return []
			if (state.eEnemyRow.length >= state.eEnemyRowMax) {
				return [
					{type: 'ENEMY_ROW_REMOVE_OLDEST'},
					{type: 'ENEMY_ROW_DRAW_CARD', enemyCard}
				]
			}
			return [{type: 'ENEMY_ROW_DRAW_CARD', enemyCard}]
		}

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
	discardRef: RefObject<HTMLDivElement | null>,
	villagerDeckRef: RefObject<HTMLDivElement | null>,
	eDeckRef: RefObject<HTMLDivElement | null>,
	enemySlotsRef: RefObject<(HTMLDivElement | null)[]>
) {
	const [queue, setQueue] = useState<SubAction[]>([])
	const [isAnimating, setIsAnimating] = useState(false)
	const [animatingCard, setAnimatingCard] = useState<AnimatingCardSpec | null>(
		null
	)
	const [animatingClearVillagerRow, setAnimatingClearVillagerRow] =
		useState<AnimatingVillagerRowSpec | null>(null)
	const [animatingEnemyShifts, setAnimatingEnemyShifts] = useState<
		Record<string, {x: number; y: number}>
	>({})
	const [animatingEnemyRemove, setAnimatingEnemyRemove] = useState<
		string | null
	>(null)

	// Track latest state in a ref to avoid stale closures inside the effect
	// without making `state` a dependency (which would re-run the effect on
	// every state change, not just queue/animation changes).
	const stateRef = useRef(state)
	stateRef.current = state

	// For exit animations (PLAYER_DISCARD_SINGLE_CARD): the state mutation is deferred
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
		const expanded = expandSubAction(head, currentState)
		if (expanded !== null) {
			setQueue(q => [...expanded, ...q.slice(1)])
			return
		}

		// Atomic actions
		const deckPos = deckRef.current?.getBoundingClientRect()
		const discardPos = discardRef.current?.getBoundingClientRect()
		const villagerDeckPos = villagerDeckRef.current?.getBoundingClientRect()
		const eDeckPos = eDeckRef.current?.getBoundingClientRect()

		switch (head.type) {
			case 'PLAYER_DRAW_CARD': {
				const {card} = head
				if (card === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				dispatch({
					type: 'MULTI_ACTION',
					actions: [
						{
							type: 'STACK_REMOVE_CARDS',
							stack: 'DECK',
							instanceIds: [card.instanceId]
						},
						{type: 'STACK_ADD_CARDS', stack: 'HAND', cards: [card]}
					]
				})
				setIsAnimating(true)
				setAnimatingCard({
					type: 'PLAYER',
					instanceId: card.instanceId,
					moveFrom: deckPos ? {x: deckPos.left, y: deckPos.top} : undefined
				})
				break
			}

			case 'EXECUTE_GAMTE_STATE_UPDATE': {
				if (head.gameStateAction) {
					dispatch(head.gameStateAction)
				}
				setQueue(q => q.slice(1))
				break
			}

			case 'PLAYER_DISCARD_SINGLE_CARD': {
				const {card} = head
				if (card === undefined) {
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
								instanceIds: [card.instanceId]
							},
							{type: 'STACK_ADD_CARDS', stack: 'DISCARD', cards: [card]}
						]
					})
				}
				setIsAnimating(true)
				setAnimatingCard({
					type: 'PLAYER',
					instanceId: card.instanceId,
					moveTo: discardPos
						? {x: discardPos.left, y: discardPos.top}
						: undefined
				})
				break
			}

			case 'VILLAGER_ROW_DRAW_CARD': {
				const {card} = head
				if (card === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				dispatch({
					type: 'MULTI_ACTION',
					actions: [
						{
							type: 'STACK_REMOVE_CARDS',
							stack: 'VILLAGER_DECK',
							instanceIds: [card.instanceId]
						},
						{type: 'STACK_ADD_CARDS', stack: 'VILLAGER_ROW', cards: [card]}
					]
				})
				setIsAnimating(true)
				setAnimatingCard({
					type: 'VILLAGER',
					instanceId: card.instanceId,
					moveFrom: villagerDeckPos
						? {x: villagerDeckPos.left, y: villagerDeckPos.top}
						: undefined
				})
				break
			}

			case 'VILLAGER_ROW_BUY_CARD': {
				const {card} = head
				if (card === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				pendingOnCompleteRef.current = () => {
					dispatch({
						type: 'MULTI_ACTION',
						actions: [
							{
								type: 'STACK_REMOVE_CARDS',
								stack: 'VILLAGER_ROW',
								instanceIds: [card.instanceId]
							},
							{type: 'STACK_ADD_CARDS', stack: 'DISCARD', cards: [card]}
						]
					})
				}
				setIsAnimating(true)
				setAnimatingCard({
					type: 'VILLAGER',
					instanceId: card.instanceId,
					moveTo: discardPos
						? {x: discardPos.left, y: discardPos.top}
						: undefined
				})
				break
			}

			case 'VILLAGER_ROW_CLEAR': {
				const cardsToDiscard = head.cards ?? currentState.vRow
				pendingOnCompleteRef.current = () => {
					dispatch({
						type: 'MULTI_ACTION',
						actions: [
							{type: 'STACK_CLEAR_ALL_CARDS', stack: 'VILLAGER_ROW'},
							{
								type: 'STACK_ADD_CARDS',
								stack: 'VILLAGER_DISCARD',
								cards: cardsToDiscard
							}
						]
					})
				}
				setIsAnimating(true)
				setAnimatingClearVillagerRow({
					moveTo: villagerDeckPos
						? {x: villagerDeckPos.left, y: villagerDeckPos.top}
						: undefined
				})
				break
			}

			case 'PLAYER_SHUFFLE_DISCARD_INTO_DECK': {
				const shuffled = [...currentState.pDiscard].sort(
					() => Math.random() - 0.5
				)
				dispatch({type: 'STACK_ADD_CARDS', stack: 'DECK', cards: shuffled})
				dispatch({type: 'STACK_CLEAR_ALL_CARDS', stack: 'DISCARD'})
				setQueue(q => q.slice(1))
				break
			}

			case 'PLAYER_SHUFFLE_SHUFFLE_DECK': {
				dispatch({type: 'STACK_SHUFFLE', stack: 'DECK'})
				setQueue(q => q.slice(1))
				break
			}

			case 'VILLAGER_SHUFFLE_DISCARD_INTO_DECK': {
				const shuffled = [...currentState.vDiscard].sort(
					() => Math.random() - 0.5
				)
				dispatch({
					type: 'STACK_ADD_CARDS',
					stack: 'VILLAGER_DECK',
					cards: shuffled
				})
				dispatch({type: 'STACK_CLEAR_ALL_CARDS', stack: 'VILLAGER_DISCARD'})
				setQueue(q => q.slice(1))
				break
			}

			case 'VILLAGER_SHUFFLE_DECK': {
				dispatch({type: 'STACK_SHUFFLE', stack: 'VILLAGER_DECK'})
				setQueue(q => q.slice(1))
				break
			}

			case 'ENEMY_ROW_REMOVE_OLDEST': {
				const oldest = currentState.eEnemyRow[0]
				if (oldest === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				// Defer dispatch until after fade-out so the card stays rendered.
				pendingOnCompleteRef.current = () => {
					dispatch({type: 'ENEMY_ROW_DISCARD_OLDEST'})
				}
				setAnimatingEnemyRemove(oldest.instanceId)
				setIsAnimating(true)
				break
			}

			case 'ENEMY_ROW_DRAW_CARD': {
				const {enemyCard} = head
				if (enemyCard === undefined) {
					setQueue(q => q.slice(1))
					return
				}
				// Capture current slot positions before dispatch so shifted cards can
				// animate from their old slot positions after re-render.
				const currentRow = currentState.eEnemyRow
				const offset = currentState.eEnemyRowMax - currentRow.length
				const shiftMap: Record<string, {x: number; y: number}> = {}
				for (let i = 0; i < currentRow.length; i++) {
					const c = currentRow[i]
					if (c === undefined) continue
					const slotEl = enemySlotsRef.current[offset + i]
					const rect = slotEl?.getBoundingClientRect()
					if (rect) shiftMap[c.instanceId] = {x: rect.left, y: rect.top}
				}
				dispatch({
					type: 'MULTI_ACTION',
					actions: [
						{type: 'ENEMY_DECK_REMOVE_CARD', instanceId: enemyCard.instanceId},
						{type: 'ENEMY_ROW_ADD_CARD', card: enemyCard}
					]
				})
				setAnimatingEnemyShifts(shiftMap)
				setIsAnimating(true)
				setAnimatingCard({
					type: 'ENEMY',
					instanceId: enemyCard.instanceId,
					moveFrom: eDeckPos ? {x: eDeckPos.left, y: eDeckPos.top} : undefined
				})
				break
			}

			default:
				setQueue(q => q.slice(1))
				break
		}
	}, [
		queue,
		isAnimating,
		dispatch,
		deckRef,
		discardRef,
		villagerDeckRef.current?.getBoundingClientRect,
		eDeckRef.current?.getBoundingClientRect
	])

	const enqueue = useCallback((actions: SubAction[]) => {
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
