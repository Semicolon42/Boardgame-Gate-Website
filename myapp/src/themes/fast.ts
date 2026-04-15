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
		outlineInactive: 'rgb(40, 40, 40)',
		outlineInactiveHover: 'rgb(80, 80, 80)',
		textPrimary: 'rgb(225, 225, 225)',
		textSecondary: 'rgb(200, 199, 199)',
		textDamage: 'rgb(255, 46, 46)',
		textHealing: 'rgb(106, 221, 106)'
	},
	fearamid: {
		highlightColor: 'rgba(250, 204, 21, 0.7)'
	},
	vp: {
		strokeColor: 'white',
		strokeWidthPx: 3
	},
	cardAnimation: {
		drawDurationMs: 80,
		drawEasing: 'ease-out',
		discardDurationMs: 80,
		discardEasing: 'ease-in'
	},
	enemyDiscard: {
		durationMs: 200,
		speedPxPerMs: 0.5,
		gravityPxPerMs2: 0.005,
		minRotationDeg: 10,
		maxRotationDeg: 30,
		opacityFadeStartProgress: 0.4,
		keyframeSteps: 10
	},
	floatingText: {
		fontSizeRem: 3,
		strokeWidthPx: 3,
		strokeColor: 'white',
		durationMs: 300,
		speedPxPerMs: 0.5,
		gravityPxPerMs2: 0.003,
		angleRangeDeg: 30,
		opacityFadeStartProgress: 0.5,
		keyframeSteps: 12
	}
}

export default theme
