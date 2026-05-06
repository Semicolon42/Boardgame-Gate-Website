import {WaButton, WaCard, WaCarousel, WaCarouselItem, WaIcon, WaTooltip} from '@awesome.me/webawesome/dist/react'
import {type RefObject, useRef, useState} from 'react'
import {TUTORIAL_SLIDES, type TutorialRefs} from './tutorialSlides'

interface Props {
	isActive: boolean
}

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
		<div className='flex flex-col gap-4 p-4 max-w-2xl'>
			<h2 className='text-lg font-semibold'>
				{TUTORIAL_SLIDES[slideIndex]?.title ?? 'How to Play'}
			</h2>

			<WaCarousel
				ref={carouselRef as RefObject<null>}
				onWaSlideChange={(e: Event) => {
					setSlideIndex((e as CustomEvent<{index: number}>).detail.index)
				}}
				style={{
					['--aspect-ratio' as string]: 'unset',
					['--scroll-hint' as string]: '3rem',
					height: '520px'
				}}
			>
				{TUTORIAL_SLIDES.map((slide, i) => (
					<WaCarouselItem key={i} style={{['--aspect-ratio' as string]: 'unset'}}>
						{/*
						 * [&::part(body)]:bg-transparent pierces the WaCard shadow DOM to
						 * clear the default solid surface fill, letting the page background
						 * show through.
						 */}
						<WaCard
							appearance='outlined'
							className='bg-(--color-gameboard-background-secondary)'
							style={{height: '100%', overflowY: 'auto'}}
						>
							{/* Scaled board preview — scale comes from the slide data */}
							<div
								className='relative overflow-hidden rounded bg-(--color-gameboard-background)'
								style={{height: '340px'}}
							>
								<div
									className='pointer-events-none'
									style={{
										transform: `scale(${slide.scale})`,
										transformOrigin: 'top left',
										width: `${(1 / slide.scale) * 100}%`
									}}
								>
									{slide.boardContent(refs)}
								</div>

								{/*
								 * Tooltips only open when this slide is current and the view is
								 * visible — prevents portal-rendered popups appearing over other
								 * views.
								 */}
								{slide.annotations.map(a => (
									<WaTooltip
										key={a.id}
										for={a.id}
										open={isActive && i === slideIndex}
										placement={a.placement}
										trigger='manual'
										color='orange'
									>
										{a.text}
									</WaTooltip>
								))}
							</div>

							{/* Description text */}
							<div className='text-sm leading-relaxed text-(--color-card-text)'>
								{slide.description}
							</div>
						</WaCard>
					</WaCarouselItem>
				))}
			</WaCarousel>

			<div className='flex items-center justify-center gap-2'>
				<WaButton	
					onClick={() => go(slideIndex - 1)}
					variant={slideIndex <= 0 ? 'neutral' : 'brand'}
					disabled={slideIndex === 0}
				>
					<WaIcon name='arrow-left' />
				</WaButton>
				<span className='text-xs text-gray-400 w-12 text-center'>
					{slideIndex + 1} / {total}
				</span>
				<WaButton
					onClick={() => go(slideIndex + 1)}
					variant={slideIndex+1 >= TUTORIAL_SLIDES.length ? 'neutral' : 'brand'}
					disabled={slideIndex+1 >= TUTORIAL_SLIDES.length}
				>
					<WaIcon name='arrow-right' />
				</WaButton>
			</div>
		</div>
	)
}
