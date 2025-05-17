'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useEffect } from 'react';

const theme = {
  paragraph: 'mb-4 last:mb-0',
  text: {
    bold: 'font-medium',
  }
};

function Placeholder() {
  return (
    <div className="absolute top-0 left-0 pointer-events-none text-gray-400">
      <div className="text-base font-medium">Enter your question here...</div>
      <div className="text-sm mt-2">Add a detailed description of your question (optional)</div>
    </div>
  );
}

function OnChangePlugin({ onChange }: { onChange: (editorState: string) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(JSON.stringify(editorState));
    });
  }, [editor, onChange]);
  return null;
}

const initialConfig = {
  namespace: 'QuestionEditor',
  theme,
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

interface QuestionEditorProps {
  onChange?: (value: string) => void;
  value?: string;
  editable?: boolean;
}

export default function QuestionEditor({ onChange = () => {}, value, editable = true }: QuestionEditorProps) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
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
      </div>
    </LexicalComposer>
  );
}
