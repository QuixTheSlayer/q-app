import { CSSProperties } from 'react'
import { useLoopToggle, useLoopStep } from './useLoopToggle'

const stageStyle: CSSProperties = {
  width: 140,
  height: 90,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgb(var(--muted))',
  borderRadius: 6,
  overflow: 'hidden',
}

const boxBase: CSSProperties = {
  transition: 'all 0.6s ease',
  background: 'rgb(var(--primary))',
}

function Stage({ children, style }: { children?: React.ReactNode; style?: CSSProperties }) {
  return <div style={{ ...stageStyle, ...style }}>{children}</div>
}

export function PaddingDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ ...boxBase, padding: on ? 18 : 2, background: 'rgb(var(--primary) / 0.2)' }}>
        <div style={{ width: 40, height: 24, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

function PaddingSideDemo({ side }: { side: 'left' | 'right' | 'top' | 'bottom' }) {
  const on = useLoopToggle()
  const isHorizontal = side === 'left' || side === 'right'
  return (
    <Stage>
      <div
        style={{
          ...boxBase,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgb(var(--primary) / 0.2)',
          width: isHorizontal ? 90 : 60,
          height: isHorizontal ? 60 : 70,
          paddingLeft: side === 'left' ? (on ? 26 : 4) : 4,
          paddingRight: side === 'right' ? (on ? 26 : 4) : 4,
          paddingTop: side === 'top' ? (on ? 22 : 4) : 4,
          paddingBottom: side === 'bottom' ? (on ? 22 : 4) : 4,
        }}
      >
        <div style={{ width: '100%', height: '100%', background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function PaddingLeftDemo() {
  return <PaddingSideDemo side="left" />
}

export function PaddingRightDemo() {
  return <PaddingSideDemo side="right" />
}

export function PaddingTopDemo() {
  return <PaddingSideDemo side="top" />
}

export function PaddingBottomDemo() {
  return <PaddingSideDemo side="bottom" />
}

export function MarginDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: on ? 20 : 4,
            left: on ? 20 : 4,
            width: 50,
            height: 40,
            borderRadius: 4,
          }}
        />
      </div>
    </Stage>
  )
}

function MarginSideDemo({ side }: { side: 'left' | 'right' | 'top' | 'bottom' }) {
  const on = useLoopToggle()
  const base = { top: 30, left: 45 }
  const offset = { ...base }
  if (on) {
    if (side === 'left') offset.left = base.left - 22
    if (side === 'right') offset.left = base.left + 22
    if (side === 'top') offset.top = base.top - 18
    if (side === 'bottom') offset.top = base.top + 18
  }
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: offset.top,
            left: offset.left,
            width: 40,
            height: 30,
            borderRadius: 4,
          }}
        />
      </div>
    </Stage>
  )
}

export function MarginLeftDemo() {
  return <MarginSideDemo side="right" />
}

export function MarginRightDemo() {
  return <MarginSideDemo side="left" />
}

export function MarginTopDemo() {
  return <MarginSideDemo side="bottom" />
}

export function MarginBottomDemo() {
  return <MarginSideDemo side="top" />
}

export function BorderRadiusDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ ...boxBase, width: 56, height: 56, borderRadius: on ? 24 : 0 }} />
    </Stage>
  )
}

function BorderRadiusCornerDemo({ corner }: { corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' }) {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          ...boxBase,
          width: 56,
          height: 56,
          background: 'rgb(var(--primary) / 0.2)',
          border: '2px solid rgb(var(--primary))',
          borderTopLeftRadius: corner === 'topLeft' ? (on ? 24 : 0) : 0,
          borderTopRightRadius: corner === 'topRight' ? (on ? 24 : 0) : 0,
          borderBottomLeftRadius: corner === 'bottomLeft' ? (on ? 24 : 0) : 0,
          borderBottomRightRadius: corner === 'bottomRight' ? (on ? 24 : 0) : 0,
        }}
      />
    </Stage>
  )
}

export function BorderRadiusTopLeftDemo() {
  return <BorderRadiusCornerDemo corner="topLeft" />
}

export function BorderRadiusTopRightDemo() {
  return <BorderRadiusCornerDemo corner="topRight" />
}

export function BorderRadiusBottomLeftDemo() {
  return <BorderRadiusCornerDemo corner="bottomLeft" />
}

export function BorderRadiusBottomRightDemo() {
  return <BorderRadiusCornerDemo corner="bottomRight" />
}

export function FontSizeDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span style={{ transition: 'all 0.6s ease', fontSize: on ? 28 : 13, fontWeight: 600, color: 'rgb(var(--primary))' }}>Aa</span>
    </Stage>
  )
}

export function FontWeightDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span style={{ transition: 'all 0.6s ease', fontSize: 24, fontWeight: on ? 800 : 300, color: 'rgb(var(--primary))' }}>Aa</span>
    </Stage>
  )
}

export function LineHeightDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ transition: 'all 0.6s ease', lineHeight: on ? 2.2 : 1, fontSize: 12, textAlign: 'left', color: 'rgb(var(--foreground))' }}>
        Line one<br />Line two
      </div>
    </Stage>
  )
}

export function LineClampDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 100,
          fontSize: 11,
          lineHeight: 1.3,
          textAlign: 'left',
          color: 'rgb(var(--foreground))',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: on ? 2 : 4,
          transition: 'all 0.6s ease',
        } as CSSProperties}
      >
        Line one Line two Line three Line four
      </div>
    </Stage>
  )
}

export function TextAlignDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '80%', textAlign: on ? 'right' : 'left', transition: 'all 0.6s ease' }}>
        <div style={{ height: 6, width: '90%', background: 'rgb(var(--primary))', borderRadius: 2, marginBottom: 4, marginLeft: on ? 'auto' : 0 }} />
        <div style={{ height: 6, width: '60%', background: 'rgb(var(--primary))', borderRadius: 2, marginLeft: on ? 'auto' : 0 }} />
      </div>
    </Stage>
  )
}

export function TextStyleDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span
        style={{
          fontSize: 20,
          fontWeight: on ? 700 : 400,
          fontStyle: on ? 'italic' : 'normal',
          textDecoration: on ? 'underline' : 'none',
          color: 'rgb(var(--primary))',
          transition: 'all 0.6s ease',
        }}
      >
        Aa
      </span>
    </Stage>
  )
}

export function ScriptDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span style={{ fontSize: 22, color: 'rgb(var(--foreground))' }}>
        X<span style={{ fontSize: 12, position: 'relative', top: on ? 6 : -8, transition: 'all 0.6s ease', color: 'rgb(var(--primary))' }}>2</span>
      </span>
    </Stage>
  )
}

export function StrokeWidthDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--primary))" strokeWidth={on ? 3 : 1} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.6s ease' }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    </Stage>
  )
}

export function AlignXDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all 0.6s ease', padding: '0 8px' }}>
        <div style={{ width: 28, height: 28, background: 'rgb(var(--primary))', borderRadius: 4 }} />
      </div>
    </Stage>
  )
}

export function AlignYDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: on ? 'flex-end' : 'flex-start', transition: 'all 0.6s ease', padding: '8px 0' }}>
        <div style={{ width: 28, height: 28, background: 'rgb(var(--primary))', borderRadius: 4 }} />
      </div>
    </Stage>
  )
}

export function BackgroundColorDemo() {
  const on = useLoopToggle()
  return <Stage style={{ transition: 'all 0.6s ease', background: on ? 'rgb(var(--primary) / 0.35)' : 'rgb(var(--muted))' }} />
}

export function TextColorDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span style={{ transition: 'color 0.6s ease', fontSize: 22, fontWeight: 700, color: on ? 'rgb(var(--primary))' : 'rgb(var(--foreground))' }}>Text</span>
    </Stage>
  )
}

export function BorderColorDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 56, height: 40, borderRadius: 6, border: `3px solid ${on ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function OpacityDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 56, height: 56, borderRadius: 8, background: 'rgb(var(--primary))', opacity: on ? 0.25 : 1, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function RotateDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 48, height: 48, background: 'rgb(var(--primary))', borderRadius: 6, transform: `rotate(${on ? 45 : 0}deg)`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function FlipDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgb(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, transform: `scaleX(${on ? -1 : 1})`, transition: 'all 0.6s ease' }}>
        R
      </div>
    </Stage>
  )
}

export function GapDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ display: 'flex', gap: on ? 14 : 2, transition: 'all 0.6s ease' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 20, height: 40, background: 'rgb(var(--primary))', borderRadius: 3 }} />
        ))}
      </div>
    </Stage>
  )
}

export function WidthDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ height: 28, width: on ? '80%' : '30%', background: 'rgb(var(--primary))', borderRadius: 4, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function HeightDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 28, height: on ? '75%' : '25%', background: 'rgb(var(--primary))', borderRadius: 4, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function MinWidthDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: 34, border: '1px dashed rgb(var(--border))', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        <div style={{ height: 20, width: on ? 26 : 60, minWidth: 26, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function MaxWidthDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: 34, border: '1px dashed rgb(var(--border))', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        <div style={{ height: 20, width: on ? 110 : 70, maxWidth: 90, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function MinHeightDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ height: '100%', width: 34, border: '1px dashed rgb(var(--border))', borderRadius: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: '4px 0' }}>
        <div style={{ width: 20, height: on ? 20 : 46, minHeight: 20, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function MaxHeightDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ height: '100%', width: 34, border: '1px dashed rgb(var(--border))', borderRadius: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: '4px 0' }}>
        <div style={{ width: 20, height: on ? 80 : 50, maxHeight: 65, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function GridAutoFlowDemo() {
  const on = useLoopToggle()
  const order = on ? [1, 3, 5, 2, 4, 6] : [1, 2, 3, 4, 5, 6]
  return (
    <Stage>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 4, width: 60, height: 70 }}>
        {order.map((n, i) => (
          <div key={i} style={{ background: 'rgb(var(--primary))', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, transition: 'all 0.6s ease' }}>
            {n}
          </div>
        ))}
      </div>
    </Stage>
  )
}

export function ColumnsDemo() {
  const on = useLoopToggle()
  const count = on ? 4 : 2
  return (
    <Stage>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 4, width: '80%', transition: 'all 0.6s ease' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ height: 40, background: 'rgb(var(--primary))', borderRadius: 3 }} />
        ))}
      </div>
    </Stage>
  )
}

export function RowsDemo() {
  const on = useLoopToggle()
  const count = on ? 4 : 2
  return (
    <Stage>
      <div style={{ display: 'grid', gridTemplateRows: `repeat(${count}, 1fr)`, gap: 4, height: '80%', transition: 'all 0.6s ease' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ width: 40, background: 'rgb(var(--primary))', borderRadius: 3 }} />
        ))}
      </div>
    </Stage>
  )
}

export function ObjectFitDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 64, height: 40, border: '2px dashed rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          style={{
            transition: 'all 0.6s ease',
            width: on ? '100%' : 90,
            height: on ? '100%' : 30,
            background: 'rgb(var(--primary) / 0.6)',
          }}
        />
      </div>
    </Stage>
  )
}

export function ShadowDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '0 10px 20px rgb(0 0 0 / 0.35)' : '0 1px 2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function DirectionDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ display: 'flex', flexDirection: on ? 'column' : 'row', gap: 6, transition: 'all 0.3s ease' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 16, height: 16, background: 'rgb(var(--primary))', borderRadius: 3 }} />
        ))}
      </div>
    </Stage>
  )
}

export function LayoutTypeDemo() {
  const step = useLoopStep(3)
  const boxes = [0, 1, 2, 3]
  const boxStyle: CSSProperties = { width: 16, height: 16, background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.4s ease' }
  return (
    <Stage>
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
          {boxes.slice(0, 3).map((i) => <div key={i} style={boxStyle} />)}
        </div>
      )}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {boxes.slice(0, 3).map((i) => <div key={i} style={boxStyle} />)}
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {boxes.map((i) => <div key={i} style={boxStyle} />)}
        </div>
      )}
    </Stage>
  )
}

export function ScaleZoomDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgb(var(--primary))', transform: `scale(${on ? 1.4 : 0.8})`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function ColorPairDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: on ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))', transition: 'all 0.6s ease' }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: on ? 'rgb(var(--muted-foreground))' : 'rgb(var(--primary))', transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function PositionOffsetDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 32,
            height: 32,
            borderRadius: 6,
            transform: on ? 'translate(10px, -10px)' : 'translate(-16px, -16px)',
          }}
        />
      </div>
    </Stage>
  )
}

function PositionOffsetAxisDemo({ axis }: { axis: 'x' | 'y' }) {
  const on = useLoopToggle()
  const translate = axis === 'x'
    ? `translateX(${on ? 20 : -20}px)`
    : `translateY(${on ? 16 : -16}px)`
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 32,
            height: 32,
            borderRadius: 6,
            marginTop: -16,
            marginLeft: -16,
            transform: translate,
          }}
        />
      </div>
    </Stage>
  )
}

export function PositionOffsetXDemo() {
  return <PositionOffsetAxisDemo axis="x" />
}

export function PositionOffsetYDemo() {
  return <PositionOffsetAxisDemo axis="y" />
}

function PositionSideDemo({ side }: { side: 'left' | 'right' | 'top' | 'bottom' }) {
  const on = useLoopToggle()
  const near = 6
  const far = 26
  const style: CSSProperties = {
    ...boxBase,
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 6,
  }
  if (side === 'left') { style.left = on ? far : near; style.top = '50%'; style.marginTop = -14 }
  if (side === 'right') { style.right = on ? far : near; style.top = '50%'; style.marginTop = -14 }
  if (side === 'top') { style.top = on ? far : near; style.left = '50%'; style.marginLeft = -14 }
  if (side === 'bottom') { style.bottom = on ? far : near; style.left = '50%'; style.marginLeft = -14 }
  return (
    <Stage>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div style={style} />
      </div>
    </Stage>
  )
}

export function PositionLeftDemo() {
  return <PositionSideDemo side="left" />
}

export function PositionRightDemo() {
  return <PositionSideDemo side="right" />
}

export function PositionTopDemo() {
  return <PositionSideDemo side="top" />
}

export function PositionBottomDemo() {
  return <PositionSideDemo side="bottom" />
}

export function AnimationDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'rgb(var(--primary))',
          transform: on ? 'translateY(-14px) scale(1.05)' : 'translateY(14px) scale(0.95)',
          opacity: on ? 1 : 0.5,
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </Stage>
  )
}

export function IconSearchDemo() {
  const on = useLoopToggle()
  return (
    <Stage style={{ flexDirection: 'column', gap: 8, padding: '0 14px' }}>
      <div style={{ width: 130, height: 20, borderRadius: 5, border: '1px solid rgb(var(--primary) / 0.5)', fontSize: 10, display: 'flex', alignItems: 'center', padding: '0 6px', color: 'rgb(var(--primary))' }}>
        {on ? 'home' : ''}
      </div>
      <div style={{ display: 'flex', gap: 6, opacity: on ? 1 : 0.2, transition: 'opacity 0.5s ease' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 24, height: 24, borderRadius: 5, background: 'rgb(var(--primary) / 0.25)', border: i === 1 ? '1px solid rgb(var(--primary))' : '1px solid transparent' }} />
        ))}
      </div>
    </Stage>
  )
}

export function AnimationTimingDemo() {
  const on = useLoopToggle()
  return (
    <Stage style={{ flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: '0 18px' }}>
      <div style={{ height: 14, width: 70, borderRadius: 4, background: 'rgb(var(--primary))', marginLeft: on ? 60 : 0, transition: 'margin 0.6s ease' }} />
      <div style={{ height: 14, width: on ? 110 : 40, borderRadius: 4, background: 'rgb(var(--primary) / 0.5)', transition: 'width 0.6s ease' }} />
    </Stage>
  )
}

export function AnimationEasingDemo() {
  const on = useLoopToggle()
  return (
    <Stage style={{ flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 120, display: 'flex' }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: 'rgb(var(--primary))', transform: `translateX(${on ? 104 : 0}px)`, transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </div>
      <div style={{ width: 120, display: 'flex' }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: 'rgb(var(--primary) / 0.5)', transform: `translateX(${on ? 104 : 0}px)`, transition: 'transform 0.8s linear' }} />
      </div>
    </Stage>
  )
}

export function AnimationPresetDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgb(var(--primary))', opacity: on ? 1 : 0, transform: `translateY(${on ? 0 : 24}px) scale(${on ? 1 : 0.8})`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function SkewDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgb(var(--primary))', transform: `skew(${on ? -18 : 0}deg, 0deg)`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function BlurDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgb(var(--primary))', filter: `blur(${on ? 5 : 0}px)`, transition: 'all 0.6s ease' }} />
    </Stage>
  )
}

export function ScrollToDemo() {
  const on = useLoopToggle()
  return (
    <Stage style={{ flexDirection: 'column', gap: 10, justifyContent: 'flex-start', padding: '10px 0' }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          background: 'rgb(var(--primary))',
          transform: on ? 'translateY(52px)' : 'translateY(0px)',
          transition: 'transform 0.6s ease',
        }}
      />
      <div
        style={{
          width: 60,
          height: 20,
          borderRadius: 4,
          border: '2px solid rgb(var(--primary))',
          background: on ? 'rgb(var(--primary) / 0.15)' : 'transparent',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function PrototypeActionDemo() {
  const on = useLoopToggle()
  return (
    <Stage style={{ gap: 14 }}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          background: on ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground) / 0.4)',
          transition: 'background 0.5s ease',
        }}
      />
      <div style={{ fontSize: 14, color: 'rgb(var(--muted-foreground))' }}>→</div>
      <div
        style={{
          width: 40,
          height: 26,
          borderRadius: 5,
          border: '2px solid rgb(var(--primary))',
          background: on ? 'rgb(var(--primary) / 0.18)' : 'transparent',
          opacity: on ? 1 : 0.3,
          transform: on ? 'scale(1)' : 'scale(0.8)',
          transition: 'all 0.5s ease',
        }}
      />
    </Stage>
  )
}

export function ShadowConfigDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '6px 10px 18px rgb(0 0 0 / 0.4)' : '0 2px 4px rgb(0 0 0 / 0.15)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function ShadowOffsetDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '10px 8px 6px rgb(0 0 0 / 0.35)' : '0 0 6px rgb(0 0 0 / 0.2)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function ShadowBlurDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '0 4px 20px rgb(0 0 0 / 0.4)' : '0 4px 2px rgb(0 0 0 / 0.4)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function ShadowSpreadDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '0 0 4px 10px rgb(0 0 0 / 0.25)' : '0 0 4px 0px rgb(0 0 0 / 0.25)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function ShadowColorDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'rgb(var(--card))',
          boxShadow: on ? '4px 6px 10px rgb(var(--primary) / 0.6)' : '4px 6px 10px rgb(0 0 0 / 0.3)',
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function StyleGroupDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div
        style={{
          width: 56,
          height: 40,
          borderRadius: on ? 12 : 2,
          background: on ? 'rgb(var(--primary) / 0.25)' : 'rgb(var(--muted))',
          border: `2px solid ${on ? 'rgb(var(--primary))' : 'rgb(var(--border))'}`,
          transition: 'all 0.6s ease',
        }}
      />
    </Stage>
  )
}

export function TypographyGroupDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <span
        style={{
          fontSize: on ? 22 : 15,
          fontWeight: on ? 700 : 400,
          fontStyle: on ? 'italic' : 'normal',
          color: 'rgb(var(--primary))',
          transition: 'all 0.6s ease',
        }}
      >
        Aa
      </span>
    </Stage>
  )
}

export function CollapseDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 70, border: '1px solid rgb(var(--border))', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: 18, background: 'rgb(var(--primary) / 0.3)' }} />
        <div style={{ height: on ? 0 : 28, transition: 'all 0.6s ease', background: 'rgb(var(--muted))', overflow: 'hidden' }} />
      </div>
    </Stage>
  )
}

export function ShowCtaDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ width: 90, height: 24, borderRadius: 4, border: '1px solid rgb(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', background: 'rgb(var(--muted))' }}>
        <div style={{ width: 20, height: 6, borderRadius: 2, background: 'rgb(var(--foreground) / 0.4)' }} />
        <div style={{ width: 26, height: 12, borderRadius: 999, background: 'rgb(var(--primary))', opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.6})`, transition: 'all 0.6s ease' }} />
      </div>
    </Stage>
  )
}

export function BrandDisplayModeDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      {on ? (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgb(var(--primary))', transition: 'all 0.6s ease' }} />
      ) : (
        <div style={{ fontWeight: 700, fontSize: 15, color: 'rgb(var(--foreground))' }}>Brand</div>
      )}
    </Stage>
  )
}

export function GridCellSpanDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, width: '80%', height: '80%' }}>
        <div
          style={{
            gridColumn: on ? 'span 2' : 'span 1',
            gridRow: on ? 'span 2' : 'span 1',
            background: 'rgb(var(--primary))',
            borderRadius: 3,
            transition: 'all 0.6s ease',
          }}
        />
        <div style={{ background: 'rgb(var(--primary) / 0.2)', borderRadius: 3 }} />
        <div style={{ background: 'rgb(var(--primary) / 0.2)', borderRadius: 3 }} />
      </div>
    </Stage>
  )
}

function GridCellGrid({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, width: '85%', height: '85%' }}>
      {children}
    </div>
  )
}

const gridCellGhost: CSSProperties = { background: 'rgb(var(--primary) / 0.15)', borderRadius: 3 }

export function GridColumnStartDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <GridCellGrid>
        <div style={{ gridColumn: on ? '3' : '1', gridRow: '1', background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={gridCellGhost} />)}
      </GridCellGrid>
    </Stage>
  )
}

export function GridColumnSpanDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <GridCellGrid>
        <div style={{ gridColumn: on ? 'span 3' : 'span 1', gridRow: '1', background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={gridCellGhost} />)}
      </GridCellGrid>
    </Stage>
  )
}

export function GridRowStartDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <GridCellGrid>
        <div style={{ gridColumn: '1', gridRow: on ? '2' : '1', background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={gridCellGhost} />)}
      </GridCellGrid>
    </Stage>
  )
}

export function GridRowSpanDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, width: '85%', height: '85%' }}>
        <div style={{ gridColumn: '1', gridRow: on ? 'span 2' : 'span 1', background: 'rgb(var(--primary))', borderRadius: 3, transition: 'all 0.6s ease' }} />
        {Array.from({ length: 7 }).map((_, i) => <div key={i} style={gridCellGhost} />)}
      </div>
    </Stage>
  )
}

export function ZIndexDemo() {
  const on = useLoopToggle()
  return (
    <Stage>
      <div style={{ position: 'relative', width: 70, height: 55 }}>
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: 8,
            left: 8,
            width: 40,
            height: 32,
            borderRadius: 6,
            background: 'rgb(var(--primary) / 0.9)',
            zIndex: on ? 1 : 2,
          }}
        />
        <div
          style={{
            ...boxBase,
            position: 'absolute',
            top: 20,
            left: 24,
            width: 40,
            height: 32,
            borderRadius: 6,
            background: 'rgb(var(--primary) / 0.4)',
            border: '1px solid rgb(var(--primary))',
            zIndex: on ? 2 : 1,
          }}
        />
      </div>
    </Stage>
  )
}
