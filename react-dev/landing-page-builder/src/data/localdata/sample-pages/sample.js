const content = {
  id: "root",
  type: "container",
  contentType: "root",
  layout: "row",
  style: {
    width: "75em",
  },
  children: [
    {
      id: "section",
      type: "container",
      contentType: "section",
      layout: "column",
      style: {
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
        gridAutoFlow: "column",
        gap: "0.5em",
        minHeight: "28em",
        padding: "0.5em",
        height: "",
        width: "",
      },
      children: [],
    },
  ],
};