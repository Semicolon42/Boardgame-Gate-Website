import {WaButton, WaCard, WaCarousel, WaCarouselItem, WaTooltip} from '@awesome.me/webawesome/dist/react'
import {type RefObject, useRef, useState} from 'react'
import {TUTORIAL_SLIDES, type TutorialRefs} from './tutorialSlides'

interface Props {
	isActive: boolean
}

const SCALE = 0.6

export function TutorialView({isActive}: Props) {
	const [slideIndex, setSlideIndex] = useState(0)

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

	const go = (next: number) => {
		setSlideIndex(next)
		carouselRef.current?.goToSlide(next)
	}

	return (
		<div className='flex flex-col gap-4 p-4'>
			<h2 className='text-lg font-semibold'>
				{TUTORIAL_SLIDES[slideIndex]?.title ?? 'How to Play'}
			</h2>

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
						<WaCard appearance='outlined' style={{height: '100%', overflowY: 'auto'}}>
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
								 * Tooltips only open when this slide is active AND the view is
								 * visible — prevents portal-rendered popups bleeding through
								 * when the view is hidden behind another.
								 */}
								{slide.annotations.map(a => (
									<WaTooltip
										key={a.id}
										for={a.id}
										open={isActive && i === slideIndex}
										placement={a.placement}
										trigger='manual'
									>
										{a.text}
									</WaTooltip>
								))}
							</div>

							{/* Description text */}
							<div className='mt-4 text-sm leading-relaxed text-(--color-card-text)'>
								{slide.description}
							</div>
						</WaCard>
					</WaCarouselItem>
				))}
			</WaCarousel>

			{/* Slide navigation */}
			<div className='flex items-center gap-2'>
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
				<WaButton
					appearance='filled'
					disabled={slideIndex === total - 1}
					onClick={() => go(slideIndex + 1)}
					variant='brand'
				>
					Next
				</WaButton>
			</div>
		</div>
	)
}
