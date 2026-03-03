import {WaButton, WaCheckbox} from '@awesome.me/webawesome/dist/react'
import {useRef, useState} from 'react'
import {EnemyRow} from '../Rows/EnemyRow/EnemyRow'
import {PlayerBaseRow} from '../Rows/PlayerBaseRow/PlayerBaseRow'
import {PlayerHand} from '../Rows/PlayerHand/PlayerHand'
import {VillageRow} from '../Rows/VillageRow/VillageRow'

const HAND_SIZE = 3

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: game board manages necessary co-located state
export function GameBoard() {
	const [state, setState] = useState<{
		pDeck: number[]
		pHand: number[]
		hDeck: number[]
	}>({
		pDeck: [0, 1, 2],
		pHand: [],
		hDeck: [101, 102, 103, 104]
	})
	const [animationEnabled, setAnimationEnabled] = useState(false)
	const [newlyDrawnIndices, setNewlyDrawnIndices] = useState<Set<number>>(
		new Set()
	)
	const pendingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])

	// Ref to the deck element so we can measure its position at draw time
	const deckRef = useRef<HTMLDivElement>(null)
	// Snapshot of the deck's top-left position taken just before each draw action.
	// Stored in a ref (not state) so updating it never triggers a re-render.
	// XCard reads this value in its useLayoutEffect to compute the animation origin.
	const drawOriginRef = useRef<{x: number; y: number} | undefined>(undefined)

	const actionDrawPlayerHand = () => {
		// Cancel any in-flight draw timeouts
		for (const t of pendingTimeouts.current) clearTimeout(t)
		pendingTimeouts.current = []
		setNewlyDrawnIndices(new Set())

		// Snapshot the deck's position before any state changes cause re-renders.
		// Cards drawn in this action will use this origin for their fly-in animation.
		if (deckRef.current) {
			const rect = deckRef.current.getBoundingClientRect()
			drawOriginRef.current = {x: rect.left, y: rect.top}
		}

		// Return hand to deck, shuffle, draw HAND_SIZE cards
		const fullDeck = [...state.pDeck, ...state.pHand]
		const shuffledFullDeck = [...fullDeck].sort(() => Math.random() - 0.5)
		const drawn = shuffledFullDeck.slice(0, HAND_SIZE)
		const remaining = shuffledFullDeck.slice(HAND_SIZE)

		// Clear hand immediately
		setState(prev => ({...prev, pHand: [], pDeck: remaining}))

		// Add each drawn card one at a time, 1 second apart
		drawn.forEach((cardId, i) => {
			const t = setTimeout(() => {
				setState(s => ({...s, pHand: [...s.pHand, cardId]}))
				if (animationEnabled) {
					setNewlyDrawnIndices(prev => new Set([...prev, i]))
				}
			}, i * 100)
			pendingTimeouts.current.push(t)
		})
	}

	// Remove cards from animation after animation completes
	const onCardAnimationEnd = (index: number) => {
		setNewlyDrawnIndices(prev => {
			const next = new Set(prev)
			next.delete(index)
			return next
		})
	}

	return (
		<div className='block'>
			<div className='flex'>
				{/* Left column: player deck, spans full board height, anchored to bottom to align with player hand */}
				<div className='flex flex-col justify-end p-[2px]'>
					<div
						className='flex h-[140px] w-[100px] items-center justify-center rounded-xl bg-gray-700 text-white'
						ref={deckRef}
					>
						{state.pDeck.length}
					</div>
				</div>

				{/* Right column: all game rows */}
				<div className='flex-1'>
					{/* First Row Enemies / Hero deck */}
					<EnemyRow
						enemyState={{}}
						heroCardsRemaining={state.hDeck.length}
						updateEnemyState={{}}
					/>
					{/* Second Row Village cards to buy */}
					<VillageRow villageCards={[7, 8, 9, 10]} />
					{/* Third Base and Health */}
					<PlayerBaseRow />
					{/* Fourth Row Player Hand */}
					<PlayerHand
						cardIds={state.pHand}
						drawOrigin={drawOriginRef.current}
						newlyDrawnIndices={newlyDrawnIndices}
						onCardAnimationEnd={onCardAnimationEnd}
					/>
				</div>
			</div>

			<div className='block'>
				<WaButton onClick={actionDrawPlayerHand} variant='brand'>
					Draw Hand
				</WaButton>

				<div className='bg-white'>
					<WaCheckbox
						checked={animationEnabled}
						onChange={e => setAnimationEnabled(e.target.checked)}
					/>
					Enable Animation
				</div>
			</div>
		</div>
	)
}
