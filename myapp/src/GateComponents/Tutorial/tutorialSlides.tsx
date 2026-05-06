import type {ReactNode, RefObject} from 'react'
import {
	type FearAction,
	makeCardInstances,
	makeEnemyCardInstances
} from '../Boards/gameStateReducer'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'
import {ValueBadge} from '../UIComponents/ValueBadge'

// ---------------------------------------------------------------------------
// Refs required by PlayerBaseRow — passed in from TutorialDialog (useRef)
// ---------------------------------------------------------------------------

export interface TutorialRefs {
	farmRef: RefObject<HTMLDivElement | null>
	gateRef: RefObject<HTMLDivElement | null>
	towerRef: RefObject<HTMLDivElement | null>
	fearamidRef: RefObject<HTMLDivElement | null>
}

// ---------------------------------------------------------------------------
// Keyword helper — bold amber text for game terms in description text
// ---------------------------------------------------------------------------

export function K({children}: {children: ReactNode}) {
	return (
		<strong className='text-(--color-card-text-keyword)'>{children}</strong>
	)
}

// ---------------------------------------------------------------------------
// Slide types
// ---------------------------------------------------------------------------

export interface TutorialAnnotation {
	id: string
	placement: 'top' | 'bottom' | 'left' | 'right'
	text: string
}

export interface TutorialSlide {
	title: string
	/** Scale applied to the board preview. Larger for simpler slides, smaller for full-board slides. */
	scale: number
	/** Receives refs needed by PlayerBaseRow. Return frozen (non-interactive) JSX. */
	boardContent: (refs: TutorialRefs) => ReactNode
	annotations: TutorialAnnotation[]
	description: ReactNode
}

// ---------------------------------------------------------------------------
// Frozen card instances — computed once at module load, never re-created
// ---------------------------------------------------------------------------

const HAND_CARDS = makeCardInstances([1, 2, 3]) // Guard, Monk, Farmer
const VILLAGE_CARDS = makeCardInstances([10, 11, 13, 14]) // Tax Collector, Mercenary, Craftsman, Mason
const ENEMY_ROW_CARDS = makeEnemyCardInstances([1, 2]) // Speyeder, Skulepede
const ENEMY_DECK_CARDS = makeEnemyCardInstances([3, 4, 5, 6, 7, 8, 9])

const STANDARD_FEARAMID: FearAction[] = [
	'NONE',
	'DRAW_HERO',
	'DAMAGE_FARM',
	'DRAW_HERO',
	'DAMAGE_TOWER',
	'DRAW_HERO',
	'NONE',
	'DAMAGE_GATE',
	'DAMAGE_GATE',
	'GAMEOVER'
]

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

export const TUTORIAL_SLIDES: TutorialSlide[] = [
	// -------------------------------------------------------------------------
	// Slide 1 — Board Overview
	// -------------------------------------------------------------------------
	{
		title: 'The Board',
		scale: 0.55,
		boardContent: refs => (
			<div className='flex-1 grid grid-cols-[max-content_1fr]'>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='ATTACK' value='0' variant='neutral' />
				</div>
				<div id='tutorial-enemy-row'>
					<EnemyRow
						enemyCards={ENEMY_ROW_CARDS}
						enemyDeckCards={ENEMY_DECK_CARDS}
						enemyRowMax={2}
						heroCardsRemaining={5}
						isAttackable={false}
					/>
				</div>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='COINS' value='0' variant='neutral' />
				</div>
				<div id='tutorial-village-row'>
					<VillageRow
						currentCoins={0}
						isBuyable={false}
						villageCards={VILLAGE_CARDS}
					/>
				</div>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='CALM' value='0' variant='neutral' />
					<ValueBadge type='REPAIR' value='0' variant='neutral' />
				</div>
				<div id='tutorial-base-row'>
					<PlayerBaseRow
						canCalm={false}
						canRepair={false}
						farmRef={refs.farmRef}
						fear={2}
						fearamid={STANDARD_FEARAMID}
						fearamidRef={refs.fearamidRef}
						gateRef={refs.gateRef}
						healthFarm={6}
						healthGate={10}
						healthGateMax={12}
						healthMaxFarm={6}
						healthTower={6}
						healthTowerMax={6}
						onCalm={() => {}}
						onRepair={() => {}}
						towerRef={refs.towerRef}
					/>
				</div>
				<div className='p-[2px] border flex flex-col' />
				<div id='tutorial-player-hand'>
					<PlayerHand cards={HAND_CARDS} />
				</div>
			</div>
		),
		annotations: [
			{id: 'tutorial-enemy-row', placement: 'left', text: 'Enemy Row'},
			{id: 'tutorial-village-row', placement: 'left', text: 'Village Row'},
			{id: 'tutorial-base-row', placement: 'left', text: 'Your Base & Fear'},
			{id: 'tutorial-player-hand', placement: 'left', text: 'Your Hand'}
		],
		description: (
			<>
				The board has four rows. <K>Enemies</K> threaten your base from the top.
				The <K>Village Row</K> is where you recruit allies. Your <K>Base</K>{' '}
				buildings and <K>Fear</K> tracker sit in the middle. Your <K>Hand</K> of
				cards is at the bottom.
			</>
		)
	},

	// -------------------------------------------------------------------------
	// Slide 2 — Your Hand & Cards
	// -------------------------------------------------------------------------
	{
		title: 'Your Hand & Cards',
		scale: 0.9,
		boardContent: _refs => (
			<div id='tutorial-hand-area' className='w-full'>
				<PlayerHand cards={HAND_CARDS} />
			</div>
		),
		annotations: [
			{
				id: 'tutorial-hand-area',
				placement: 'top',
				text: 'Your 3 starting cards'
			}
		],
		description: (
			<>
				Each turn you draw <K>3 cards</K> from your <K>Player Deck</K>.
				<br />
				<br />
				Each card can be played in one of up to four ways — generating{' '}
				<K>Coins</K> (to recruit), <K>Attack</K> (to fight enemies),{' '}
				<K>Repair</K> (to fix buildings), or <K>Calm</K> (to reduce fear). The
				icons on each card show what it produces for each play type. You choose
				which type to use when you play it.
				<br />
				<br />
				Cards stay in your <K>play area</K> until you end your turn — they don't
				go to the discard until then.
			</>
		)
	},

	// -------------------------------------------------------------------------
	// Slide 3 — The Village Row
	// -------------------------------------------------------------------------
	{
		title: 'Recruiting from the Village',
		scale: 0.8,
		boardContent: _refs => (
			<div>
				<div className='p-[2px] border flex flex-row gap-1'>
					<ValueBadge type='COINS' value='Coins: 3' variant='success' />
				</div>
				<div id='tutorial-village-cards'>
					<VillageRow
						currentCoins={3}
						isBuyable={false}
						villageCards={VILLAGE_CARDS}
					/>
				</div>
			</div>
		),
		annotations: [
			{
				id: 'tutorial-village-cards',
				placement: 'top',
				text: 'Spend Coins to recruit'
			}
		],
		description: (
			<>
				Spend <K>Coins</K> (generated by playing cards) to recruit villagers
				from the <K>Village Row</K>. Each card shows its <K>cost</K> in the top
				corner.
				<br />
				<br />
				Recruited cards go into your <K>discard pile</K> and will cycle into
				your deck over future turns, making your deck stronger.
				<br />
				<br />
				Your <K>Farm</K> building adds a bonus coin to your recruiting budget
				while it has health above its threshold.
			</>
		)
	},

	// -------------------------------------------------------------------------
	// Slide 4 — Enemies
	// -------------------------------------------------------------------------
	{
		title: 'Enemies',
		scale: 0.8,
		boardContent: _refs => (
			<div>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='ATTACK' value='Attack: 2' variant='success' />
				</div>
				<div id='tutorial-enemies'>
					<EnemyRow
						enemyCards={ENEMY_ROW_CARDS}
						enemyDeckCards={ENEMY_DECK_CARDS}
						enemyRowMax={2}
						heroCardsRemaining={5}
						isAttackable={false}
					/>
				</div>
			</div>
		),
		annotations: [
			{id: 'tutorial-enemies', placement: 'top', text: 'Active enemies'}
		],
		description: (
			<>
				Up to <K>2 enemies</K> are active at once. Each enemy has a{' '}
				<K>health</K> value and an <K>attack</K> that targets one of your
				buildings every turn.
				<br />
				<br />
				Generate <K>Attack</K> by playing cards, then click an enemy to deal
				damage. When an enemy reaches 0 health it is defeated and a new one
				enters from the deck.
				<br />
				<br />
				Your <K>Tower</K> building adds bonus attack damage while it has health
				above its threshold.
			</>
		)
	},

	// -------------------------------------------------------------------------
	// Slide 5 — Your Base & Fear
	// -------------------------------------------------------------------------
	{
		title: 'Your Base & the Fear Pyramid',
		scale: 0.85,
		boardContent: refs => (
			<div id='tutorial-base'>
				<PlayerBaseRow
					canCalm={false}
					canRepair={false}
					farmRef={refs.farmRef}
					fear={3}
					fearamid={STANDARD_FEARAMID}
					fearamidRef={refs.fearamidRef}
					gateRef={refs.gateRef}
					healthFarm={5}
					healthGate={8}
					healthGateMax={12}
					healthMaxFarm={6}
					healthTower={4}
					healthTowerMax={6}
					onCalm={() => {}}
					onRepair={() => {}}
					towerRef={refs.towerRef}
				/>
			</div>
		),
		annotations: [
			{
				id: 'tutorial-base',
				placement: 'top',
				text: 'Farm · Gate · Tower · Fear'
			}
		],
		description: (
			<>
				Your base has three buildings — <K>Farm</K>, <K>Gate</K>, and{' '}
				<K>Tower</K>. Each has a <K>health bar</K>. If the <K>Gate</K> reaches 0
				health, you lose.
				<br />
				<br />
				Use <K>Repair</K> (generated by playing cards) to restore building
				health. Spend <K>Calm</K> to reduce fear.
				<br />
				<br />
				The <K>Fear Pyramid</K> tracks how much fear has built up. Each time
				fear advances, it triggers an effect — drawing a hero card, damaging a
				building, or eventually causing a <K>game over</K> if it reaches the
				top.
			</>
		)
	},

	// -------------------------------------------------------------------------
	// Slide 6 — Turn Structure
	// -------------------------------------------------------------------------
	{
		title: 'How a Turn Works',
		scale: 0.55,
		boardContent: refs => (
			<div className='flex-1 grid grid-cols-[max-content_1fr]'>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='ATTACK' value='0' variant='neutral' />
				</div>
				<EnemyRow
					enemyCards={ENEMY_ROW_CARDS}
					enemyDeckCards={ENEMY_DECK_CARDS}
					enemyRowMax={2}
					heroCardsRemaining={5}
					isAttackable={false}
				/>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='COINS' value='0' variant='neutral' />
				</div>
				<VillageRow
					currentCoins={0}
					isBuyable={false}
					villageCards={VILLAGE_CARDS}
				/>
				<div className='p-[2px] border flex flex-col'>
					<ValueBadge type='CALM' value='0' variant='neutral' />
					<ValueBadge type='REPAIR' value='0' variant='neutral' />
				</div>
				<PlayerBaseRow
					canCalm={false}
					canRepair={false}
					farmRef={refs.farmRef}
					fear={1}
					fearamid={STANDARD_FEARAMID}
					fearamidRef={refs.fearamidRef}
					gateRef={refs.gateRef}
					healthFarm={6}
					healthGate={12}
					healthGateMax={12}
					healthMaxFarm={6}
					healthTower={6}
					healthTowerMax={6}
					onCalm={() => {}}
					onRepair={() => {}}
					towerRef={refs.towerRef}
				/>
				<div className='p-[2px] border flex flex-col' />
				<div id='tutorial-turn-hand'>
					<PlayerHand cards={HAND_CARDS} />
				</div>
			</div>
		),
		annotations: [
			{
				id: 'tutorial-turn-hand',
				placement: 'bottom',
				text: 'Step 1: Play cards to gain resources'
			}
		],
		description: (
			<>
				<strong>1. Play cards</strong> — Play cards from your hand to generate{' '}
				<K>Coins</K>, <K>Attack</K>, <K>Repair</K>, and <K>Calm</K>.
				<br />
				<strong>2. Spend resources</strong> — Use what you earned: recruit from
				the village, attack enemies, repair buildings, or reduce fear. Resources
				expire at end of turn.
				<br />
				<strong>3. End Turn</strong> — Click <K>End Turn</K>. Enemies attack
				your base, a new enemy may enter, and you draw a fresh hand of{' '}
				<K>3 cards</K>.
				<br />
				<br />
				<K>Win</K> by defeating all enemies. <K>Lose</K> if your Gate falls to 0
				or fear reaches the top of the pyramid.
			</>
		)
	}
]
