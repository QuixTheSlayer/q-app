import { TableNode, TableEnterpriseNode, TableUiType } from '@/types/node.type'

// Per-variant default accent, matching each TablePanel preview swatch.
export const TABLE_UI_TYPE_DEFAULT_COLORS: Record<TableUiType, { headBg?: string; headBorder: string; bodyBorder: string }> = {
  classicBordered: { headBg: '#bbbbbb', headBorder: '#888888', bodyBorder: '#888888' },
  striped: { headBorder: '#888888', bodyBorder: '#888888' },
  minimalBorderless: { headBorder: '#38bdf8', bodyBorder: '#38bdf8' },
  darkHeader: { headBg: '#8855dd', headBorder: '#8855dd', bodyBorder: '#8855dd' },
  cardRows: { headBorder: '#8855dd', bodyBorder: '#8855dd' },
  compact: { headBg: '#f8f8f8', headBorder: '#8855dd', bodyBorder: '#8855dd' },
  roundedSoft: { headBorder: '#4ade80', bodyBorder: '#4ade80' },
  highContrast: { headBorder: '#8855dd', bodyBorder: '#8855dd' },
}

export function restyleTableColors(uiType: TableUiType): Pick<TableNode, 'tableHeadStyle' | 'tableBodyStyle'> {
  const colors = TABLE_UI_TYPE_DEFAULT_COLORS[uiType]
  return {
    tableHeadStyle: { backgroundColor: colors.headBg, borderColor: colors.headBorder },
    tableBodyStyle: { borderColor: colors.bodyBorder },
  }
}

/**
 * Builds the scoped CSS string for a TableNode's current `uiType`, targeting
 * the same selectors the previous single-look implementation used
 * (`.{idClassName} table th` / `.{idClassName} table td`) so this is a
 * drop-in replacement for the inline `dynamicTableStyle` template literals
 * that used to live directly in Nodes.tsx / Elements.tsx.
 *
 * Unlike the original 8 variants (which only tweaked border/background/
 * padding on the same plain table look), these are meant to feel as
 * distinct from each other as TimelineVisual's 16 uiType variants do —
 * real structural/visual transformations of the table's presentation
 * (spreadsheet vs. dark data-grid vs. pill cells vs. glass card, etc.),
 * not just recolored borders. This has to stay CSS-only: TipTap owns the
 * actual <table><tr><td> DOM as a live-editable ProseMirror node, so we
 * can't restructure the DOM itself (no wrapping rows in cards, no
 * reordering into a different tag shape) without breaking in-place cell
 * editing — every variant below is a creative CSS treatment of the same
 * real <table>, targeting th/td and the <p> TipTap wraps cell text in.
 *
 * Every variant still reads from node.tableHeadStyle / node.tableBodyStyle /
 * node.style.color where it makes sense for that variant's look — the
 * reasoning for what each variant keeps vs. overrides is documented inline.
 */
export function buildTableUiTypeStyle(node: TableNode | TableEnterpriseNode, idClassName: string): string {
  const headBg = node.tableHeadStyle?.backgroundColor
  const headPadding = node.tableHeadStyle?.padding
  const headBorder = node.tableHeadStyle?.borderColor || '#888888'
  const bodyBg = node.tableBodyStyle?.backgroundColor
  const bodyPadding = node.tableBodyStyle?.padding
  const bodyBorder = node.tableBodyStyle?.borderColor || '#888888'
  const textColor = node.style?.color || '#000000'
  const accent = headBorder
  const serif = "Georgia, 'Times New Roman', serif"

  switch (node.uiType) {
    // "Editorial ledger": a rounded sheet with only horizontal rules, a small
    // spaced-caps header on the tinted head colour, and the first column set
    // in serif like a printed programme. Head/body colours still come from
    // node.tableHeadStyle/tableBodyStyle, so existing tables keep their hues.
    case 'classicBordered':
    default:
      return `
    .${idClassName} table {
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid ${headBorder};
      border-radius: 0.75em;
      overflow: hidden;
    }

    .${idClassName} table th {
      background-color: ${headBg};
      padding: ${headPadding};
      border: none;
      border-bottom: 2px solid ${headBorder};
      color: ${textColor};
      font-size: 0.78em;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: ${bodyBg};
      padding: ${bodyPadding};
      border: none;
      border-bottom: 1px solid ${bodyBorder};
      color: ${textColor};
    }

    .${idClassName} table tr:last-child td {
      border-bottom: none;
    }

    .${idClassName} table td:first-child {
      font-family: ${serif};
      font-weight: 700;
    }

    .${idClassName} table tr:hover td {
      background-color: ${accent}14;
    }
  `

    // "Programme list": no grid at all. A strong rule under a spaced-caps
    // header, hairline rows, serif first column and a hover wash, like a
    // printed event schedule.
    case 'striped':
      return `
    .${idClassName} table {
      border-collapse: collapse;
    }

    .${idClassName} table th {
      background-color: transparent;
      padding: ${headPadding};
      border: none;
      border-bottom: 2px solid ${headBorder};
      color: ${textColor};
      font-size: 0.78em;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: transparent;
      padding: ${bodyPadding};
      border: none;
      border-bottom: 1px solid ${bodyBorder}33;
      color: ${textColor};
    }

    .${idClassName} table td:first-child {
      font-family: ${serif};
      font-weight: 700;
    }

    .${idClassName} table tr:hover td {
      background-color: ${accent}0d;
    }
  `

    // "Dark data-grid": a near-black panel with a glowing accent rule under
    // the header, monospace type and faint banding. Background is fixed dark
    // on purpose; the border colour still drives the accent hue.
    case 'minimalBorderless':
      return `
    .${idClassName} table {
      background-color: #0b0f14;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 0.75em;
      overflow: hidden;
      box-shadow: 0 18px 40px -22px ${accent}99;
    }

    .${idClassName} table th {
      background-color: #11161d;
      padding: ${headPadding};
      border: none;
      border-bottom: 2px solid ${accent};
      color: ${accent};
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8em;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: transparent;
      padding: ${bodyPadding};
      border: none;
      border-bottom: 1px solid #ffffff14;
      color: #e5e7eb;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .${idClassName} table tr:nth-child(even) td {
      background-color: #ffffff08;
    }

    .${idClassName} table tr:hover td {
      background-color: ${accent}1f;
    }
  `

    // "Report card": a rounded, shadowed panel with a solid accent header in
    // white spaced caps and bands in a pale wash of the accent.
    case 'darkHeader':
      return `
    .${idClassName} table {
      border-collapse: separate;
      border-spacing: 0;
      box-shadow: 0 18px 36px -20px ${accent}80, 0 2px 6px rgba(0,0,0,0.06);
      border-radius: 0.85em;
      overflow: hidden;
    }

    .${idClassName} table th {
      background-color: ${headBg || accent};
      padding: ${headPadding};
      border: none;
      color: #ffffff;
      font-size: 0.8em;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: ${bodyBg || '#ffffff'};
      padding: ${bodyPadding};
      border: none;
      color: ${textColor};
    }

    .${idClassName} table tr:nth-child(even) td {
      background-color: ${accent}12;
    }

    .${idClassName} table td:first-child {
      font-weight: 700;
    }
  `

    // "Pill badge cells": every cell's text renders as its own rounded chip
    // on a soft accent wash, with the header as spaced caps above them.
    case 'cardRows':
      return `
    .${idClassName} table {
      border-collapse: separate;
      border-spacing: 0.45em;
    }

    .${idClassName} table th {
      background-color: transparent;
      padding: ${headPadding};
      border: none;
      color: ${textColor};
      font-size: 0.78em;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: transparent;
      padding: 0.2em;
      border: none;
      color: ${textColor};
    }

    .${idClassName} table td p {
      background-color: ${accent}1a;
      border: 1px solid ${accent}55;
      border-radius: 999px;
      padding: 0.4em 1em;
      margin: 0;
      display: inline-block;
      font-size: 0.9em;
    }

    .${idClassName} table td:first-child p {
      background-color: ${accent};
      border-color: ${accent};
      color: #ffffff;
      font-weight: 700;
    }
  `

    // "Comparison": a labelled first column on its own wash, centred values,
    // a strong rule under the head and the last column picked out in the
    // accent, the way pricing tables highlight the recommended plan.
    case 'compact':
      return `
    .${idClassName} table {
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid ${bodyBorder}55;
      border-radius: 0.75em;
      overflow: hidden;
    }

    .${idClassName} table th {
      background-color: ${headBg || '#f8f8f8'};
      padding: ${headPadding};
      border: none;
      border-bottom: 2px solid ${headBorder};
      color: ${textColor};
      font-size: 0.8em;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: center;
    }

    .${idClassName} table th:first-child,
    .${idClassName} table td:first-child {
      text-align: left;
      background-color: ${accent}0f;
      border-right: 2px solid ${accent}55;
      font-weight: 700;
    }

    .${idClassName} table td {
      background-color: ${bodyBg};
      padding: ${bodyPadding};
      border: none;
      border-bottom: 1px solid ${bodyBorder}33;
      color: ${textColor};
      text-align: center;
    }

    .${idClassName} table th:last-child,
    .${idClassName} table td:last-child {
      background-color: ${accent}14;
      color: ${accent};
      font-weight: 700;
    }
  `

    // "Retro terminal": green-on-black CRT look with monospace type and a
    // soft glow. Colours are fixed on purpose, as the retro identity is the
    // point of this variant.
    case 'roundedSoft':
      return `
    .${idClassName} table {
      background-color: #04140a;
      border-collapse: collapse;
      border: 1px solid #0f3d20;
      box-shadow: 0 0 30px -12px rgba(74,222,128,0.5);
    }

    .${idClassName} table th {
      background-color: #04140a;
      padding: ${headPadding};
      border: 1px solid #0f3d20;
      color: #4ade80;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      text-shadow: 0 0 6px rgba(74,222,128,0.6);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .${idClassName} table td {
      background-color: transparent;
      padding: ${bodyPadding};
      border: 1px solid #0f3d20;
      color: #86efac;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
  `

    // "Glass card": a frosted, softly shadowed rounded panel with a
    // translucent header; reads best on a tinted backdrop.
    case 'highContrast':
      return `
    .${idClassName} table {
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 1em;
      overflow: hidden;
      box-shadow: 0 16px 40px -18px ${accent}80, inset 0 1px 0 rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.5);
    }

    .${idClassName} table th {
      background-color: ${accent}26;
      backdrop-filter: blur(6px);
      padding: ${headPadding};
      border: none;
      border-bottom: 1px solid ${accent}40;
      color: ${textColor};
      font-size: 0.8em;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: left;
    }

    .${idClassName} table td {
      background-color: rgba(255,255,255,0.6);
      backdrop-filter: blur(6px);
      padding: ${bodyPadding};
      border: none;
      border-bottom: 1px solid rgba(255,255,255,0.55);
      color: ${textColor};
    }
  `
  }
}
