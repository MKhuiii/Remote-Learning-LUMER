"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  Link,
  Table,
  TableToolbar,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageResize,
  ImageStyle,
  BlockQuote,
  CodeBlock,
  Undo,
  FontColor,
  FontBackgroundColor,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

interface Props {
  value: string;
  onChange: (data: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: "GPL",

          plugins: [
            Essentials,
            Paragraph,
            Bold,
            Italic,
            Underline,
            Heading,
            List,
            Link,
            Table,
            TableToolbar,
            Image,
            ImageToolbar,
            ImageCaption,
            ImageResize,
            ImageStyle,
            BlockQuote,
            CodeBlock,
            Undo,
            FontColor,
            FontBackgroundColor,
          ],

          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "|",
            "insertTable",
            "|",
            "blockQuote",
            "codeBlock",
          ],
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />

      <style jsx global>{`
        .ck-editor__editable_inline {
          min-height: 550px;
          padding: 24px !important;
        }

        .ck.ck-editor {
          border-radius: 12px;
        }

        .ck-toolbar {
          border-radius: 12px 12px 0 0 !important;
        }

        .ck-editor__editable {
          font-size: 16px;
          line-height: 1.8;
        }

        .ck-content h1 {
          font-size: 2rem;
        }

        .ck-content h2 {
          font-size: 1.6rem;
        }

        .ck-content h3 {
          font-size: 1.3rem;
        }

        .ck-content p {
          margin-bottom: 14px;
        }

        .ck-content pre {
          border-radius: 10px;
        }

        .ck-content table {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
