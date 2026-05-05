import {createGameRng} from './gameRng'

describe('createGameRng', () => {
	describe('determinism', () => {
		it('produces the same sequence for the same seed', () => {
			const a = createGameRng(12_345)
			const b = createGameRng(12_345)
			for (let i = 0; i < 20; i++) {
				expect(a.next()).toBe(b.next())
			}
		})

		it('produces different sequences for different seeds', () => {
			const a = createGameRng(1)
			const b = createGameRng(2)
			const aVals = Array.from({length: 10}, () => a.next())
			const bVals = Array.from({length: 10}, () => b.next())
			expect(aVals).not.toEqual(bVals)
		})
	})

	describe('next()', () => {
		it('always returns a value in [0, 1)', () => {
			const rng = createGameRng(99_999)
			for (let i = 0; i < 1000; i++) {
				const v = rng.next()
				expect(v).toBeGreaterThanOrEqual(0)
				expect(v).toBeLessThan(1)
			}
		})
	})

	describe('shuffle()', () => {
		it('returns a new array with the same elements', () => {
			const rng = createGameRng(42)
			const input = [1, 2, 3, 4, 5]
			const result = rng.shuffle(input)
			expect(result).not.toBe(input)
			expect(result.slice().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
		})

		it('does not mutate the input array', () => {
			const rng = createGameRng(42)
			const input = [1, 2, 3, 4, 5]
			const copy = [...input]
			rng.shuffle(input)
			expect(input).toEqual(copy)
		})

		it('produces the same permutation for the same seed', () => {
			const input = [10, 20, 30, 40, 50]
			const a = createGameRng(777)
			const b = createGameRng(777)
			expect(a.shuffle(input)).toEqual(b.shuffle(input))
		})

		it('handles empty and single-element arrays', () => {
			const rng = createGameRng(1)
			expect(rng.shuffle([])).toEqual([])
			expect(rng.shuffle([42])).toEqual([42])
		})
	})

	describe('pickIndex()', () => {
		it('always returns an integer in [0, n)', () => {
			const rng = createGameRng(555)
			for (let n = 1; n <= 20; n++) {
				const idx = rng.pickIndex(n)
				expect(Number.isInteger(idx)).toBe(true)
				expect(idx).toBeGreaterThanOrEqual(0)
				expect(idx).toBeLessThan(n)
			}
		})

		it('produces the same index for the same seed', () => {
			const a = createGameRng(100)
			const b = createGameRng(100)
			expect(a.pickIndex(10)).toBe(b.pickIndex(10))
		})
	})

	describe('seed property', () => {
		it('exposes the original seed unchanged', () => {
			const rng = createGameRng(8_675_309)
			expect(rng.seed).toBe(8_675_309)
		})

		it('seed does not change as the rng advances', () => {
			const rng = createGameRng(42)
			rng.next()
			rng.next()
			rng.next()
			expect(rng.seed).toBe(42)
		})
	})
})
