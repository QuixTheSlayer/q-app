"use client";

import * as React from "react";
import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { cn } from "@/libs/cn";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
	opts?: CarouselOptions & {
		autoPlay?: boolean;
	};
	autoPlayOptions?: Partial<Parameters<typeof Autoplay>[0]>;
	plugins?: CarouselPlugin | CarouselPlugin[];
	orientation?: "horizontal" | "vertical";
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	selectedIndex: number;
	scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

function Carousel({
	orientation = "horizontal",
	opts,
	autoPlayOptions,
	setApi,
	plugins,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & CarouselProps) {
	const [carouselRef, api] = useEmblaCarousel(
		{
			...opts,
			axis: orientation === "horizontal" ? "x" : "y",
		},
		[
			Autoplay({
				delay: 1500,
				playOnInit: opts?.autoPlay,
				stopOnFocusIn: false,
				stopOnMouseEnter: false,
				stopOnInteraction: false,
        stopOnLastSnap:false,
        active: opts?.autoPlay,
				...autoPlayOptions,
			}),
		],
	);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

	// React.useEffect(() => {
	// //console.log("autoplay option: ", opts?.autoPlay);
	//   if(opts?.autoPlay) {
	//     api?.plugins()?.autoplay.play()
	//   } else {
	//     api?.plugins()?.autoplay.stop()
	//   }
	// }, [opts?.autoPlay])

	const onSelect = React.useCallback((api: CarouselApi) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
		setSelectedIndex(api.selectedScrollSnap());
	}, []);

	const scrollPrev = React.useCallback(() => {
		api?.scrollPrev();
	}, [api]);

	const scrollNext = React.useCallback(() => {
		api?.scrollNext();
	}, [api]);

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

	React.useEffect(() => {
		if (!api || !setApi) return;
		setApi(api);
	}, [api, setApi]);

	React.useEffect(() => {
		if (!api) return;
		onSelect(api);
		setScrollSnaps(api.scrollSnapList());
		api.on("reInit", onSelect);
		api.on("reInit", () => setScrollSnaps(api.scrollSnapList()));
		api.on("select", onSelect);

		return () => {
			api?.off("select", onSelect);
		};
	}, [api, onSelect, setScrollSnaps]);

	return (
		<CarouselContext.Provider
			value={{
				carouselRef,
				api: api,
				opts,
				orientation:
					orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
				scrollPrev,
				scrollNext,
				canScrollPrev,
				canScrollNext,
				selectedIndex,
				scrollSnaps,
			}}
		>
			<div
				onKeyDownCapture={handleKeyDown}
				className={cn("relative", className)}
				role="region"
				aria-roledescription="carousel"
				data-slot="carousel"
				{...props}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className="overflow-hidden"
			data-slot="carousel-content"
			style={{
				fontSize: "16em",
			}}
		>
			<div
				className={cn(
					"flex",
					// orientation === "horizontal" ? "-ml-[1em]" : "-mt-4 flex-col",
					// orientation === "horizontal" ? "" : "flex-col",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
	const { orientation } = useCarousel();

	return (
		<div
			role="group"
			aria-roledescription="slide"
			data-slot="carousel-item"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				// orientation === "horizontal" ? "pl-4" : "pt-4",
				className,
			)}
			{...props}
		/>
	);
}

function CarouselPrevious({
	className,
	variant = "outline",
	...props
}: React.ComponentProps<typeof Button>) {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<button
			data-slot="carousel-previous"
			className={cn(
				"absolute size-[2.5em] rounded-full border border-neutral-400 flex items-center justify-center bg-white backdrop-blur-md cursor-pointer z-2 shadow-sm",
				orientation === "horizontal"
					? "top-1/2 left-[1em] -translate-y-1/2"
					: "-top-12 left-1/2 -translate-x-1/2 rotate-90",
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
	variant = "outline",
	...props
}: React.ComponentProps<typeof Button>) {
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<button
			data-slot="carousel-next"
			className={cn(
				"absolute size-[2.5em] rounded-full border border-neutral-400 flex items-center justify-center bg-white backdrop-blur-md cursor-pointer z-2 shadow-sm",
				orientation === "horizontal"
					? "top-1/2 right-[1em] -translate-y-1/2"
					: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
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
	const { api, selectedIndex, scrollSnaps } = useCarousel();
	console.log("scroll dots: ", selectedIndex, scrollSnaps);
	return (
		<div
			className="absolute flex items-center justify-center gap-2 mt-4 left-1/2 -translate-x-1/2 bottom-[1em]"
			data-slot="carousel-dots"
		>
			{scrollSnaps.map((snap, index) => (
				<button
					key={index}
					className={cn(
						"size-[0.75em] rounded-full",
						index === selectedIndex ? "bg-primary" : "bg-gray-400/80",
					)}
					onClick={() => api?.scrollTo(index)}
					aria-label={`Go to slide ${index + 1}`}
				/>
			))}
		</div>
	);
}

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	CarouselDots,
};
