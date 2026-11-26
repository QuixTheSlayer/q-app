import { rgbaToHexa } from '@uiw/color-convert';
import React, { useRef, useState } from 'react'
import { Button, Dialog, DialogTrigger, OverlayArrow, Popover, ProgressBar } from 'react-aria-components';
import { Select, SelectOption } from './Select';
import { SketchPicker } from 'react-color';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import useUploadToS3 from '@/hooks/useUploadToS3';
import useFileDrop from '@/hooks/useFileDrop';
import { cn } from '@/libs/cn';
import { buttonVariants } from '@/components/ui/primitives/button';
import { getIdFromUrl } from '@/utils/getIdFromUrl';
import PlainTextInput from './inputs/PlainTextInput';
import { CiCirclePlus } from 'react-icons/ci';
import { PanelRowContainer, SectionContainer } from '../PropertyPanelUI/ui';
import { useEditor } from '@/context/EditorContext';
import { background_position, background_repeat, background_size } from '@/consts/propertyField.consts';
import { isValidUrl } from '@/utils/isValidUrl';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store';
import { reset } from '@/store/imageEditor/image.editor.slice';
import { fetchImg } from '@/utils/convertToCanvas';
import { useModal } from '@/context/ModalContext';
import { useImageEditorKonva } from '@/context/ImageEditorKonvaContext';


const id = getIdFromUrl()
export interface Props {
    value?: string
    onChange?: (value: string) => void
    onChangeCompete?: (value: string) => void
    isNotHasImage?:boolean 
}

function BackgroundPicker({
    value, onChange, onChangeCompete,isNotHasImage
}: Props) {
    const canvas = useEditor()
    const node = canvas?.focusedNode
    const [isOpen, setIsOpen] = useState(false)
    // DOM node of the outer Popover, once mounted — passed to nested <Select>s
    // as their dropdown's portal container so a click on an option lands
    // inside this Popover's own DOM subtree instead of being portaled to
    // document.body, where it would otherwise look like an outside click.
    const [popoverEl, setPopoverEl] = useState<HTMLElement | null>(null)
    const [localValue, setLocalValue] = useState(value)
    const [localImg, setLocalImg] = useState('')
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [tab, setTab] = useState<"color" | "image" | "gradient">("color");
    const [gradientType, setGradientType] = useState<"linear" | "radial" | "conic">("linear");
    const [gradientAngle, setGradientAngle] = useState(90);
    const [gradientStops, setGradientStops] = useState<Array<{ color: string; position: number }>>([
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 }
    ]);

    const { isEdit, imageUrl, imageFile } = useSelector((state: RootState) => state.imageEditor)

    const { updateModalProp,setModalType } = useModal()

    const { setImage } = useImageEditorKonva()

    const dispatch = useAppDispatch()

    const onChangeCompleteHandler = (value: string) => {
        if (typeof onChangeCompete === 'function') {
            onChangeCompete(value)
        } else {
            setLocalValue(value)
        }
    }

    const indicatorRef = useRef(null)

    const generateGradientCSS = () => {
        const stopsString = gradientStops
            .sort((a, b) => a.position - b.position)
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ');

        if (gradientType === 'linear') {
            return `linear-gradient(${gradientAngle}deg, ${stopsString})`;
        } else if (gradientType === 'radial') {
            return `radial-gradient(circle, ${stopsString})`;
        } else if (gradientType === 'conic') {
            return `conic-gradient(from ${gradientAngle}deg, ${stopsString})`;
        }
        return stopsString;
    };

    const onChangeHandler = (v: string) => {
        setIsOpen(true)
        setLocalValue(v)

        if (typeof onChange === 'function') {
            onChange(v)
        } else {
            canvas.updateNodeStyle({
                backgroundImage: 'unset',
                backgroundColor: v
            });
        }
        if (indicatorRef.current) {
            const indicator = indicatorRef.current as HTMLButtonElement
            indicator.style.backgroundColor = v
        }
    }

    const onGradientUpdate = () => {
        const gradientValue = generateGradientCSS();
        // Directly update the style without going through onChange callback
        // to avoid panel handlers from misinterpreting the gradient value
        if (canvas && node) {
            canvas.updateNodeStyle({
                backgroundImage: gradientValue,
                backgroundColor: 'transparent'
            });
        }
        setIsOpen(false);
    };
    /** 
      * File Handindling
      */
    const { handleUpload, selectedFile } = useUploadToS3({
        subFolder: `${id}`
    })

    function loadFile(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.src = URL.createObjectURL(file);
        });
    }
    function loadSignedUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.src = url
            image.onload = () => resolve(image);

        });
    }

    function loadUrl(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const image = new Image();



            image.src = url.split("(")[1].split(")")[0]


            const key = new URL(image.src).pathname.slice(1).split('/').slice(1).join('/')

            const realUrl = `/landing-page-builder/genereate_signed_url?key=${(key)}`
            fetchImg(realUrl).then(async (data) => {


                const response = await fetch(data);
                const file = await response.blob();
                image.src = URL.createObjectURL(file)
                image.crossOrigin = 'anonymous';


            })

            image.onload = () => resolve(image);


        });
    }

    function extractFileFromUrl(url: string): Promise<File> {
        return new Promise((resolve) => {

            const realUrl = url.split("(")[1].split(")")[0].replace(/^["']|["']$/g, "")
            const key = new URL(realUrl).pathname.slice(1).split('/').slice(1).join('/')

            const signUrl = `/landing-page-builder/genereate_signed_url?key=${(key)}`

            fetchImg(signUrl).then(async (data) => {


                const response = await fetch(data);
                const file = await response.blob();

                return file


            })
        })
    }

    const handleFileChange = async (files: FileList) => {
        if (files.length > 1) {
            // toast.error('Multiple files detected. PLease select only one file.')
            return;
        }

        const file = files[0]


        const { access_url, signedUrl } = await handleUpload(file)


        const url = access_url


        canvas.updateNodeStyle({
            backgroundImage: `url("${url}")`
        })
        setLocalImg(`${url}`)

        const image = await loadSignedUrl(signedUrl);
        setImg(image);
        dispatch(reset())

    }


    const { dragHandlers, isDragging } = useFileDrop(handleFileChange)


    // console.log(node?.style.backgroundImage)


    const bgUrl =value?.split('url(')[0].split(')')[0]

    const isGradient = (val?: string) => {
        return val?.includes('gradient(') || val?.includes('-gradient');
    };

        // console.log("Bg Image",value)


    if (node)
        return (
            <DialogTrigger>

                <span className='w-[100%] h-9 rounded-md border-border text-foreground  border focus-within:outline-ring focus-within:outline focus-within:outline-1 flex items-center px-[0.4rem] gap-2'>
                    {
                        isValidUrl(value ?? "") ?
                            <Button style={{
                                backgroundImage: `url("${value}")`,
                                backgroundSize: "cover"
                            }} className=' cursor-pointer h-5 w-5 rounded-[1.5px] ' onPress={() => setIsOpen(prev => !prev)} ref={indicatorRef} >

                            </Button>
                            : isGradient(value) ?
                            <Button style={{
                                background: value
                            }} className=' cursor-pointer h-5 w-5 rounded-[1.5px] ' onPress={() => setIsOpen(prev => !prev)} ref={indicatorRef} >

                            </Button>
                            :
                            <div className=' flex w-full gap-2 h-full justify-start items-center' >
                                <Button ref={indicatorRef} className='w-5 h-5 rounded border border-border ' style={{
                                    backgroundColor: value ?? localValue
                                }}
                                    onPress={() => setIsOpen(prev => !prev)}
                                ></Button>
                                <PlainTextInput className='flex justify-start items-center' value={value ?? localValue}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (onChange) {
                                            onChange(value)
                                        } else {
                                            setLocalValue(value)
                                        }
                                    }}
                                />
                            </div>

                    }

                </span>
                <Popover
                    ref={setPopoverEl}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                >
                    <OverlayArrow>
                        <svg width={12} height={12} viewBox="0 0 12 12">
                            <path d="M0 0 L6 6 L12 0" />
                        </svg>
                    </OverlayArrow>
                    <Dialog>

                        <Tabs
                            defaultValue="color"
                            value={tab}
                            onValueChange={(v) =>
                                setTab(v)
                            }
                        >
                            <div className="border-b-[0.16em] bg-popover border-border">
                                <TabsList>
                                    <TabsTrigger key={"color"} value={"color"}>
                                        Color
                                    </TabsTrigger>
                                    <TabsTrigger key={"gradient"} value={"gradient"}>
                                        Gradient
                                    </TabsTrigger>
                                  { !isNotHasImage && <TabsTrigger key={"image"} value={"image"}>
                                        Image
                                    </TabsTrigger>}
                                </TabsList>
                            </div>
                            <TabsContent key={"color"} value={"color"}>
                                <SketchPicker

                                    color={localValue}
                                    disableAlpha={false}
                                    onChangeComplete={(colors) => {
                                        const hexColor = rgbaToHexa({ r: colors.rgb.r, g: colors.rgb.g, b: colors.rgb.b, a: colors.rgb.a });
                                        onChangeHandler(hexColor);
                                       
                                        // setIsOpen(false);
                                    }}


                                />
                            </TabsContent>

                            <TabsContent key={"gradient"} value={"gradient"}>
                                <div className='w-[280px] p-4 flex flex-col gap-4 bg-popover rounded-md'>
                                    {/* Gradient Preview */}
                                    <div
                                        className='w-full h-[80px] rounded-md border border-border'
                                        style={{ background: generateGradientCSS() }}
                                    />

                                    {/* Gradient Type Selector */}
                                    <div className='flex flex-col gap-2' onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                        <label className='text-sm font-medium'>Type</label>
                                        <div >
                                            <Select
                                                size='sm'
                                                placement='bottom end'
                                                portalContainer={popoverEl}
                                                selectedKey={gradientType}
                                                onSelectionChange={(v) => setGradientType(v as any)}
                                                items={[
                                                    { value: 'linear', label: 'Linear' },
                                                    { value: 'radial', label: 'Radial' },
                                                    { value: 'conic', label: 'Conic' }
                                                ]}
                                            >
                                                {(item: any) => <SelectOption id={item.value}>{item.label}</SelectOption>}
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Angle Control */}
                                    <div className='flex flex-col gap-2' onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                        <label className='text-sm font-medium'>Angle: {gradientAngle}°</label>
                                        <input
                                            type='range'
                                            min='0'
                                            max='360'
                                            value={gradientAngle}
                                            onChange={(e) => setGradientAngle(Number(e.target.value))}
                                            className='w-full'
                                            onMouseDown={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    {/* Color Stops Editor */}
                                    <div className='flex flex-col gap-2' onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                        <label className='text-sm font-medium'>Color Stops</label>
                                        {gradientStops.map((stop, idx) => (
                                            <div key={idx} className='flex gap-2 items-center' onMouseDown={(e) => e.stopPropagation()}>
                                                <input
                                                    type='color'
                                                    value={stop.color}
                                                    onChange={(e) => {
                                                        const newStops = [...gradientStops];
                                                        newStops[idx].color = e.target.value;
                                                        setGradientStops(newStops);
                                                    }}
                                                    className='w-10 h-8 rounded cursor-pointer'
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                />
                                                <input
                                                    type='number'
                                                    min='0'
                                                    max='100'
                                                    value={stop.position}
                                                    onChange={(e) => {
                                                        const newStops = [...gradientStops];
                                                        newStops[idx].position = Number(e.target.value);
                                                        setGradientStops(newStops);
                                                    }}
                                                    className='w-16 px-2 py-1 border border-border rounded text-sm'
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                />
                                                <span className='text-xs text-muted-foreground'>%</span>
                                                {gradientStops.length > 2 && (
                                                    <Button
                                                        size='sm'
                                                        variant='ghost'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newStops = gradientStops.filter((_, i) => i !== idx);
                                                            setGradientStops(newStops);
                                                        }}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                        ✕
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const midPosition = 50;
                                                setGradientStops([
                                                    ...gradientStops,
                                                    { color: '#00ff00', position: midPosition }
                                                ]);
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            + Add Stop
                                        </Button>
                                    </div>

                                    {/* Apply Button */}
                                    <Button
                                        variant='primary'
                                        size='sm'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGradientUpdate();
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className='w-full'
                                    >
                                        Apply Gradient
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent key={"image"} value={"image"}>
                                <div className=' w-[250px] relative p-2 flex flex-col justify-center items-center rounded-md shadow-md bg-popover ' >
                                    {/* {isEdit && img && <ImageEditorView isBg={true} image={img} />} */}

                                    {!isEdit && <div {...dragHandlers}>
                                        {isValidUrl(value||'' ) ?
                                            <div className={cn("group relative flex-1 rounded-[0.65rem] min-w-[200px] w-[200px] overflow-clip h-[300px] flex flex-col gap-1.5 items-center justify-center border  border-border bg-muted hover:border-primary/80  cursor-pointer ", isDragging ? 'border-dashed !border-primary/80 border-2 !bg-primary/10' : '')}>
                                                {isValidUrl(value||'' )&& <img className=' w-full h-full object-cover ' src={value} alt="" />}


                                                {selectedFile?.status === 'loading' &&
                                                    (
                                                        <div className='bg-background/60 absolute flex flex-col w-full h-full items-center justify-center gap-2'>
                                                            <div className='text-foreground'>Uploading...</div>
                                                            <ProgressBar value={Math.round(selectedFile.progress)} className="w-[7.5rem] h-[0.25rem]" />
                                                        </div>
                                                    )}
                                                {selectedFile?.status === 'error' &&
                                                    (
                                                        <div className='bg-background/60 absolute flex flex-col w-full h-full items-center justify-center gap-2'>
                                                            <div className='text-destructive font-medium'>Error uploading photo!</div>
                                                            <Button size={"sm"} variant="secondary"
                                                                onClick={() => handleUpload(selectedFile.cachedFile)}
                                                            >Retry</Button>
                                                            <label htmlFor='image-uploader' className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), ' bg-primary items-center cursor-pointer')}>Change Image</label>

                                                        </div>
                                                    )}

                                                {(selectedFile?.status === "success" || node?.style.backgroundImage || localImg) && (<div className='bg-background/50 backdrop-blur-sm hidden absolute gap-2 bottom-0 px-2 py-2  rounded-t-md group-hover:flex w-full h-full items-center justify-center'>
                                                    <div onClick={async () => {

                                                      canvas.updateNodeStyle({
                                                        backgroundImage:'unset'
                                                      })

                                                    }} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), ' bg-background/40 border-destructive text-destructive  items-center cursor-pointer')}>
                                                        Remove
                                                    </div>

                                                    <label onClick={() => {
                                                        updateModalProp({
                                                            isOpen: true,
                                                            title: 'Background Image Editor',
                                                            hint: "Recommanded: 800 x 600"
                                                        })
                                                        setModalType("bg-image")

                                                    }} className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), ' bg-primary items-center cursor-pointer')}>Change Image</label>
                                                </div>
                                                )}
                                            </div>
                                            :
                                            <>
                                                <label
                                                    onClick={() => {
                                                        updateModalProp({
                                                            isOpen: true,
                                                            title: 'Background Image Editor',
                                                            hint: "Recommanded: 800 x 600"
                                                        })
                                                    }}

                                                    // htmlFor='image-uploader'
                                                    className={cn("group flex-1 rounded-[0.65rem] h-[6rem]  w-[9rem] flex flex-col gap-1.5 items-center justify-center border border-dashed border-border bg-muted hover:border-primary/80 hover:border-2 cursor-pointer", isDragging ? ' !border-primary/80 border-2 !bg-primary/10' : '')}>
                                                    <CiCirclePlus size={35} className='text-muted-foreground group-hover:text-primary' />
                                                    <p className="text-foreground text-[0.8rem] font-semibold mt-1">Upload An Image</p>
                                                    <p className="text-[0.75rem] text-muted-foreground ">15 MB Max</p>
                                                </label>
                                            </>}
                                        {/* <input id='image-uploader' type="file" className="hidden" onChange={e => e.target.files && handleFileChange(e.target.files)} /> */}

                                    </div>}

                                    <div className=' my-4 w-full h-auto gap-4 justify-start items-center flex flex-col ' >


                                        <SectionContainer  >
                                            <PanelRowContainer className=' justify-between w-[80%] ' layoutType='row' label='Type' >
                                                <Select
                                                    id='backgroundSize'
                                                    aria-label='backgroundSize'
                                                    size='sm'
                                                    placement='bottom end'
                                                    portalContainer={popoverEl}
                                                    placeholder=''
                                                    className='col-span-2'
                                                    items={background_size}
                                                    selectedKey={node?.style.backgroundSize || 'auto'}
                                                    onSelectionChange={v => {
                                                        canvas?.updateNodeStyle({
                                                            backgroundSize: v
                                                        })
                                                    }}
                                                >
                                                    {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                                                </Select>
                                            </PanelRowContainer>

                                            <PanelRowContainer className=' justify-between w-[80%] ' layoutType='row' label='Repeat' >
                                                <Select
                                                    id='backgroundRepeat'
                                                    aria-label='backgroundRepeat'
                                                    size='sm'
                                                    placement='bottom end'
                                                    portalContainer={popoverEl}
                                                    placeholder=''
                                                    className='col-span-2'
                                                    items={background_repeat}
                                                    selectedKey={node?.style.backgroundRepeat || 'repeat'}
                                                    onSelectionChange={(v) => {
                                                        canvas?.updateNodeStyle({
                                                            backgroundRepeat: v as React.CSSProperties['backgroundRepeat']
                                                        })
                                                    }}
                                                >
                                                    {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                                                </Select>
                                            </PanelRowContainer>


                                            <PanelRowContainer className=' justify-between w-[80%] ' layoutType='row' label='Position' >
                                                <Select
                                                    id='backgroundPosition'
                                                    aria-label='backgroundPosition'
                                                    size='sm'
                                                    placement='bottom end'
                                                    portalContainer={popoverEl}
                                                    placeholder=''
                                                    className='col-span-2'
                                                    items={background_position}
                                                    selectedKey={node?.style.backgroundPosition || 'center'}
                                                    onSelectionChange={(v) => {
                                                        canvas?.updateNodeStyle({
                                                            backgroundPosition: v as React.CSSProperties['backgroundPosition']
                                                        })
                                                    }}
                                                >
                                                    {(item) => (<SelectOption id={item.value}>{item.label}</SelectOption>)}
                                                </Select>
                                            </PanelRowContainer>


                                        </SectionContainer>

                                        {/* <div onClick={async () => {

                                            extractFileFromUrl(node.style.backgroundImage || '').then(async (file) => {
                                                const response = await handleUpload(file)

                                                canvas.updateNode((node) => {
                                                    let tempNode = node;

                                                    return {
                                                        ...tempNode,
                                                        children: response.access_url,
                                                        src: response.access_url
                                                    } as ContentNode

                                                })

                                                onChangeHandler(`url(${response?.access_url})`)
                                            })




                                        }} className={cn(buttonVariants({ size: 'sm', variant: 'primary' }), ' bg-primary items-center cursor-pointer')}>Save Image</div> */}

                                    </div>

                                </div>

                            </TabsContent>
                        </Tabs>




                    </Dialog>
                </Popover>
            </DialogTrigger>
        )
}

export default BackgroundPicker