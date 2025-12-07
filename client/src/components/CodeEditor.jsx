import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

/**
 * Monaco Editor component for collaborative code editing
 * Supports JavaScript and Python with syntax highlighting
 */
export function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false
}) {
  const editorRef = useRef(null);
  const isLocalChange = useRef(false);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: readOnly,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      theme: 'vs-dark'
    });
  };

  // Handle code changes from user input
  const handleEditorChange = (value) => {
    if (value !== undefined) {
      isLocalChange.current = true;
      onChange(value);
    }
  };

  // Update editor content when code changes from Socket.IO
  useEffect(() => {
    if (editorRef.current && !isLocalChange.current) {
      const editor = editorRef.current;
      const currentValue = editor.getValue();

      // Only update if the code is different to avoid cursor jumps
      if (currentValue !== code) {
        const position = editor.getPosition();
        editor.setValue(code);

        // Restore cursor position if possible
        if (position) {
          editor.setPosition(position);
        }
      }
    }
    isLocalChange.current = false;
  }, [code]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        selectOnLineNumbers: true,
        automaticLayout: true,
      }}
      loading={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: '#d4d4d4',
          fontSize: '14px'
        }}>
          Loading Monaco Editor...
        </div>
      }
    />
  );
}
