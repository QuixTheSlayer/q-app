import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft, LuLayoutDashboard, LuLockKeyhole, LuMail, LuRefreshCw, LuSearchX, LuServerCrash, LuTimer } from 'react-icons/lu'
import type { IconType } from 'react-icons'
import editorConfig from '@/configs/editor.config'
import { getIdFromUrl } from '@/utils/getIdFromUrl'
import type { ErrorPageStatus } from '@/utils/isUnauthorizedError'

interface ErrorPageProps {
	/** 401 = not signed in, 403 = not allowed, 404 = not found, 429 = too many requests, 500 = server error. */
	status?: ErrorPageStatus
	/** The page the user tried to open; defaults to the id in the address. */
	pageId?: string
	/** Where "Back to dashboard" goes; null leaves the button out (a visitor of the public page has no dashboard). */
	dashboardUrl?: string | null
	/** The public event page: wording for a visitor instead of the page owner. */
	publicPage?: boolean
}

/** Seconds the "Try again" button waits on a 429, so a retry does not hit the limit again. */
const RATE_LIMIT_WAIT = 30

const ICONS: Record<ErrorPageStatus, IconType> = { 401: LuLockKeyhole, 403: LuLockKeyhole, 404: LuSearchX, 429: LuTimer, 500: LuServerCrash }

const BUTTON = 'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed'

/** The wording set for a status; the public page has its own text for 401, 403 and 404. */
function copyKey(status: ErrorPageStatus, publicPage: boolean) {
	if (status === 404) return publicPage ? 'errorPage.notFoundPublic' : 'errorPage.notFound'
	if (status === 429) return 'errorPage.tooManyRequests'
	if (status === 500) return 'errorPage.serverError'
	if (publicPage) return 'unauthorized.publicPage'
	return status === 401 ? 'unauthorized.signIn' : 'unauthorized.noAccess'
}

/**
 * Shown when the backend refuses or fails a page (401, 403, 404, 429, 500): says what happened, why it may have
 * happened and what to do, and puts the details into a support email. Light theme with the app's green accent.
 */
function ErrorPage({ status = 403, pageId, dashboardUrl = '/landing-page-builder/dashboard', publicPage = false }: ErrorPageProps) {
	const { t } = useTranslation('common')
	const id = pageId ?? getIdFromUrl()
	const key = copyKey(status, publicPage)
	const reasons = t(`${key}.reasons`, { returnObjects: true }) as string[]
	const Icon = ICONS[status]

	// A 429 keeps the retry button off for a short while.
	const [wait, setWait] = useState(status === 429 ? RATE_LIMIT_WAIT : 0)
	useEffect(() => {
		if (wait <= 0) return
		const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000)
		return () => window.clearTimeout(timer)
	}, [wait])

	const details = [`Status: ${status}`, id ? `Page: ${id}` : '', `URL: ${window.location.href}`, `Time: ${new Date().toISOString()}`].filter(Boolean).join('\n')
	const retryLabel = wait > 0 ? t('errorPage.retryIn', { seconds: wait }) : status === 401 && !publicPage ? t('unauthorized.signInAgain') : t('unauthorized.tryAgain')
	// Retrying a missing page does nothing, so on a 404 the dashboard is the main action.
	const retryIsMain = !dashboardUrl || status === 429 || status === 500

	return (
		<main aria-labelledby='error-page-title' className='relative min-h-screen w-full flex items-center justify-center px-4 py-10 bg-[#F6F7F4] text-[#1B211C] overflow-hidden'>
			<div aria-hidden className='pointer-events-none absolute inset-0' style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgb(31 138 84 / 0.10), transparent 70%)' }} />

			<section className='relative w-full max-w-xl rounded-xl border border-[#DCE1DA] bg-white shadow-xl shadow-black/10'>
				<div className='flex flex-col items-center text-center px-6 pt-10 pb-6 sm:px-10'>
					<div className='relative'>
						<div className='size-20 rounded-full bg-[#E3F1E8] ring-1 ring-[#1F8A54]/30 flex items-center justify-center text-[#1F8A54]'>
							<Icon size={34} aria-hidden />
						</div>
						<span className='absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white border border-[#DCE1DA] px-2.5 py-0.5 text-[11px] font-mono tracking-wider text-[#5E6A61]'>{status}</span>
					</div>

					<p className='mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#1F7A4D]'>{t(`${key}.kicker`)}</p>
					<h1 id='error-page-title' className='mt-2 text-2xl sm:text-3xl font-bold leading-tight text-balance'>{t(`${key}.title`)}</h1>
					<p className='mt-3 text-sm sm:text-base text-[#5E6A61] max-w-md text-pretty'>{t(`${key}.description`)}</p>
				</div>

				<div className='px-6 sm:px-10 pb-2'>
					<h2 className='text-xs font-semibold uppercase tracking-wider text-[#5E6A61] mb-2'>{t('unauthorized.whyTitle')}</h2>
					<ul className='grid gap-2 text-sm text-[#2B352D]'>
						{reasons.map((reason) => (
							<li key={reason} className='flex gap-2.5'>
								<span aria-hidden className='mt-2 size-1.5 shrink-0 rounded-full bg-[#1F8A54]' />
								<span>{reason}</span>
							</li>
						))}
					</ul>
				</div>

				<div className='px-6 sm:px-10 pt-6 pb-2 flex flex-col sm:flex-row gap-2.5'>
					{(dashboardUrl && status !== 401) && (
						<a href={dashboardUrl??''} className={`${BUTTON} ${retryIsMain ? 'border border-[#C9D1C8] text-[#1B211C] hover:bg-[#EEF1EC]' : 'bg-[#1F8A54] text-white hover:bg-[#1A7548]'} sm:flex-1`}>
							<LuLayoutDashboard size={16} aria-hidden />
							{t('unauthorized.backToDashboard')}
						</a>
					)}
					<button type='button' disabled={wait > 0} onClick={() => status === 401 ? window.location.replace('/users/login'): window.location.reload()} className={`${BUTTON} ${retryIsMain ? 'bg-[#1F8A54] text-white hover:bg-[#1A7548]' : 'border border-[#C9D1C8] text-[#1B211C] hover:bg-[#EEF1EC]'} sm:flex-1`}>
						<LuRefreshCw size={16} aria-hidden />
						{retryLabel}
					</button>
					<button type='button' onClick={() => window.history.back()} className={`${BUTTON} text-[#5E6A61] hover:bg-[#EEF1EC] hover:text-[#1B211C]`}>
						<LuArrowLeft size={16} aria-hidden />
						{t('unauthorized.goBack')}
					</button>
				</div>

				<div className='mt-6 border-t border-[#DCE1DA] px-6 sm:px-10 py-5'>
					<p className='text-sm text-[#5E6A61]'>
						{t('unauthorized.support')}{' '}
						<a className='inline-flex items-center gap-1 font-semibold text-[#1F7A4D] underline underline-offset-2' href={`mailto:${editorConfig.support_email}?subject=${encodeURIComponent(`Access problem (${status})`)}&body=${encodeURIComponent(details)}`}>
							<LuMail size={14} aria-hidden />
							{editorConfig.support_email}
						</a>
					</p>
				</div>
			</section>
		</main>
	)
}

export default ErrorPage
