import type {Dispatch, MutableRefObject, RefObject, SetStateAction} from 'react'
import type {CardPlayType} from '@/GateComponents/Cards/XCard'
import type {
	BuildingType,
	CardInstance,
	EnemyCardInstance,
	GameAction,
	GameState
} from '../gameStateReducer'

export type FloatingTextTarget =
	| {kind: 'ENEMY_CARD'; instanceId: string}
	| {kind: 'BUILDING_FARM'}
	| {kind: 'BUILDING_GATE'}
	| {kind: 'BUILDING_TOWER'}

export interface FloatingTextSpec {
	text: string
	color: string
	x: number
	y: number
}

// ---------------------------------------------------------------------------
// SubActionType — discriminated union
// Each variant carries exactly the fields it needs, mirroring GameAction.
// ---------------------------------------------------------------------------

export type SubActionType =
	| {type: 'ENQ_PLAYER_DRAW_N'; count: number}
	| {type: 'ENQ_PLAYER_DRAW_SINGLE_CARD'}
	| {
			type: 'ENQ_PLAYER_PLAY_CARD'
			card: CardInstance
			cardPlayType: CardPlayType
	  }
	| {type: 'PLAYER_DRAW_CARD'; card: CardInstance}
	| {type: 'PLAYER_DISCARD_SINGLE_CARD'; card: CardInstance}
	| {type: 'PLAYER_SHUFFLE_DISCARD_INTO_DECK'}
	| {type: 'PLAYER_SHUFFLE_SHUFFLE_DECK'}
	| {type: 'ENQ_DISCARD_HAND'}
	| {type: 'ENQ_GAME_END_TURN'}
	| {type: 'ENQ_GAME_START'}
	| {type: 'ENQ_GAME_OVER'}
	| {type: 'EXECUTE_GAME_STATE_UPDATE'; gameStateAction: GameAction}
	| {type: 'ENQ_VILLAGER_DRAW_SINGLE_CARD'}
	| {type: 'ENQ_VILLAGER_ROW_CLEAR'}
	| {type: 'ENQ_VILLAGER_ROW_FILL'}
	| {type: 'ENQ_VILLAGER_ROW_BUY_CARD'; card: CardInstance}
	| {type: 'VILLAGER_ROW_DRAW_CARD'; card: CardInstance}
	| {type: 'VILLAGER_ROW_BUY_CARD'; card: CardInstance | undefined}
	| {type: 'VILLAGER_ROW_CLEAR'; cards?: CardInstance[]}
	| {type: 'VILLAGER_SHUFFLE_DISCARD_INTO_DECK'}
	| {type: 'VILLAGER_SHUFFLE_DECK'}
	| {type: 'ENQ_ENEMY_TURN'}
	| {type: 'ENQ_ENEMY_DRAW_SINGLE_CARD'}
	| {type: 'ENEMY_ROW_REMOVE_OLDEST'}
	| {
			type: 'ENEMY_ROW_REMOVE_INSTANCE'
			enemyCard: EnemyCardInstance | undefined
	  }
	| {type: 'ENEMY_ROW_DRAW_CARD'; enemyCard: EnemyCardInstance}
	| {
			type: 'SHOW_FLOATING_TEXT'
			text: string
			color: string
			target: FloatingTextTarget
	  }
	| {type: 'DEBUG_ALERT'; message: string}

/** Function signature for enqueuing sub-actions. */
export type EnqueueFn = (actions: SubActionType[]) => void

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
	/** Exit animation: all row cards slide FROM their DOM slots TO this screen position. */
	moveTo?: {x: number; y: number} | undefined
}

/** Everything an atomic handler needs to do its work. */
export interface SubActionContext {
	dispatch: Dispatch<GameAction>
	currentState: GameState
	setQueue: Dispatch<SetStateAction<SubActionType[]>>
	setIsAnimating: (v: boolean) => void
	setAnimatingCard: (v: AnimatingCardSpec | null) => void
	setAnimatingClearVillagerRow: (v: AnimatingVillagerRowSpec | null) => void
	setAnimatingEnemyShifts: (v: Record<string, {x: number; y: number}>) => void
	setAnimatingEnemyRemove: (v: string | null) => void
	pendingOnCompleteRef: MutableRefObject<(() => void) | null>
	setAnimatingFloatingText: (v: FloatingTextSpec | null) => void
	// DOM snapshot positions (captured before dispatch):
	deckPos: DOMRect | undefined
	discardPos: DOMRect | undefined
	villagerDeckPos: DOMRect | undefined
	eDeckPos: DOMRect | undefined
	enemySlotsRef: RefObject<(HTMLDivElement | null)[]>
	farmRef: RefObject<HTMLDivElement | null>
	gateRef: RefObject<HTMLDivElement | null>
	towerRef: RefObject<HTMLDivElement | null>
}

/** An expander turns a high-level (ENQ_*) sub-action into a sequence of atomic ones. */
export type Expander<T extends SubActionType = SubActionType> = (
	action: T,
	state: GameState
) => SubActionType[]

/** An atomic handler directly dispatches actions and/or triggers animations. */
export type AtomicHandler<T extends SubActionType = SubActionType> = (
	action: T,
	ctx: SubActionContext
) => void
