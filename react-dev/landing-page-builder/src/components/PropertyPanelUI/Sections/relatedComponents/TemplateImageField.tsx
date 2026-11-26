import useFileDrop from '@/hooks/useFileDrop'
import useUploadToS3 from '@/hooks/useUploadToS3'
import { cn } from '@/libs/cn'
import { useGetPageDataQuery } from '@/store/query'
import { Button, buttonVariants } from '@/components/ui/primitives/button'
import { ProgressBar } from '@/components/ui/primitives/progress-bar'
import FileUploadInput from '@/components/ui/inputs/FileUploadInput'
import { CiCirclePlus } from 'react-icons/ci'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

interface TemplateImageFieldProps {
	value: string | undefined
	onChange: (url: string) => void
	/**
	 * Some uiType variants have no image slot in their composition at all
	 * (e.g. Hero's centeredClassic — a plain heading+CTA card by design).
	 * When set, the upload UI is replaced with a short explanation instead
	 * of a dead drop zone the user could upload into with no visible effect.
	 */
	unsupportedForVariant?: boolean
}

/**
 * Drag/drop + click-to-upload image field for Ready Made Template fields
 * that hold a plain image URL string (Hero/PersonalCard's top-level
 * imageUrl, or a single card/column's imageUrl inside an array — the
 * caller's onChange decides where the URL is written, this component only
 * knows about a single string value). Mirrors ImageFlipFlopPanel's proven
 * upload flow (useUploadToS3 + useFileDrop, no crop/edit modal) rather than
 * the plain ImagePanel's modal-based editor, since templates only need a
 * quick swap-in image, not cropping.
 */
export default function TemplateImageField({ value, onChange, unsupportedForVariant }: TemplateImageFieldProps) {
	const { t } = useTranslation('propertyPanel')
	const inputId = useId()
	const { data } = useGetPageDataQuery('')
	const { handleUpload, selectedFile } = useUploadToS3({ subFolder: `${data?.id}` })

	const handleFileChange = async (files: FileList) => {
		if (!files.length) return
		const file = files[0]
		const response = await handleUpload(file)
		onChange(response?.access_url ?? '')
	}

	const { dragHandlers, isDragging } = useFileDrop(handleFileChange)

	if (unsupportedForVariant) {
		return (
			<div className="rounded-[0.65rem] border border-dashed border-border bg-muted px-3 py-3 text-[0.8rem] text-muted-foreground">
				{t('templateImageField.noImageSlotForVariant')}
			</div>
		)
	}

	return (
		<div {...dragHandlers}>
			{value || selectedFile ? (
				<div
					className={cn(
						'group relative flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border border-border bg-muted hover:border-primary/80 cursor-pointer overflow-hidden',
						isDragging && '!border-primary/80 border-2 !bg-primary/20 border-dashed',
					)}
				>
					<img src={value || selectedFile?.object_url} className="size-full object-cover" />
					{selectedFile?.status === 'loading' && (
						<div className="bg-slate-800/40 absolute flex flex-col w-full h-full items-center justify-center gap-2">
							<div className="text-white">{t('templateImageField.uploading')}</div>
							<ProgressBar value={Math.round(selectedFile.progress)} className="w-[7.5rem] h-[0.25rem]" />
						</div>
					)}
					{selectedFile?.status === 'error' && (
						<div className="bg-slate-800/50 absolute flex flex-col w-full h-full items-center justify-center gap-2">
							<div className="text-destructive font-medium">{t('templateImageField.errorUploadingPhoto')}</div>
							<Button size="sm" variant="secondary" onClick={() => handleUpload(selectedFile.cachedFile)}>
								{t('templateImageField.retry')}
							</Button>
						</div>
					)}
					{(value || selectedFile?.status === 'success') && (
						<div className="bg-slate-800/20 hidden absolute group-hover:flex w-full h-full items-center justify-center">
							<label htmlFor={inputId} className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), 'bg-primary items-center cursor-pointer')}>
								{t('templateImageField.changeImage')}
							</label>
						</div>
					)}
				</div>
			) : (
				<label
					htmlFor={inputId}
					className={cn(
						'group flex-1 rounded-[0.65rem] h-[9rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-border bg-muted hover:border-primary/80 hover:border-2 cursor-pointer',
						isDragging && '!border-primary/80 border-2 !bg-primary/20',
					)}
				>
					<CiCirclePlus size={35} className="text-muted-foreground group-hover:text-primary" />
					<p className="text-muted-foreground text-[0.8rem] font-semibold mt-1">{t('templateImageField.uploadAnImage')}</p>
					<p className="text-[0.75rem] text-muted-foreground">{t('templateImageField.maxFileSize')}</p>
				</label>
			)}
			<FileUploadInput id={inputId} onFilesSelected={handleFileChange} />
		</div>
	)
}
