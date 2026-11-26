#!/bin/bash

NAME=$1

if [ -z "$NAME" ]; then
    echo "Usage: ./create-component.sh ComponentName"
    exit 1
fi

grep -q "| \"$NAME\"" "src/types/node.type.ts" || \
sed -i "/^export type ContentType =/a\\
  | \"$NAME\"
" "src/types/node.type.ts"

grep -q " $NAME: Omit<AnchorHTMLAttributes<HTMLDivElement>, \"style\">" "src/types/node.type.ts" || \
sed -i "/^export type NodeAttributesMap = {/a\\
  $NAME: Omit<AnchorHTMLAttributes<HTMLDivElement>, \"style\">,
" "src/types/node.type.ts"

CLASS_NAME="${NAME^}"

grep -q "| $CLASS_NAME\Node" "src/types/node.type.ts" || \
sed -i "/^export type ContentNode =/a\\
  | $CLASS_NAME\Node
" "src/types/node.type.ts"

grep -q "export interface ${CLASS_NAME}Node extends BaseContentNode<\"${NAME}\">" "src/types/node.type.ts" || \
sed -i "/^export type ContentNode =/i\\
export interface ${CLASS_NAME}Node extends BaseContentNode<\"${NAME}\"> {\\
}\\
" "src/types/node.type.ts"

# defaultStyle
grep -q "\"$NAME\"" "src/consts/defaultNodeStyle.ts" || \
sed -i "/^export const NEW_NODES: Record<ContentType, CanvasNode> = {/a\\
  $NAME: {\\
    id: \"$NAME\",\\
    type: \"content\",\\
    contentType: \"$NAME\",\\
    style: {\\
      display: \"flex\",\\
      height: \"100%\",\\
      width: \"100%\",\\
      minWidth: \"2em\",\\
      minHeight: \"2em\",\\
    },\\
  },\\
" "src/consts/defaultNodeStyle.ts"

INSERTPATH= "src/components/ContentPanelUI/insert.tsx"


ADVNODE="<span className=\"hidden\" >AdvanceNode</span>"

INSERTNODE= "<AdvancedContentButton
						label=\"$CLASS_NAME\"
						contentType=\"$NAME\"
						icon={<TbSocial size={16} />}
						onClick={() => handleAddNode(\"$NAME\")}
					/>"

grep -q "$INSERTNODE" "$INSERTPATH" || \
sed -i "/^$ADVNODE/a\\
  INSERTNODE
" "$INSERTPATH"

echo "Created $NAME"