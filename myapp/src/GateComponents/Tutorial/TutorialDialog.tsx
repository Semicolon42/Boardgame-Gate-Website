import {
	WaButton,
	WaCard,
	WaCarousel,
	WaCarouselItem,
	WaDialog,
	WaTooltip
} from '@awesome.me/webawesome/dist/react'
import {type RefObject, useRef, useState} from 'react'
import {TUTORIAL_SLIDES, type TutorialRefs} from './tutorialSlides'

interface Props {
	isOpen: boolean
	onClose: () => void
}

const SCALE = 0.6

export function TutorialDialog({isOpen, onClose}: Props) {
	const [slideIndex, setSlideIndex] = useState(0)

	// Imperative handle to drive carousel from footer buttons.
	// Typed as HTMLElement intersection so it satisfies the ref prop without
	// importing the internal WaCarousel class.
	const carouselRef = useRef<
		HTMLElement & {goToSlide: (index: number, behavior?: ScrollBehavior) => void}
	>(null)

	// Dummy refs required by PlayerBaseRow's interface — never read (no animations run)
	const farmRef = useRef<HTMLDivElement | null>(null)
	const gateRef = useRef<HTMLDivElement | null>(null)
	const towerRef = useRef<HTMLDivElement | null>(null)
	const fearamidRef = useRef<HTMLDivElement | null>(null)
	const refs: TutorialRefs = {farmRef, gateRef, towerRef, fearamidRef}

	const total = TUTORIAL_SLIDES.length
	const currentSlide = TUTORIAL_SLIDES[slideIndex]
	if (currentSlide === undefined) return null

	const go = (next: number) => {
		setSlideIndex(next)
		carouselRef.current?.goToSlide(next)
	}

	const handleClose = () => {
		setSlideIndex(0)
		carouselRef.current?.goToSlide(0, 'instant')
		onClose()
	}

	return (
		<WaDialog
			label={currentSlide.title}
			onWaHide={handleClose}
			open={isOpen}
			style={{['--width' as string]: 'min(95vw, 1100px)'}}
		>
			{/*
			 * --aspect-ratio=unset lets the carousel grow to the explicit height.
			 * Height chosen to fit ~340px scaled board + description text.
			 */}
			<WaCarousel
				ref={carouselRef as RefObject<null>}
				style={{
					['--aspect-ratio' as string]: 'unset',
					height: '520px'
				}}
			>
				{TUTORIAL_SLIDES.map((slide, i) => (
					<WaCarouselItem key={i} style={{['--aspect-ratio' as string]: 'unset'}}>
						<WaCard
							appearance='outlined'
							style={{height: '100%', overflowY: 'auto'}}
						>
							{/* Scaled board preview */}
							<div
								className='relative overflow-hidden rounded bg-(--color-gameboard-background)'
								style={{height: '340px'}}
							>
								<div
									className='pointer-events-none'
									style={{
										transform: `scale(${SCALE})`,
										transformOrigin: 'top left',
										width: `${(1 / SCALE) * 100}%`
									}}
								>
									{slide.boardContent(refs)}
								</div>

								{/*
								 * Only open tooltips for the current slide so off-screen slides
								 * don't render floating tooltips into the viewport.
								 */}
								{slide.annotations.map(a => (
									<WaTooltip
										key={a.id}
										for={a.id}
										open={i === slideIndex}
										placement={a.placement}
										trigger='manual'
									>
										{a.text}
									</WaTooltip>
								))}
							</div>

							{/* Description text below the board */}
							<div className='mt-4 text-sm leading-relaxed text-(--color-card-text)'>
								{slide.description}
							</div>
						</WaCard>
					</WaCarouselItem>
				))}
			</WaCarousel>

			{/* Footer navigation — the only way to change slides */}
			<div className='flex items-center gap-2' slot='footer'>
				<span className='flex-1 text-xs text-gray-400'>
					{slideIndex + 1} / {total}
				</span>
				<WaButton
					disabled={slideIndex === 0}
					onClick={() => go(slideIndex - 1)}
					variant='neutral'
				>
					Previous
				</WaButton>
				{slideIndex === total - 1 ? (
					<WaButton appearance='filled' onClick={handleClose} variant='brand'>
						Done
					</WaButton>
				) : (
					<WaButton
						appearance='filled'
						onClick={() => go(slideIndex + 1)}
						variant='brand'
					>
						Next
					</WaButton>
				)}
			</div>
		</WaDialog>
	)
}
