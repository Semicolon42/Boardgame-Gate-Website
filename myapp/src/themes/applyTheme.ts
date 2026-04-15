import type {GateTheme} from './types'

export function applyTheme(theme: GateTheme): void {
	const r = document.documentElement

	// Colors
	r.style.setProperty(
		'--color-gameboard-background',
		theme.colors.gameboardBackground
	)
	r.style.setProperty('--color-card-text', theme.colors.cardText)
	r.style.setProperty('--color-card-back', theme.colors.cardBack)
	r.style.setProperty('--color-card-face', theme.colors.cardFace)
	r.style.setProperty('--color-enemy-card-back', theme.colors.enemyCardBack)
	r.style.setProperty('--color-enemy-card-face', theme.colors.enemyCardFace)
	r.style.setProperty('--color-base-back-normal', theme.colors.baseBack)
	r.style.setProperty('--color-base-text', theme.colors.baseText)
	r.style.setProperty(
		'--color-card-action-played',
		theme.colors.cardActionPlayed
	)
	r.style.setProperty('--color-outline-normal', theme.colors.outlineNormal)
	r.style.setProperty(
		'--color-outline-normal-hover',
		theme.colors.outlineNormalHover
	)
	r.style.setProperty('--color-outline-active', theme.colors.outlineActive)
	r.style.setProperty(
		'--color-outline-active-hover',
		theme.colors.outlineActiveHover
	)
	r.style.setProperty(
		'--color-outline-attackable',
		theme.colors.outlineAttackable
	)
	r.style.setProperty(
		'--color-outline-attackable-hover',
		theme.colors.outlineAttackableHover
	)
	r.style.setProperty('--color-outline-inactive', theme.colors.outlineInactive)
	r.style.setProperty(
		'--color-outline-inactive-hover',
		theme.colors.outlineInactiveHover
	)
	r.style.setProperty('--color-text-primary', theme.colors.textPrimary)
	r.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
	r.style.setProperty('--color-text-damage', theme.colors.textDamage)
	r.style.setProperty('--color-text-healing', theme.colors.textHealing)

	r.style.setProperty('--text-vp-stroke-width', theme.vp.strokeWidthPx+'px')
	r.style.setProperty('--text-vp-stroke-color', theme.vp.strokeColor)
	r.style.setProperty('--fearamid-color-highlight', theme.fearamid.highlightColor)
	

	// Card animations
	r.style.setProperty(
		'--duration-card-draw',
		`${theme.cardAnimation.drawDurationMs}ms`
	)
	r.style.setProperty('--easing-card-draw', theme.cardAnimation.drawEasing)
	r.style.setProperty(
		'--duration-card-discard',
		`${theme.cardAnimation.discardDurationMs}ms`
	)
	r.style.setProperty(
		'--easing-card-discard',
		theme.cardAnimation.discardEasing
	)
	// Floating text appearance
	r.style.setProperty(
		'--text-floating-size',
		`${theme.floatingText.fontSizeRem}rem`
	)
	r.style.setProperty(
		'--text-stroke-floating-width',
		`${theme.floatingText.strokeWidthPx}px`
	)
	r.style.setProperty(
		'--text-stroke-floating-color',
		theme.floatingText.strokeColor
	)
}
