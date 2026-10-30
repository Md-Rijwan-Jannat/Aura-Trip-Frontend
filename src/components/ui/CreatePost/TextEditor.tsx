"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  const quillRef = useRef<any>(null);

  const modules = {
    toolbar: [[{ header: [1, 2, false] }], ["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]],
  };

  const formats = ["header", "bold", "italic", "underline", "list", "bullet", "link"];

  return (
    <div className='text-editor-wrapper'>
      <ReactQuill
        ref={quillRef}
        theme='snow'
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="What's on your mind?"
        className='bg-surface text-textMain min-h-[120px]'
      />
      <style jsx global>{`
        .text-editor-wrapper .ql-container {
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          min-height: 120px;
          font-size: 0.95rem;
        }

        .text-editor-wrapper .ql-toolbar {
          border: 1px solid var(--border-color);
          border-radius: 0.5rem 0.5rem 0 0;
          background: var(--surface);
        }

        .text-editor-wrapper .ql-editor {
          min-height: 120px;
          max-height: 300px;
          overflow-y: auto;
        }

        .text-editor-wrapper .ql-editor.ql-blank::before {
          color: var(--text-secondary);
          font-style: normal;
        }

        .text-editor-wrapper .ql-snow .ql-stroke {
          stroke: var(--text-main);
        }

        .text-editor-wrapper .ql-snow .ql-fill {
          fill: var(--text-main);
        }

        .text-editor-wrapper .ql-snow .ql-picker-label {
          color: var(--text-main);
        }

        .text-editor-wrapper .ql-toolbar button:hover,
        .text-editor-wrapper .ql-toolbar button.ql-active {
          color: var(--brand-primary);
        }

        .text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--brand-primary);
        }

        .text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: var(--brand-primary);
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
