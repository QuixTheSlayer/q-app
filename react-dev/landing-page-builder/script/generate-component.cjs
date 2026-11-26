#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const name = process.argv[2];

if (!name) {
    console.log("Usage: npm run generate componentName");
    process.exit(1);
}

const className = name.charAt(0).toUpperCase() + name.slice(1);



function createFile(filePath, content = "") {
    const fullPath = path.resolve(filePath);

    // Create parent directories
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    // Skip existing file
    if (fs.existsSync(fullPath)) {
        console.log(`- Skipped: ${filePath} already exists.`);
        return;
    }

    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`✓ Created: ${filePath}`);
}

function updateFile(filePath, callback) {
    const content = fs.readFileSync(filePath, "utf8");
    const updated = callback(content);

    if (updated !== content) {
        fs.writeFileSync(filePath, updated, "utf8");
        console.log(`✓ Updated ${filePath}`);
    } else {
        console.log(`- Skipped ${filePath}`);
    }
}

function insertAfter(content, marker, text) {
    if (content.includes(text.trim())) {
        return content;
    }

    return content.replace(marker, `${marker}\n${text}`);
}

function insertBefore(content, marker, text) {
    if (content.includes(text.trim())) {
        return content;
    }

    return content.replace(marker, `${text}\n${marker}`);
}


 const file = {
    'create': createFile,
    'update': updateFile,
    'insert': {
        'after': insertAfter,
        'before': insertBefore
    }

}
//
// node.type.ts
//
file.update("src/types/node.type.ts", (content) => {
    content = file.insert.after(
        content,
        "export type ContentType =",
        `  | "${name}"`
    );

    content = file.insert.after(
        content,
        "export type NodeAttributesMap = {",
        `  ${name}: Omit<AnchorHTMLAttributes<HTMLDivElement>, "style">,`
    );

    content = file.insert.before(
        content,
        "export type ContentNode =",
        `export interface ${className}Node extends BaseContentNode<"${name}"> {

}
`
    );

    content = file.insert.after(
        content,
        "export type ContentNode =",
        `  | ${className}Node`
    );

    return content;
});

//
// defaultNodeStyle.ts
//
file.update("src/consts/defaultNodeStyle.ts", (content) => {
    return file.insert.after(
        content,
        "export const NEW_NODES: Record<ContentType, CanvasNode> = {",
        `  ${name}: {
    id: "${name}",
    type: "content",
    contentType: "${name}",
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      minWidth: "2em",
      minHeight: "2em",
    },
  },`
    );
});

//Add Insert UI
// insert.tsx
//
file.update("src/components/ContentPanelUI/insert.tsx", (content) => {
    return file.insert.after(
        content,
        '{/* AdvanceNode */}',
        `<AdvancedContentButton
    label="${className}"
    contentType="${name}"
    icon={<TbSocial size={16} />}
    onClick={() => handleAddNode("${name}")}
/>`
    );
});


function NewNode(nodeName) {
    return `export function ${nodeName}({
    node,
    canvas,
    path,
    parent,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & ContentNodeRenderProps<${nodeName}Node>) {
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        transform,
        isDragging,
    } = useDraggable({
        disabled: canvas?.textEditorObj?.isFocused,
        id: node.id,
        data: {
            type: DraggedElementType.Canvas,
            node,
            path,
            parent,
        } satisfies DndCanvasElementData,
    });

    const { setNodeRef: setDropRef } = useDroppable({
        id: node.id,
        data: {
            type: DraggedElementType.Canvas,
            node,
            path,
            parent,
        } satisfies DndCanvasElementData,
    });

    const setNodeRef = (el: HTMLElement) => {
        setDragRef(el);
        setDropRef(el);
    };

    const style = {
        // transform: CSS.Translate.toString(transform),
        transition: isDragging ? "none" : undefined,
        ...node.style,
    };



    if (canvas)
        return (
            <>
                <Popover open={canvas?.focused?.id === node.id}>
                    <PopoverTrigger asChild>
                        <div
                            data-name='node'
                            {...props}
                            ref={(el) => setNodeRef(el as HTMLDivElement)}
                            {...attributes}
                            {...listeners}
                            id={node.id}
                            data-id={node.id}
                            style={style}
                            aria-label="Draggable"
                            data-cypress="draggable-item"
                            data-node-path={path}
                            tabIndex={-1}
                            className={cn(
                                " !p-2 w-auto h-auto [&:hover:not(:has(div:hover))]:outline outline-[1px] outline-highlight -outline-offset-[0.5px] overflow-hidden !flex !items-center !justify-center cursor-default",
                                canvas?.focused?.id === node.id && "outline outline-[1.5px]",
                                canvas?.isParentIsFocused(node.id) &&
                                "outline-dashed outline-highlight-secondary outline-offset-[0px] z-[11]",
                                canvas?.focusedParent?.id === node.id &&
                                "outline-dashed outline-offset-0", "bg-blue-200/50 flex items-center justify-center",
                                isDragging && " invisible",
                            )}
                        >

                            ${nodeName}

                        </div>
                    </PopoverTrigger>
                    {!isDragging && (
                        <PopoverContent
                            side="top"
                            align="center"
                            sideOffset={10}
                            alignOffset={2}
                            className="shadow-none"
                            onClick={(e) => e.stopPropagation()}
                            onCloseAutoFocus={(e) => e.preventDefault()}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                            <ActionMenu canvas={canvas} />
                        </PopoverContent>
                    )}
                </Popover>
                {isDragging && (
                    <DragOverlay modifiers={[]}>
                        <div
                            id="drag-overlay"
                            data-id={node.id}
                            style={node.style}
                            className={cn(
                                "h-full outline outline-[2px] opacity-80 overflow-hidden !flex !items-center !justify-center",
                                !node.style.backgroundColor &&
                                "bg-blue-200/60",
                            )}
                        >
                           ${nodeName}
                        </div>
                    </DragOverlay>
                )}
            </>
        );
}`
}

function NewElement(elementName) {
    return `export function ${elementName}({ node,canvas }: ContentRenderProps<${elementName}Node>) {


	const style = {
		// transform: CSS.Translate.toString(transform),

		...node.style,
	};

	if (node)
		return (

				<div
					data-name='node'


					id={node.id}
					data-id={node.id}
					style={style}
				>

					${elementName}

				</div>

		);
}`
}

// Add NodeUI
// Nodes.tsx
//
file.update("src/components/EditorUI/Nodes.tsx", (content) => {
    return file.insert.before(
        content,
        'export default {',
        NewNode(className)
    );
});

//Export Node
file.update("src/components/EditorUI/Nodes.tsx", (content) => {
    return file.insert.after(
        content,
        "export default {",
        `  ${name}:${className},`
    );
});

// Import NodeType
file.update("src/components/EditorUI/Nodes.tsx", (content) => {
    return file.insert.before(
        content,
        '} from "@/types/node.type";',
        `${className}Node,`
    );
});

//Add ElementUI
// Elements.tsx
//
file.update("src/components/PreviewUI/Elements.tsx", (content) => {
    return file.insert.before(
        content,
        'export default {', NewElement(className)
    );
});

//Export element
file.update("src/components/PreviewUI/Elements.tsx", (content) => {
    return file.insert.after(
        content,
        "export default {",
        `  ${name}:${className},`
    );
});

//Import NodeType
file.update("src/components/PreviewUI/Elements.tsx", (content) => {
    return file.insert.before(
        content,
        '} from "@/types/node.type";',
        `${className}Node,`
    );
});


//
// PropertyUI
//
function NewPropertyFileContent() {
    return `import Attributes from '@/components/PropertyPanelUI/Sections/Attributes'
import { PanelRowContainer, SectionContainer } from '@/components/PropertyPanelUI/ui'
import { useEditor } from '@/context/EditorContext'
import { ${className}Node } from '@/types/node.type'
import { TextInput } from 'judgify-react-ui/metronic'
import ContentSizeSection from './ContentSizeSection'
import { BorderController } from '../Sections/relatedComponents/Controllers'

function ${className}() {

  const canvas = useEditor()
  const node = canvas?.focusedNode as ${className}Node


  if (node)
    return (
      <div className=' w-full h-[85vh] max-h-[85vh] overflow-y-auto no-scrollbar  '>




        {/* Size Section  */}
        <ContentSizeSection />



        <SectionContainer label='Style'>

          <BorderController />



        </SectionContainer>
        {/* <Link /> */}
        <Attributes />
      </div>
    )
}

export default ${className}`
}

// PanelTypes 

//Create New Panel
file.create(
    `src/components/PropertyPanelUI/PanelTypes/${className}Panel.tsx`,
    NewPropertyFileContent()
);

//index
// Define NewPanelComponent
file.update("src/components/PropertyPanelUI/index.tsx", (content) => {
    return file.insert.after(
        content,
        'const PanelTypes: Record<ContentType | string, ReactNode> = {',
        `${name}: <${className}Panel/>,`
    );
});

// IMport New Panel component
file.update("src/components/PropertyPanelUI/index.tsx", (content) => {
    return file.insert.before(
        content,
        'const PanelTypes: Record<ContentType | string, ReactNode> = {',
        `import ${className}Panel from "@/components/PropertyPanelUI/PanelTypes/${className}Panel";`
    );
});





console.log(`\n✅ ${className} generated successfully.`);