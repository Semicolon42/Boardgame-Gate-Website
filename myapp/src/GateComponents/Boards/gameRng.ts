// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32 algorithm
//
// Given the same seed, next() produces an identical sequence every time.
// Used for all game-outcome randomness (deck shuffles, hero selection).
// Animation randomness (card rotation, pop-up angles) continues to use
// Math.random() since it doesn't affect game outcomes.
// ---------------------------------------------------------------------------

export interface GameRng {
	/** Returns a float in [0, 1), identical for the same seed + call count. */
	next(): number
	/** Fisher-Yates shuffle — returns a new array, does not mutate input. */
	shuffle<T>(arr: readonly T[]): T[]
	/** Returns a random integer in [0, n). */
	pickIndex(n: number): number
	/** The seed this RNG was initialised with. Display/save for replay. */
	readonly seed: number
}

export function createGameRng(seed: number): GameRng {
	// Force 32-bit unsigned integer to match the algorithm's expectation.
	let s = seed >>> 0

	function next(): number {
		s = (s + 0x6d_2b_79_f5) >>> 0
		let z = s
		z = Math.imul(z ^ (z >>> 15), 1 | z) >>> 0
		z = (z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))) >>> 0
		return ((z ^ (z >>> 14)) >>> 0) / 0x1_00_00_00_00
	}

	function shuffle<T>(arr: readonly T[]): T[] {
		const result = [...arr]
		for (let i = result.length - 1; i > 0; i--) {
			const j = Math.floor(next() * (i + 1))
			const tmp = result[i]!
			result[i] = result[j]!
			result[j] = tmp
		}
		return result
	}

	function pickIndex(n: number): number {
		return Math.floor(next() * n)
	}

	return {next, shuffle, pickIndex, seed}
}
