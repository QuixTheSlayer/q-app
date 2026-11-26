import { BlurEffectController, OpacityEffectController, PresetEffectController, ScaleEffectController, SkewEffectController, TextColorEffectController, TranslateEffectController } from "./animation/AnimationEffectControllers"
import { BackgroundColorController, BoxShadowController,  MoveController,  PrototypeEffectController,  RadiusController,  RotateController,  SizeController, ZoomController   } from "./Controllers"

interface TriggerEffectControllerPropsType {
    type: string,
    triggerIndex: number
    animationIndex: number
    effectItemIndex: number
}



export default function TriggerEffectController(props: TriggerEffectControllerPropsType) {
    const { type, triggerIndex, animationIndex, effectItemIndex } = props

    const EffectObj: Record<string, JSX.Element> = {
        "backgroundColor": <BackgroundColorController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "boxShadow": <BoxShadowController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "size": <SizeController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "radius": <RadiusController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "rotate": <RotateController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "move": <MoveController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "zoom":<ZoomController isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "opacity": <OpacityEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "scale": <ScaleEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "translate": <TranslateEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "skew": <SkewEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "blur": <BlurEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "textColor": <TextColorEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "preset": <PresetEffectController triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "scrollTo": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "show": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "hide": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "toggle": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "slideIn": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
        "fadeIn": <PrototypeEffectController type={type} isEffect={true} triggerIndex={triggerIndex} animationIndex={animationIndex} effectItemIndex={effectItemIndex} />,
    }

    return (
        EffectObj[type]
    )
}
