"use client";

import * as React from "react";
import { cn } from "@/libs/cn";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

type SliderContextProps = {
	currentIndex: number;
	totalSlides: number;
	scrollPrev: () => void;
	scrollNext: () => void;
	scrollTo: (index: number) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
};

const SliderContext = React.createContext<SliderContextProps | null>(null);

function useSlider() {
	const context = React.useContext(SliderContext);
	if (!context) {
		throw new Error("useSlider must be used within a <Slider />");
	}
	return context;
}

type SliderProps = {
	opts?: {
		loop?: boolean;
		autoPlay?: boolean;
	};
	className?: string;
	children?: React.ReactNode;
};

function Slider({
	opts = { loop: false, autoPlay: false },
	className,
	children,
	...props
}: React.ComponentProps<"div"> & SliderProps) {
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [totalSlides, setTotalSlides] = React.useState(0);
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (containerRef.current) {
			const slides = containerRef.current.querySelectorAll('[data-slider-item]');
			setTotalSlides(slides.length);
		}
	}, [children]);

	React.useEffect(() => {
		if (opts.autoPlay && totalSlides > 1) {
			const interval = setInterval(() => {
				setCurrentIndex((prev) => {
					if (opts.loop) {
						return (prev + 1) % totalSlides;
					}
					return prev < totalSlides - 1 ? prev + 1 : prev;
				});
			}, 3000);
			return () => clearInterval(interval);
		}
	}, [opts.autoPlay, opts.loop, totalSlides]);

	const scrollPrev = React.useCallback(() => {
		setCurrentIndex((prev) => {
			if (opts.loop) {
				return prev === 0 ? totalSlides - 1 : prev - 1;
			}
			return Math.max(0, prev - 1);
		});
	}, [opts.loop, totalSlides]);

	const scrollNext = React.useCallback(() => {
		setCurrentIndex((prev) => {
			if (opts.loop) {
				return (prev + 1) % totalSlides;
			}
			return Math.min(totalSlides - 1, prev + 1);
		});
	}, [opts.loop, totalSlides]);

	const scrollTo = React.useCallback((index: number) => {
		setCurrentIndex(Math.max(0, Math.min(totalSlides - 1, index)));
	}, [totalSlides]);

	const canScrollPrev = opts.loop || currentIndex > 0;
	const canScrollNext = opts.loop || currentIndex < totalSlides - 1;

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				scrollPrev();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				scrollNext();
			}
		},
		[scrollPrev, scrollNext],
	);

	return (
		<SliderContext.Provider
			value={{
				currentIndex,
				totalSlides,
				scrollPrev,
				scrollNext,
				scrollTo,
				canScrollPrev,
				canScrollNext,
			}}
		>
			<div
				ref={containerRef}
				onKeyDownCapture={handleKeyDown}
				className={cn("relative", className)}
				role="region"
				aria-roledescription="slider"
				{...props}
			>
				{children}
			</div>
		</SliderContext.Provider>
	);
}

function SliderContent({ className, ...props }: React.ComponentProps<"div">) {
	const { currentIndex } = useSlider();

	return (
		<div className="overflow-hidden h-full" style={{ fontSize: "1em" }}>
			<div
				className={cn("flex h-full transition-transform duration-300 ease-in-out", className)}
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				{...props}
			/>
		</div>
	);
}

function SliderItem({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="group"
			aria-roledescription="slide"
			data-slider-item
			className={cn("min-w-full shrink-0 grow-0 basis-full", className)}
			{...props}
		/>
	);
}

function SliderPrevious({
	className,
	...props
}: React.ComponentProps<"button">) {
	const { scrollPrev, canScrollPrev } = useSlider();

	return (
		<button
			type="button"
			className={cn(
				"absolute size-[2.5em] rounded-full border border-neutral-400 flex items-center justify-center bg-white backdrop-blur-md cursor-pointer z-10 shadow-sm top-1/2 left-[1em] -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<IoChevronBackOutline className="size-[1.5em] text-primary" />
			<span className="sr-only">Previous slide</span>
		</button>
	);
}

function SliderNext({
	className,
	...props
}: React.ComponentProps<"button">) {
	const { scrollNext, canScrollNext } = useSlider();

	return (
		<button
			type="button"
			className={cn(
				"absolute size-[2.5em] rounded-full border border-neutral-400 flex items-center justify-center bg-white backdrop-blur-md cursor-pointer z-10 shadow-sm top-1/2 right-[1em] -translate-y-1/2 disabled:opacity-50 disabled:cursor-not-allowed",
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<IoChevronForwardOutline className="size-[1.5em] text-primary" />
			<span className="sr-only">Next slide</span>
		</button>
	);
}

function SliderDots() {
	const { currentIndex, totalSlides, scrollTo } = useSlider();

	return (
		<div
			className="absolute flex items-center justify-center gap-2 mt-4 left-1/2 -translate-x-1/2 bottom-[1em]"
			data-slot="slider-dots"
		>
			{Array.from({ length: totalSlides }).map((_, index) => (
				<button
					key={index}
					type="button"
					className={cn(
						"size-[0.75em] rounded-full transition-colors",
						index === currentIndex ? "bg-primary" : "bg-gray-400/80",
					)}
					onClick={() => scrollTo(index)}
					aria-label={`Go to slide ${index + 1}`}
				/>
			))}
		</div>
	);
}

export { Slider, SliderContent, SliderItem, SliderPrevious, SliderNext, SliderDots };
