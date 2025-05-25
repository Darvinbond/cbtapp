"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from "lexical";
import { useEffect } from "react";


// New component to handle external updates to editorState
function EditorStateUpdater({ editorStateJSON }: { editorStateJSON?: string | null }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    const currentLexicalState = editor.getEditorState();
    const currentLexicalStateString = JSON.stringify(currentLexicalState.toJSON());

    if (editorStateJSON && editorStateJSON.trim() !== "") {
      // Only update if the new state is different from the current one
      if (editorStateJSON !== currentLexicalStateString) {
        try {
          const newEditorState = editor.parseEditorState(editorStateJSON);
          editor.setEditorState(newEditorState);
        } catch (e) {
          console.error("Error parsing editorStateJSON for update:", e, editorStateJSON);
          // Fallback: clear editor to a known good state if parsing fails
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          });
        }
      }
    } else { // editorStateJSON is null, undefined, or empty string - treat as reset
      const emptyState = JSON.stringify(createEditor().getEditorState().toJSON()); // A truly empty state string
       // A more robust way to check if editor is empty:
      const isEmpty = editor.getEditorState().read(() => $getRoot().getChildrenSize() === 1 && $getRoot().getFirstChild()?.isEmpty());

      if (!isEmpty || (currentLexicalStateString !== emptyState && editorStateJSON === null) ) { // only clear if not already empty or explicitly set to null
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          root.append(paragraph);
          // Ensure selection is in the new paragraph for placeholder to show
          paragraph.select();
        });
      }
    }
  }, [editorStateJSON, editor]);

  return null;
}


const theme = {
  paragraph: "mb-4 last:mb-0",
  text: {
    bold: "font-medium",
  },
};

function Placeholder() {
  return (
    <div className="absolute top-0 left-0 p-2 text-gray-400 pointer-events-none opacity-50"> {/* Added basic styling */}
      Enter your question here...
      {/* Consider if a multi-line placeholder is ideal or if simple text is better */}
      <br /> Add a detailed description of your question (optional)
    </div>
  );
}

function OnChangePlugin({
  onChange,
}: {
  onChange: (editorState: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(JSON.stringify(editorState));
    });
  }, [editor, onChange]);
  return null;
}

const initialConfig = {
  namespace: "QuestionEditor",
  theme,
  onError: (error: Error) => {
    console.error("Lexical error:", error);
  },
};

interface QuestionEditorProps {
  onChange?: (value: string) => void;
  value?: string;
  editable?: boolean;
  namespaceId: string;
}

export default function QuestionEditor({
  onChange = () => {},
  value,
  editable = true,
  namespaceId,
}: QuestionEditorProps) {
  const initialEditorState = value;

  const currentInitialConfig = {
    namespace: `QuestionEditor_${namespaceId}`,
    theme,
    editable,
    editorState: initialEditorState, // Use the prop value (stringified state or null)
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer
      initialConfig={currentInitialConfig}
    >
      <div className="relative m-0 p-0">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[100px] outline-none text-gray-900"
              contentEditable={editable}
            />
          }
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary as any}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={onChange} />
        <EditorStateUpdater editorStateJSON={value} />
      </div>
    </LexicalComposer>
  );
}
