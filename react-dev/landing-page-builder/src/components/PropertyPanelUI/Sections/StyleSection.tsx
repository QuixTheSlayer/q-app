import {  SectionContainer } from '@/components/PropertyPanelUI/ui';

import { useEditor } from '@/context/EditorContext';
import { BackgroundColorController, BorderController, BoxShadowController } from './relatedComponents/Controllers';
import Attributes from './Attributes';
import { useTranslation } from 'react-i18next';

export const CSSUtilsForBoxShadow = {
  // Existing functions...

  extractBoxShadowValues: (shadowString: string) => {
    if (!shadowString || shadowString === 'none') {
      return { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033', inset: false };
    }

    // Check if it's an inset shadow
    const inset = shadowString.includes('inset');
    let cleanString = shadowString.replace('inset', '').trim();

    // Extract color (supports rgba, hsla, hex)
    const colorMatch = cleanString.match(/((rgba|rgb|hsla|hsl)\([^)]+\)|#[a-fA-F0-9]+)/);
    const color = colorMatch ? colorMatch[0] : '#00000033';

    // Remove color to leave just the numeric measurements
    if (colorMatch) cleanString = cleanString.replace(colorMatch[0], '').trim();

    // Split remaining numbers (e.g., "0px 4px 8px 0px")
    const numbers = cleanString.split(/\s+/).map(val => parseFloat(val) || 0);

    return {
      x: numbers[0] || 0,
      y: numbers[1] || 0,
      blur: numbers[2] || 0,
      spread: numbers[3] || 0,
      color,
      inset
    };
  },
  buildBoxShadowString: (params: { x: number; y: number; blur: number; spread: number; color: string; inset?: boolean }) => {
    const { x, y, blur, spread, color, inset } = params;
    // Converts numbers to 'em' or 'px' depending on your design token standards
    const xStr = `${x}px`;
    const yStr = `${y}px`;
    const blurStr = `${blur}px`;
    const spreadStr = `${spread}px`;
    const insetStr = inset ? 'inset ' : '';

    return `${insetStr}${xStr} ${yStr} ${blurStr} ${spreadStr} ${color}`.trim();
  }
};

function StyleSection({ withAttributes = true }: { withAttributes?: boolean }) {
  const { t } = useTranslation('propertyPanel')
  const canvas = useEditor()
  const node = canvas?.focusedNode



  if (node?.type )
    return (
      <SectionContainer className="!border-none"  hintKey="styleGroup" label={t('styleSection.style')}>
        <BackgroundColorController />

        <BorderController />
        <BoxShadowController />

        {withAttributes && <Attributes />}

      </SectionContainer >
    )

  return <></>
}

export default StyleSection