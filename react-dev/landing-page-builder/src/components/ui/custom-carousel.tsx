"use client";

import * as React from "react";
import { cn } from "@/libs/cn";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

type CarouselContextProps = {
	currentIndex: number;
	totalSlides: number;
	scrollPrev: () => void;
	scrollNext: () => void;
	scrollTo: (index: number) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);
	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}
	return context;
}

type CarouselProps = {
	opts?: {
		loop?: boolean;
		autoPlay?: boolean;
	};
	className?: string;
	children?: React.ReactNode;
};

function Carousel({
	opts = { loop: false, autoPlay: false },
	className,
	children,
	...props
}: React.ComponentProps<"div"> & CarouselProps) {
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [totalSlides, setTotalSlides] = React.useState(0);
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (containerRef.current) {
			const slides = containerRef.current.querySelectorAll('[data-carousel-item]');
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
		<CarouselContext.Provider
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
				aria-roledescription="carousel"
				{...props}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
	const { currentIndex } = useCarousel();

	return (
		<div className="overflow-hidden" style={{ fontSize: "16em" }}>
			<div
				className={cn("flex transition-transform duration-300 ease-in-out", className)}
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
				{...props}
			/>
		</div>
	);
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="group"
			aria-roledescription="slide"
			data-carousel-item
			className={cn("min-w-full shrink-0 grow-0 basis-full", className)}
			{...props}
		/>
	);
}

function CarouselPrevious({
	className,
	...props
}: React.ComponentProps<"button">) {
	const { scrollPrev, canScrollPrev } = useCarousel();

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

function CarouselNext({
	className,
	...props
}: React.ComponentProps<"button">) {
	const { scrollNext, canScrollNext } = useCarousel();

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

function CarouselDots() {
	const { currentIndex, totalSlides, scrollTo } = useCarousel();

	return (
		<div
			className="absolute flex items-center justify-center gap-2 mt-4 left-1/2 -translate-x-1/2 bottom-[1em]"
			data-slot="carousel-dots"
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

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots };
