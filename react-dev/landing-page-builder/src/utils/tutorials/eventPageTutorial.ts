import {
	generateHeroTemplate,
	generateNavBarTemplate,
	generateFooterTemplate,
	generateTimelineTemplate,
	generateCardsTemplate,
	generateEventWidgetsGroupTemplate,
} from '@/utils/readyMadeTemplates'
import { useEditor } from '@/context/EditorContext'

export interface TutorialStep {
	id: string
	title: string
	description: string
	longDescription?: string
	action?: () => void
	targetElement?: string
	tips?: string[]
	icon?: string
}

export type EventPageTutorialType = 'conference' | 'product-launch' | 'wedding' | 'fundraiser'

export const EVENT_PAGE_TUTORIALS: Record<EventPageTutorialType, TutorialStep[]> = {
	conference: [
		{
			id: 'hero',
			title: '✨ Add Hero Section',
			description: 'Grab attention with a stunning hero section featuring your event name and date.',
			longDescription:
				'The hero section is the first thing visitors see. Make it memorable with a high-quality background image, compelling headline, and clear call-to-action.',
			tips: [
				'Use high-resolution event imagery',
				'Keep the headline short and punchy (5-10 words)',
				'Add a prominent "Register Now" button',
				'Include the date prominently',
			],
			icon: '🎭',
		},
		{
			id: 'navbar',
			title: '🧭 Add Navigation Bar',
			description: 'Help visitors find key information with a sticky navigation menu.',
			longDescription:
				'A navigation bar provides easy access to important sections: Schedule, Speakers, Venue, Registration.',
			tips: [
				'Include links to: Home, Schedule, Speakers, Venue, Register',
				'Use a sticky navbar so it stays visible while scrolling',
				'Keep it minimal - max 5-6 links',
			],
			icon: '🧭',
		},
		{
			id: 'speakers',
			title: '🎤 Add Featured Speakers',
			description: 'Showcase your keynote speakers and build credibility.',
			longDescription:
				'Highlight your speakers with photos, names, titles, and brief bios. This helps attendees know what to expect.',
			tips: [
				'Use professional headshots',
				'Include speaker credentials or titles',
				'Add short, compelling speaker bios (2-3 sentences)',
				'Feature your most prominent speakers first',
			],
			icon: '🎤',
		},
		{
			id: 'timeline',
			title: '⏰ Add Event Schedule',
			description: 'Display the event schedule so attendees know what to expect.',
			longDescription:
				'A clear timeline or schedule helps attendees plan their day and ensures they don\'t miss important sessions.',
			tips: [
				'Use a clear time format (e.g., 9:00 AM - 10:30 AM)',
				'Include session names and speaker names',
				'Add break times for realism',
				'Color-code by track if it\'s multi-track',
			],
			icon: '⏰',
		},
		{
			id: 'venue',
			title: '📍 Add Venue Information',
			description: 'Show location details and how to get there.',
			longDescription: 'Include the venue address, directions, parking info, and a map so attendees can plan their travel.',
			tips: [
				'Add full address with ZIP code',
				'Include parking information',
				'Add a map or directions link',
				'List nearby hotels for out-of-town attendees',
			],
			icon: '📍',
		},
		{
			id: 'footer',
			title: '🔗 Add Footer with Contact Info',
			description: 'Provide contact and social media links.',
			longDescription:
				'The footer keeps important links and contact info accessible. Include social media, email, and privacy links.',
			tips: [
				'Add email for questions',
				'Link to social media channels',
				'Include privacy policy and terms',
				'Add copyright year',
			],
			icon: '🔗',
		},
	],
	'product-launch': [
		{
			id: 'hero',
			title: '✨ Add Hero Section',
			description: 'Create an impactful product launch hero with your product image and value proposition.',
			longDescription:
				'The hero section should immediately communicate what your product is and why it matters. Use a clear product image or video.',
			tips: [
				'Feature a high-quality product image or demo video',
				'Lead with the key benefit, not just the name',
				'Use power words: "Revolutionary", "Game-changing", "Introducing"',
				'Add a prominent "Get Early Access" or "Learn More" button',
			],
			icon: '✨',
		},
		{
			id: 'problem-solution',
			title: '💡 Add Problem & Solution Section',
			description: 'Show the problem your product solves.',
			longDescription:
				'Help visitors understand the problem before showcasing your solution. This creates context and urgency.',
			tips: [
				'Start with the customer\'s problem (not your product)',
				'Use relatable language and examples',
				'Show the pain of the current situation',
				'Then reveal your solution',
			],
			icon: '💡',
		},
		{
			id: 'features',
			title: '⭐ Add Features & Benefits',
			description: 'Highlight the key features and benefits of your product.',
			longDescription:
				'List 3-5 main features with clear benefits. Use icons, images, and short descriptions for each.',
			tips: [
				'Focus on benefits, not just features',
				'Use one feature per card',
				'Add icons to make it visual',
				'Keep descriptions concise (1-2 sentences)',
			],
			icon: '⭐',
		},
		{
			id: 'pricing',
			title: '💰 Add Pricing Section',
			description: 'Show your pricing plans and value tiers.',
			longDescription:
				'A clear pricing section reduces friction in the buying decision. Show different tiers if applicable.',
			tips: [
				'Highlight the most popular plan',
				'Show annual vs monthly pricing',
				'List what\'s included in each tier',
				'Add a "Get Started" button on each plan',
			],
			icon: '💰',
		},
		{
			id: 'testimonials',
			title: '💬 Add Social Proof',
			description: 'Add early user testimonials or beta feedback.',
			longDescription:
				'Social proof is powerful for product launches. Use quotes from beta testers, advisors, or industry experts.',
			tips: [
				'Get permission before featuring testimonials',
				'Include name, title, and company',
				'Use authentic quotes (not marketing speak)',
				'Add a photo or avatar if possible',
			],
			icon: '💬',
		},
		{
			id: 'cta',
			title: '🚀 Add Call-to-Action Section',
			description: 'Create urgency with a clear next step.',
			longDescription:
				'End with a strong CTA encouraging sign-ups, pre-orders, or waitlist joins. Consider adding an incentive.',
			tips: [
				'Use action words: "Get Started", "Join Waitlist", "Pre-Order Now"',
				'Add scarcity if applicable: "Limited seats", "Early bird pricing"',
				'Make the button prominent and contrasting',
				'Add follow-up options: email, SMS, etc.',
			],
			icon: '🚀',
		},
		{
			id: 'footer',
			title: '🔗 Add Footer',
			description: 'Provide links and contact information.',
			tips: [
				'Link to documentation or help center',
				'Add support email',
				'Include social media links',
				'Add privacy and terms links',
			],
			icon: '🔗',
		},
	],
	wedding: [
		{
			id: 'hero',
			title: '💍 Add Beautiful Hero Section',
			description: 'Welcome guests with a stunning hero featuring your names and wedding date.',
			longDescription:
				'The hero sets the tone for your wedding website. Use an elegant design with your names, date, and location prominently.',
			tips: [
				'Feature your engagement photo or wedding imagery',
				'Use elegant fonts and colors',
				'Display date in large text',
				'Add location or "Save the Date"',
			],
			icon: '💍',
		},
		{
			id: 'story',
			title: '💕 Add Your Love Story',
			description: 'Share how you met and your journey together.',
			longDescription: 'Guests love hearing your story. Share how you met, key moments, and what your partner means to you.',
			tips: [
				'Keep it genuine and personal',
				'Include photos from different stages of your relationship',
				'Mention important people (like how you met, proposals)',
				'Write in a warm, conversational tone',
			],
			icon: '💕',
		},
		{
			id: 'wedding-party',
			title: '👥 Add Wedding Party',
			description: 'Introduce your groomsmen, bridesmaids, and family members.',
			longDescription:
				'Feature photos and names of those in your wedding party. Personal touches make guests feel special.',
			tips: [
				'Include photos of each person',
				'Add their names and relationship to you',
				'Consider adding fun facts about each person',
				'Organize by role (groomsmen, bridesmaids, etc.)',
			],
			icon: '👥',
		},
		{
			id: 'schedule',
			title: '📅 Add Wedding Day Timeline',
			description: 'Show the ceremony and reception schedule.',
			longDescription:
				'Help guests know what time to arrive and what to expect. Include ceremony time, cocktail hour, and reception details.',
			tips: [
				'Start with arrival/doors open time',
				'Be specific: "Ceremony begins at 4:00 PM"',
				'Include estimated durations',
				'Note any special events (toasts, dances, etc.)',
			],
			icon: '📅',
		},
		{
			id: 'location',
			title: '📍 Add Venue & Travel Info',
			description: 'Provide venue address, directions, and accommodation suggestions.',
			longDescription:
				'Help out-of-town guests plan their trip. Include venue address, parking, hotels, and directions.',
			tips: [
				'Add full venue name and address',
				'Provide parking information and costs',
				'Recommend nearby hotels',
				'Add directions link to Google Maps',
				'Include airport information if applicable',
			],
			icon: '📍',
		},
		{
			id: 'registry',
			title: '🎁 Add Gift Registry',
			description: 'Link to your gift registry and giving preferences.',
			longDescription:
				'Make it easy for guests to give gifts. Link to your registry or explain how you prefer to receive gifts.',
			tips: [
				'Link to your registry (Zola, Amazon, etc.)',
				'Explain your preferences diplomatically',
				'Mention charity donations if applicable',
				'Remind guests: "Your presence is the greatest gift"',
			],
			icon: '🎁',
		},
		{
			id: 'rsvp',
			title: '✉️ Add RSVP & Contact',
			description: 'Make it easy for guests to respond and ask questions.',
			longDescription:
				'Provide clear RSVP instructions and contact information. Consider an online form for easier tracking.',
			tips: [
				'Include RSVP deadline',
				'Provide email or phone for questions',
				'Mention dietary restrictions if you need to know',
				'Keep it simple and friendly',
			],
			icon: '✉️',
		},
	],
	fundraiser: [
		{
			id: 'hero',
			title: '💚 Add Inspiring Hero Section',
			description: 'Create an emotional connection with your cause right from the start.',
			longDescription:
				'Your hero should immediately communicate the cause and create an emotional connection. Use powerful imagery and messaging.',
			tips: [
				'Use imagery that shows the impact of your cause',
				'Lead with the emotional/human element',
				'State your fundraising goal clearly',
				'Include a prominent "Donate Now" button',
			],
			icon: '💚',
		},
		{
			id: 'mission',
			title: '🎯 Add Mission & Impact',
			description: 'Explain what you\'re raising funds for and why it matters.',
			longDescription:
				'Help donors understand the mission. Share the problem you\'re addressing and the change you want to create.',
			tips: [
				'Be specific about the cause',
				'Use real numbers/data if available',
				'Share personal stories of impact',
				'Explain the urgency',
			],
			icon: '🎯',
		},
		{
			id: 'funds-use',
			title: '💵 Show How Funds Will Be Used',
			description: 'Break down how donations will be allocated.',
			longDescription:
				'Transparency builds trust. Show how much of each dollar goes to different areas (e.g., 85% to programs, 10% to operations).',
			tips: [
				'Use a pie chart or percentage breakdown',
				'Be transparent about admin costs',
				'Show specific uses: "Your $50 feeds a family for a week"',
				'Update as you hit milestones',
			],
			icon: '💵',
		},
		{
			id: 'impact-stories',
			title: '📖 Add Impact Stories',
			description: 'Share real stories of people helped by your cause.',
			longDescription:
				'Stories are powerful. Feature testimonials or case studies showing the real impact of donations.',
			tips: [
				'Get permission before sharing stories',
				'Include photos/videos if possible',
				'Use real names and details',
				'Show before/after or transformation',
			],
			icon: '📖',
		},
		{
			id: 'donation-levels',
			title: '🎖️ Add Giving Levels',
			description: 'Show different donation tiers and what each supports.',
			longDescription:
				'Help donors understand their giving options. Show what their donation accomplishes at different levels.',
			tips: [
				'"$25 provides one meal"',
				'"$100 supports one person"',
				'"$500 sponsors a program"',
				'Highlight the most common giving level',
			],
			icon: '🎖️',
		},
		{
			id: 'team',
			title: '👨‍💼 Add Team & Organization Info',
			description: 'Build trust by showing who\'s behind the fundraiser.',
			longDescription:
				'Share information about your organization, team members, and credentials. This builds credibility and trust.',
			tips: [
				'Include photos and bios of key team members',
				'Share organizational credentials/certifications',
				'Mention years of experience',
				'Include testimonials from past beneficiaries',
			],
			icon: '👨‍💼',
		},
		{
			id: 'faq',
			title: '❓ Add FAQ Section',
			description: 'Answer common questions about your fundraiser.',
			longDescription:
				'Anticipate and answer questions: Is this tax-deductible? Where is the money going? How will I know impact?',
			tips: [
				'Address transparency concerns upfront',
				'Explain tax-deductibility',
				'Share how donors will be updated',
				'Handle common objections',
			],
			icon: '❓',
		},
	],
}

export function getTutorialSteps(type: EventPageTutorialType): TutorialStep[] {
	return EVENT_PAGE_TUTORIALS[type] || []
}

export function getTutorialTitle(type: EventPageTutorialType): string {
	const titles: Record<EventPageTutorialType, string> = {
		conference: 'Conference Event Page',
		'product-launch': 'Product Launch Page',
		wedding: 'Wedding Website',
		fundraiser: 'Fundraiser Page',
	}
	return titles[type]
}
