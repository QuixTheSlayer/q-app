import {LAYOUT} from "@/types/node.enum";
import {CanvasNode} from "../../types/node.type";
import pluginsImg from "@/assets/demo/plugins.jpg"
import layoutImg from "@/assets/demo/layout.jpg"
import effectImg from "@/assets/demo/effect.jpg"
import navigationImg from "@/assets/demo/navigation.jpg"
import seoImg from "@/assets/demo/SEO.jpg"
import cmsImg from "@/assets/demo/CMS.jpg"


export const grid_template_1: CanvasNode = {
  id: '3',
  type: 'container',
  contentType: 'section',
  layout: LAYOUT.Row,
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
    minHeight: '28em',
    padding: '6em'
  },
  children: [
    {
      id: '3.0',
      type: 'container',
      contentType: 'block',
      layout: LAYOUT.Grid,
      style: {
        display: 'grid',
        gridAutoFlow: 'row',
        gridTemplateColumns: 'repeat(3,1fr)',
        gridTemplateRows: 'repeat(2,1fr)',
        height: '100%',
        width: '100%',
        gap: '4em'
      },
      children: [
        {
          id: '3.0.1',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.1.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: pluginsImg
            },
            {
              id: '3.0.1.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"Plugins\"}]}]}"
            },
            {
              id: '3.0.1.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Connect your site to the most popular apps out there.\"}]}]}"
            },
          ]
        },
        {
          id: '3.0.2',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.2.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: layoutImg
            },
            {
              id: '3.0.2.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"Layout\"}]}]}"
            },
            {
              id: '3.0.2.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Use positioning to fix topbars, sidebars, and backgrounds.\"}]}]}"
            },
          ]
        },
        {
          id: '3.0.3',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.3.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: effectImg
            },
            {
              id: '3.0.3.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"Effects\"}]}]}"
            },
            {
              id: '3.0.3.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Use effects like Transforms and Parallax scrolling.\"}]}]}"
            },
          ]
        },
        {
          id: '3.0.4',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.4.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: cmsImg
            },
            {
              id: '3.0.4.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"CMS\"}]}]}"
            },
            {
              id: '3.0.4.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Connect your site to the most popular apps out there.\"}]}]}"

            },
          ]
        },
        {
          id: '3.0.5',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.5.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: navigationImg
            },
            {
              id: '3.0.5.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"Navigation\"}]}]}"
            },
            {
              id: '3.0.5.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Connect your site to the most popular apps out there.\"}]}]}"
            },
          ]
        },
        {
          id: '3.0.6',
          type: 'container',
          contentType: 'block',
          layout: LAYOUT.Row,
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1em',
          },
          children: [
            {
              id: '3.0.6.1',
              type: 'content',
              contentType: 'image',
              style: {
                aspectRatio: '1',
                width: '100%',
                borderRadius: '1em',
                backgroundColor: '#eaeaea',
                borderWidth: '0.15em',
                borderStyle: 'solid',
                borderColor: '#dfdfdf'
              },
              children: seoImg
            },
            {
              id: '3.0.6.2',
              type: 'content',
              contentType: 'text',
              style: {
                fontWeight: '600',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.3em\"}}],\"text\":\"SEO\"}]}]}"
            },
            {
              id: '3.0.6.3',
              type: 'content',
              contentType: 'text',
              style: {
                color: '#888',
              },
              children: "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"attrs\":{\"textAlign\":\"left\"},\"content\":[{\"type\":\"text\",\"marks\":[{\"type\":\"textStyle\",\"attrs\":{\"color\":null,\"fontFamily\":null,\"fontSize\":\"1.1em\"}}],\"text\":\"Connect your site to the most popular apps out there.\"}]}]}"
            },
          ]
        },
      ]
    }
  ]
}