import {expect, test} from '@playwright/test'
import type {Page} from '@playwright/test'
import {
	initialState,
	makeCardInstances,
	makeEnemyCardInstances
} from '../src/GateComponents/Boards/gameStateReducer'
import type {GameState} from '../src/GateComponents/Boards/gameStateReducer'

// ---------------------------------------------------------------------------
// Helper — inject a partial game state via the DEV window hook
// ---------------------------------------------------------------------------

async function setGameState(page: Page, overrides: Partial<GameState>) {
	await page.evaluate(
		(s) => (window as Window & {__setGameState?: (s: Partial<GameState>) => void}).__setGameState?.(s),
		overrides
	)
}

// ---------------------------------------------------------------------------
// Game start
// ---------------------------------------------------------------------------

test('shows village row and player deck on load', async ({page}) => {
	await page.goto('/')
	await expect(page.getByRole('button', {name: /village/i})).toBeVisible()
	await expect(page.getByRole('button', {name: /player deck/i})).toBeVisible()
})

// ---------------------------------------------------------------------------
// Mid-game: enemy visible after state injection
// ---------------------------------------------------------------------------

test('enemy appears after state injection', async ({page}) => {
	await page.goto('/')
	await setGameState(page, {
		eEnemyRow: makeEnemyCardInstances([1]) // Speyeder
	})
	await expect(page.getByText('Speyeder')).toBeVisible()
})

// ---------------------------------------------------------------------------
// Mid-game: attack enemy reduces health badge
// ---------------------------------------------------------------------------

test('attacking an enemy reduces its health', async ({page}) => {
	await page.goto('/')

	const [enemy] = makeEnemyCardInstances([1]) // Speyeder, 3 health
	await setGameState(page, {
		eEnemyRow: [enemy!],
		cAttack: 5
	})

	// Health badge should show 3
	await expect(page.getByText('3').first()).toBeVisible()

	// Click the enemy card to attack it
	await page.getByText('Speyeder').click()

	// Wait for animations to settle and health to update
	await expect(page.getByText('Speyeder')).not.toBeVisible({timeout: 3000})
})

// ---------------------------------------------------------------------------
// Mid-game: end turn draws new cards into hand
// ---------------------------------------------------------------------------

test('ending turn draws new cards into hand', async ({page}) => {
	await page.goto('/')

	await setGameState(page, {
		pDeck: makeCardInstances([1, 2, 3]), // Guard, Monk, Farmer
		pHand: [],
		eEnemyRow: []
	})

	// Trigger end turn
	await page.getByRole('button', {name: /end turn/i}).click()

	// Cards should eventually appear in hand
	await expect(page.getByText('Guard')).toBeVisible({timeout: 5000})
})

// ---------------------------------------------------------------------------
// Game over: WIN state shows win dialog
// ---------------------------------------------------------------------------

test('shows win dialog when game outcome is WIN', async ({page}) => {
	await page.goto('/')
	await setGameState(page, {gameOutcome: 'WIN'})
	await expect(page.getByText(/win/i)).toBeVisible()
})
