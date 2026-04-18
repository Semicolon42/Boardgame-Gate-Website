export interface GateTheme {
	colors: {
		gameboardBackground: string
		cardText: string
		cardBack: string
		cardFace: string
		enemyCardBack: string
		enemyCardFace: string
		baseBack: string
		baseText: string
		cardActionPlayed: string
		outlineNormal: string
		outlineNormalHover: string
		outlineActive: string
		outlineActiveHover: string
		outlineTrashable: string
		outlineTrashableHover: string
		outlineAttackable: string
		outlineAttackableHover: string
		outlineInactive: string
		outlineInactiveHover: string
		textPrimary: string
		textSecondary: string
		textDamage: string
		textHealing: string
	}
	fearamid: {
		highlightColor: string
	}
	vp: {
		strokeWidthPx: number
		strokeColor: string
	}
	cardAnimation: {
		drawDurationMs: number
		drawEasing: string
		discardDurationMs: number
		discardEasing: string
		pulseDurationMs: number
	}
	enemyDiscard: {
		durationMs: number
		speedPxPerMs: number
		gravityPxPerMs2: number
		minRotationDeg: number
		maxRotationDeg: number
		opacityFadeStartProgress: number
		keyframeSteps: number
	}
	floatingText: {
		fontSizeRem: number
		strokeWidthPx: number
		strokeColor: string
		durationMs: number
		speedPxPerMs: number
		gravityPxPerMs2: number
		angleRangeDeg: number
		opacityFadeStartProgress: number
		keyframeSteps: number
	}
}
