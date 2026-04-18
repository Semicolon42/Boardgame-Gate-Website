import type {GateTheme} from './types'

const theme: GateTheme = {
	colors: {
		gameboardBackground: 'rgb(14, 12, 55)',
		cardText: 'white',
		cardBack: 'rgb(23, 23, 23)',
		cardFace: 'rgb(16, 16, 16)',
		enemyCardBack: 'rgb(23, 23, 23)',
		enemyCardFace: 'rgb(16, 16, 16)',
		baseBack: 'rgb(23, 23, 23)',
		baseText: 'white',
		cardActionPlayed: 'rgb(90, 90, 90)',
		outlineNormal: 'rgb(90, 90, 90)',
		outlineNormalHover: 'rgb(120, 120, 120)',
		outlineActive: 'rgb(170, 170, 170)',
		outlineActiveHover: 'rgb(200, 200, 200)',
		outlineAttackable: 'rgb(200, 0, 0)',
		outlineAttackableHover: 'rgb(240, 0, 0)',
		outlineTrashable: 'rgb(200, 0, 0)',
		outlineTrashableHover: 'rgb(240, 0, 0)',
		outlineInactive: 'rgb(40, 40, 40)',
		outlineInactiveHover: 'rgb(80, 80, 80)',
		textPrimary: 'rgb(225, 225, 225)',
		textSecondary: 'rgb(200, 199, 199)',
		textDamage: 'rgb(255, 46, 46)',
		textHealing: 'rgb(106, 221, 106)'
	},
	fearamid: {
		highlightColor: 'rgba(200, 0, 0, 1)'
	},
	vp: {
		strokeColor: 'white',
		strokeWidthPx: 3
	},
	cardAnimation: {
		drawDurationMs: 400,
		drawEasing: 'ease-out',
		discardDurationMs: 400,
		discardEasing: 'ease-in',
		pulseDurationMs: 500
	},
	enemyDiscard: {
		durationMs: 700,
		speedPxPerMs: 0.2,
		gravityPxPerMs2: 0.0008,
		minRotationDeg: 10,
		maxRotationDeg: 30,
		opacityFadeStartProgress: 0.5,
		keyframeSteps: 20
	},
	floatingText: {
		fontSizeRem: 4.5,
		strokeWidthPx: 1,
		strokeColor: 'white',
		durationMs: 650,
		speedPxPerMs: 0.32,
		gravityPxPerMs2: 0.000_99,
		angleRangeDeg: 45,
		opacityFadeStartProgress: 0.65,
		keyframeSteps: 9
	}
}

export default theme
