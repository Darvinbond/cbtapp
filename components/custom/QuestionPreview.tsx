'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

const theme = {
  paragraph: 'mb-1 last:mb-0',
  text: {
    bold: 'font-medium',
  }
};

function InitialStatePlugin({ state }: { state: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (state) {
      const editorState = editor.parseEditorState(state);
      editor.setEditorState(editorState);
    }
  }, [editor, state]);

  return null;
}

interface QuestionPreviewProps {
  text: string;
}

export default function QuestionPreview({ text }: QuestionPreviewProps) {
  const initialConfig = {
    namespace: 'QuestionPreview',
    editable: false,
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="text-gray-900">
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              className="outline-none"
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary as any}
        />
        <InitialStatePlugin state={text} />
      </div>
    </LexicalComposer>
  );
}
