import { useEditor } from '@/context/EditorContext'
import {
	generateHeroTemplate,
	generateNavBarTemplate,
	generateFooterTemplate,
	generateTimelineTemplate,
	generateCardsTemplate,
	generateEventWidgetsGroupTemplate,
	generateFaqTemplate,
	generatePricingToggleTemplate,
} from '@/utils/readyMadeTemplates'
import { generateNewNode } from '@/utils/canvas.utils'
import { CanvasNode } from '@/types/node.type'

/**
 * Auto-builder functions that add pre-configured sections with proper structure
 * Each function wraps template generators to ensure consistent layout
 */

export const tutorialAutoBuilder = {
	// Hero sections
	addHeroSection: (canvas: ReturnType<typeof useEditor>) => {
		const hero = generateHeroTemplate({
			heading: 'Your Event Title',
			subheading: 'Add your tagline or description here',
			ctaLabel: 'Register Now',
			imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
		})
		canvas.addNode(hero)
	},

	addNavBar: (canvas: ReturnType<typeof useEditor>) => {
		const navbar = generateNavBarTemplate({
			logoText: 'Event Name',
			links: [
				{ label: 'Home', href: '#' },
				{ label: 'Schedule', href: '#schedule' },
				{ label: 'Speakers', href: '#speakers' },
				{ label: 'Register', href: '#register' },
			],
			ctaLabel: 'Sign Up',
			ctaHref: '#register',
		})
		canvas.addNode(navbar)
	},

	addSpeakersSection: (canvas: ReturnType<typeof useEditor>) => {
		const speakers = generateCardsTemplate({
			heading: '🎤 Featured Speakers',
			cards: [
				{
					title: 'Speaker Name',
					description: 'Add speaker bio and credentials here',
					imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
				},
				{
					title: 'Speaker Name',
					description: 'Add speaker bio and credentials here',
					imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
				},
				{
					title: 'Speaker Name',
					description: 'Add speaker bio and credentials here',
					imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
				},
			],
		})
		canvas.addNode(speakers)
	},

	addEventSchedule: (canvas: ReturnType<typeof useEditor>) => {
		const schedule = generateTimelineTemplate({
			title: '⏰ Event Schedule',
			steps: [
				{ title: '8:00 AM', description: 'Doors Open & Registration' },
				{ title: '9:00 AM', description: 'Opening Keynote' },
				{ title: '10:30 AM', description: 'Coffee Break' },
				{ title: '11:00 AM', description: 'Panel Discussion' },
				{ title: '12:30 PM', description: 'Lunch' },
				{ title: '2:00 PM', description: 'Breakout Sessions' },
			],
		})
		canvas.addNode(schedule)
	},

	addVenueInfo: (canvas: ReturnType<typeof useEditor>) => {
		const venue = generateCardsTemplate({
			heading: '📍 Venue & Location',
			cards: [
				{
					title: 'Address',
					description: '123 Main Street, City, State 12345',
				},
				{
					title: 'Parking',
					description: 'Free parking available in lot B behind building',
				},
				{
					title: 'Transportation',
					description: 'Close to public transit - See directions',
				},
			],
		})
		canvas.addNode(venue)
	},

	addPricingSection: (canvas: ReturnType<typeof useEditor>) => {
		const pricing = generatePricingToggleTemplate({
			plans: [
				{
					name: 'Starter',
					monthlyPrice: '$29',
					yearlyPrice: '$290',
					features: ['Feature 1', 'Feature 2', 'Feature 3'],
				},
				{
					name: 'Professional',
					monthlyPrice: '$99',
					yearlyPrice: '$990',
					features: ['All Starter features', 'Feature 4', 'Feature 5', 'Feature 6'],
				},
				{
					name: 'Enterprise',
					monthlyPrice: '$299',
					yearlyPrice: '$2990',
					features: ['All Professional features', 'Feature 7', 'Feature 8', 'Custom support'],
				},
			],
		})
		canvas.addNode(pricing)
	},

	addTestimonials: (canvas: ReturnType<typeof useEditor>) => {
		const testimonials = generateCardsTemplate({
			heading: '💬 What People Are Saying',
			cards: [
				{
					title: '"Amazing experience!"',
					description: '- John Doe, Company Name',
				},
				{
					title: '"Highly recommended!"',
					description: '- Jane Smith, Company Name',
				},
				{
					title: '"Exceeded expectations!"',
					description: '- Bob Wilson, Company Name',
				},
			],
		})
		canvas.addNode(testimonials)
	},

	addFAQ: (canvas: ReturnType<typeof useEditor>) => {
		const faq = generateFaqTemplate({
			items: [
				{
					question: 'What is included in the ticket?',
					answer: 'Your ticket includes access to all sessions, lunch, and networking opportunities.',
				},
				{
					question: 'Is there a refund policy?',
					answer: 'Yes, we offer full refunds up to 7 days before the event.',
				},
				{
					question: 'Will this be recorded?',
					answer: 'Yes, all sessions will be recorded and sent to registered attendees.',
				},
				{
					question: 'Can I bring a guest?',
					answer: 'Guest passes are available for an additional fee. Contact us for details.',
				},
			],
		})
		canvas.addNode(faq)
	},

	addContactSection: (canvas: ReturnType<typeof useEditor>) => {
		const contact = generateEventWidgetsGroupTemplate({
			heading: '✉️ Get in Touch',
			description: 'Have questions? Contact us anytime!',
		})
		canvas.addNode(contact)
	},

	addFooter: (canvas: ReturnType<typeof useEditor>) => {
		const footer = generateFooterTemplate({
			tagline: 'Your event, your way.',
			columns: [
				{
					title: 'Company',
					links: [
						{ label: 'About Us', href: '#' },
						{ label: 'Contact', href: '#' },
					],
				},
				{
					title: 'Support',
					links: [
						{ label: 'Help Center', href: '#' },
						{ label: 'Terms', href: '#' },
					],
				},
			],
			copyrightText: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
		})
		canvas.addNode(footer)
	},
}

/**
 * Maps tutorial step IDs to auto-builder functions
 * Used by TutorialPanel to execute the correct action
 */
export const stepActionMap: Record<string, (canvas: ReturnType<typeof useEditor>) => void> = {
	hero: tutorialAutoBuilder.addHeroSection,
	navbar: tutorialAutoBuilder.addNavBar,
	speakers: tutorialAutoBuilder.addSpeakersSection,
	'wedding-party': tutorialAutoBuilder.addSpeakersSection, // Reuse same component
	timeline: tutorialAutoBuilder.addEventSchedule,
	schedule: tutorialAutoBuilder.addEventSchedule,
	location: tutorialAutoBuilder.addVenueInfo,
	venue: tutorialAutoBuilder.addVenueInfo,
	pricing: tutorialAutoBuilder.addPricingSection,
	'donation-levels': tutorialAutoBuilder.addPricingSection,
	testimonials: tutorialAutoBuilder.addTestimonials,
	'impact-stories': tutorialAutoBuilder.addTestimonials,
	faq: tutorialAutoBuilder.addFAQ,
	'problem-solution': tutorialAutoBuilder.addTestimonials,
	features: tutorialAutoBuilder.addSpeakersSection,
	cta: tutorialAutoBuilder.addContactSection,
	rsvp: tutorialAutoBuilder.addContactSection,
	contact: tutorialAutoBuilder.addContactSection,
	footer: tutorialAutoBuilder.addFooter,
	'funds-use': tutorialAutoBuilder.addTestimonials,
	story: tutorialAutoBuilder.addTestimonials,
	team: tutorialAutoBuilder.addSpeakersSection,
	mission: tutorialAutoBuilder.addTestimonials,
	'impact-stories': tutorialAutoBuilder.addTestimonials,
	registry: tutorialAutoBuilder.addContactSection,
	'giving-levels': tutorialAutoBuilder.addPricingSection,
}

export function getStepAction(stepId: string): ((canvas: ReturnType<typeof useEditor>) => void) | undefined {
	return stepActionMap[stepId]
}
