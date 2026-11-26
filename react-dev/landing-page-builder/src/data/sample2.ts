import {CanvasNode} from "../types/node.type";

export const sampleData2: CanvasNode = {
  id: 'root',
  type: 'container',
  contentType: 'root',
  layout: 'column',
  style: {
    width: '70em'
  },
  children: [{
    id: '0',
    type: 'container',
    contentType: 'section',
    layout: 'row',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
      minHeight: '28em',
      // overflow: 'hidden',
    },
    children: [
      {
        id: '0.0',
        type: 'container',
        contentType: 'block',
        layout: 'column',
        style: {
          paddingTop: "5.6em",
          paddingRight: "2.8em",
          paddingBottom: "5.6em",
          paddingLeft: "5.6em",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          gap: '1.4em'
        },
        children: [
          {
            id: '0.0.0',
            type: 'content',
            children: 'Landing Page Builder',
            contentType: 'text',
            style: {
              fontSize: '2.45em',
              fontWeight: '700',
              color: '#080808'
            },
          },
          {
            id: '0.0.1',
            type: 'content',
            children: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur exercitationem earum dolorum placeat',
            contentType: 'text',
            style: {
              fontSize: '1.4em',
              fontWeight: 'normal',
              color: '#7f7f7f'
            },
          },
          {
            id: '0.0.2',
            type: 'content',
            children: 'Get started',
            contentType: 'button',
            style: {
              display: 'block',
              fontSize: "1.19em",
              fontWeight: "semibold",
              color: "#F0F0F0",
              backgroundColor: "#2f2f2f",
              paddingTop: "0.56em",
              paddingRight: "1.05em",
              paddingBottom: "0.56em",
              paddingLeft: "1.05em",
              borderRadius: "0.42em",
            },
          },
        ]
      },
      {
        id: '0.1',
        type: 'container',
        contentType: 'block',
        layout: 'row',
        style: {
          minHeight: '100%',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          paddingTop: '1.5em',
          paddingRight: '1.5em',
          paddingBottom: '1.5em',
          paddingLeft: '1.5em',
          gap: '1em'
        },
        children: [

        ]
      },
    ]
  },
  {
    id: '1',
    type: 'container',
    contentType: 'section',
    layout: 'column',
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#00A35C',
      gap: '1.4em',
      minHeight: '28em'
    },
    children: [
      {
        id: '1.0',
        type: 'content',
        children: 'Ship site with style',
        contentType: 'text',
        style: {
          fontSize: '2.59em',
          fontWeight: '700',
          color: '#FFFFFF',
        },
      },
      {
        id: '1.1',
        type: 'content',
        children: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur',
        contentType: 'text',
        style: {
          maxWidth: '28em',
          fontSize: '1.4em',
          fontWeight: 'normal',
          color: '#dfdfdf',
          textAlign: 'center'
        },
      },
      {
        id: '1.2',
        type: 'content',
        children: 'Learn more',
        contentType: 'button',
        style: {
          display: 'inline',
          fontSize: '1.19em',
          fontWeight: 'semibold',
          color: '#2f2f2f',
          backgroundColor: '#Fafafa',
          paddingTop: "0.56em",
          paddingRight: "1.05em",
          paddingBottom: "0.56em",
          paddingLeft: "1.05em",
          borderRadius: "0.42em",
        },
      },
    ]
  },
  {
    id: '2',
    type: 'container',
    contentType: 'section',
    layout: 'row',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
      minHeight: '28em'
    },
    children: [
      {
        id: '2.0',
        type: 'container',
        contentType: 'block',
        layout: 'row',
        style: {
          width: '100%',
          minHeight: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          paddingTop: '1.5em',
          paddingRight: '1.5em',
          paddingBottom: '1.5em',
          paddingLeft: '1.5em',
        },
        children: []
      },
      {
        id: '2.1',
        type: 'container',
        contentType: 'block',
        layout: 'column',
        style: {
          width: '100%',
          minHeight: '100%',
          display: 'grid',
          // gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          gridTemplateColumns: '1fr',
          paddingTop: '1.5em',
          paddingRight: '1.5em',
          paddingBottom: '1.5em',
          paddingLeft: '1.5em',
          gap: '1em'
        },
        children: []
      },
      {
        id: '2.2',
        type: 'container',
        contentType: 'block',
        layout: 'row',
        style: {
          width: '100%',
          minHeight: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          paddingTop: '1.5em',
          paddingRight: '1.5em',
          paddingBottom: '1.5em',
          paddingLeft: '1.5em',
        },
        children: []
      }
    ]
  }]
};
