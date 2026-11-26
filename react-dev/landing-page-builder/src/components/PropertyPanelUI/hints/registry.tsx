import {
  PaddingDemo,
  PaddingLeftDemo,
  PaddingRightDemo,
  PaddingTopDemo,
  PaddingBottomDemo,
  MarginDemo,
  MarginLeftDemo,
  MarginRightDemo,
  MarginTopDemo,
  MarginBottomDemo,
  BorderRadiusTopLeftDemo,
  BorderRadiusTopRightDemo,
  BorderRadiusBottomLeftDemo,
  BorderRadiusBottomRightDemo,
  BorderRadiusDemo,
  FontSizeDemo,
  FontWeightDemo,
  LineHeightDemo,
  LineClampDemo,
  TextAlignDemo,
  TextStyleDemo,
  ScriptDemo,
  StrokeWidthDemo,
  AlignXDemo,
  AlignYDemo,
  BackgroundColorDemo,
  TextColorDemo,
  BorderColorDemo,
  OpacityDemo,
  AnimationTimingDemo,
  IconSearchDemo,
  AnimationEasingDemo,
  AnimationPresetDemo,
  SkewDemo,
  BlurDemo,
  RotateDemo,
  FlipDemo,
  GapDemo,
  WidthDemo,
  HeightDemo,
  MinWidthDemo,
  MaxWidthDemo,
  MinHeightDemo,
  MaxHeightDemo,
  ZIndexDemo,
  ColumnsDemo,
  RowsDemo,
  ObjectFitDemo,
  ShadowDemo,
  DirectionDemo,
  LayoutTypeDemo,
  GridAutoFlowDemo,
  ScaleZoomDemo,
  ColorPairDemo,
  CollapseDemo,
  PositionOffsetDemo,
  PositionOffsetXDemo,
  PositionOffsetYDemo,
  PositionLeftDemo,
  PositionRightDemo,
  PositionTopDemo,
  PositionBottomDemo,
  AnimationDemo,
  ScrollToDemo,
  PrototypeActionDemo,
  ShadowConfigDemo,
  ShadowOffsetDemo,
  ShadowBlurDemo,
  ShadowSpreadDemo,
  ShadowColorDemo,
  StyleGroupDemo,
  TypographyGroupDemo,
  GridCellSpanDemo,
  GridColumnStartDemo,
  GridColumnSpanDemo,
  GridRowStartDemo,
  GridRowSpanDemo,
  ShowCtaDemo,
  BrandDisplayModeDemo,
} from './demos'

export interface PropertyHintDef {
  Demo: React.ComponentType
}

export const PROPERTY_HINTS = {
  padding: {
    Demo: PaddingDemo,
  },
  margin: {
    Demo: MarginDemo,
  },
  paddingLeft: {
    Demo: PaddingLeftDemo,
  },
  paddingRight: {
    Demo: PaddingRightDemo,
  },
  paddingTop: {
    Demo: PaddingTopDemo,
  },
  paddingBottom: {
    Demo: PaddingBottomDemo,
  },
  marginLeft: {
    Demo: MarginLeftDemo,
  },
  marginRight: {
    Demo: MarginRightDemo,
  },
  marginTop: {
    Demo: MarginTopDemo,
  },
  marginBottom: {
    Demo: MarginBottomDemo,
  },
  borderRadius: {
    Demo: BorderRadiusDemo,
  },
  borderRadiusTopLeft: {
    Demo: BorderRadiusTopLeftDemo,
  },
  borderRadiusTopRight: {
    Demo: BorderRadiusTopRightDemo,
  },
  borderRadiusBottomLeft: {
    Demo: BorderRadiusBottomLeftDemo,
  },
  borderRadiusBottomRight: {
    Demo: BorderRadiusBottomRightDemo,
  },
  fontSize: {
    Demo: FontSizeDemo,
  },
  fontWeight: {
    Demo: FontWeightDemo,
  },
  lineHeight: {
    Demo: LineHeightDemo,
  },
  lineClamp: {
    Demo: LineClampDemo,
  },
  textAlign: {
    Demo: TextAlignDemo,
  },
  textStyle: {
    Demo: TextStyleDemo,
  },
  script: {
    Demo: ScriptDemo,
  },
  strokeWidth: {
    Demo: StrokeWidthDemo,
  },
  alignX: {
    Demo: AlignXDemo,
  },
  alignY: {
    Demo: AlignYDemo,
  },
  backgroundColor: {
    Demo: BackgroundColorDemo,
  },
  textColor: {
    Demo: TextColorDemo,
  },
  borderColor: {
    Demo: BorderColorDemo,
  },
  opacity: {
    Demo: OpacityDemo,
  },
  rotate: {
    Demo: RotateDemo,
  },
  animationTiming: {
    Demo: AnimationTimingDemo,
  },
  animationEasing: {
    Demo: AnimationEasingDemo,
  },
  animationPreset: {
    Demo: AnimationPresetDemo,
  },
  skew: {
    Demo: SkewDemo,
  },
  iconSearch: {
    Demo: IconSearchDemo,
  },
  blur: {
    Demo: BlurDemo,
  },
  flip: {
    Demo: FlipDemo,
  },
  gap: {
    Demo: GapDemo,
  },
  width: {
    Demo: WidthDemo,
  },
  height: {
    Demo: HeightDemo,
  },
  minWidth: {
    Demo: MinWidthDemo,
  },
  maxWidth: {
    Demo: MaxWidthDemo,
  },
  minHeight: {
    Demo: MinHeightDemo,
  },
  maxHeight: {
    Demo: MaxHeightDemo,
  },
  columns: {
    Demo: ColumnsDemo,
  },
  rows: {
    Demo: RowsDemo,
  },
  gridCellSpan: {
    Demo: GridCellSpanDemo,
  },
  gridColumnStart: {
    Demo: GridColumnStartDemo,
  },
  gridColumnSpan: {
    Demo: GridColumnSpanDemo,
  },
  gridRowStart: {
    Demo: GridRowStartDemo,
  },
  gridRowSpan: {
    Demo: GridRowSpanDemo,
  },
  objectFit: {
    Demo: ObjectFitDemo,
  },
  shadow: {
    Demo: ShadowDemo,
  },
  direction: {
    Demo: DirectionDemo,
  },
  layoutType: {
    Demo: LayoutTypeDemo,
  },
  gridAutoFlow: {
    Demo: GridAutoFlowDemo,
  },
  scaleZoom: {
    Demo: ScaleZoomDemo,
  },
  colorPair: {
    Demo: ColorPairDemo,
  },
  collapse: {
    Demo: CollapseDemo,
  },
  positionOffset: {
    Demo: PositionOffsetDemo,
  },
  positionOffsetX: {
    Demo: PositionOffsetXDemo,
  },
  positionOffsetY: {
    Demo: PositionOffsetYDemo,
  },
  positionLeft: {
    Demo: PositionLeftDemo,
  },
  positionRight: {
    Demo: PositionRightDemo,
  },
  positionTop: {
    Demo: PositionTopDemo,
  },
  positionBottom: {
    Demo: PositionBottomDemo,
  },
  zIndex: {
    Demo: ZIndexDemo,
  },
  animation: {
    Demo: AnimationDemo,
  },
  scrollTo: {
    Demo: ScrollToDemo,
  },
  prototypeAction: {
    Demo: PrototypeActionDemo,
  },
  shadowConfig: {
    Demo: ShadowConfigDemo,
  },
  shadowOffset: {
    Demo: ShadowOffsetDemo,
  },
  shadowBlur: {
    Demo: ShadowBlurDemo,
  },
  shadowSpread: {
    Demo: ShadowSpreadDemo,
  },
  shadowColor: {
    Demo: ShadowColorDemo,
  },
  styleGroup: {
    Demo: StyleGroupDemo,
  },
  typographyGroup: {
    Demo: TypographyGroupDemo,
  },
  showCta: {
    Demo: ShowCtaDemo,
  },
  brandDisplayMode: {
    Demo: BrandDisplayModeDemo,
  },
} satisfies Record<string, PropertyHintDef>

export type PropertyHintKey = keyof typeof PROPERTY_HINTS
