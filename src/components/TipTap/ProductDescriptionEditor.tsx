"use client";

import {useEditor, EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {useEffect} from "react";

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ProductDescriptionEditor: React.FC<ProductDescriptionEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: true,
    content: value,
    onUpdate: ({editor}) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={
            editor?.isActive("bold") ? "editor-button-active" : "editor-button"
          }
          disabled={disabled}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={
            editor?.isActive("italic")
              ? "editor-button-active"
              : "editor-button"
          }
          disabled={disabled}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={
            editor?.isActive("bulletList")
              ? "editor-button-active"
              : "editor-button"
          }
          disabled={disabled}
          title="Aufzählungsliste"
        >
          • Liste
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={
            editor?.isActive("orderedList")
              ? "editor-button-active"
              : "editor-button"
          }
          disabled={disabled}
          title="Nummerierte Liste"
        >
          1. Nummeriert
        </button>
      </div>

      {/* Editor mit Listen-Stilen */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default ProductDescriptionEditor;
