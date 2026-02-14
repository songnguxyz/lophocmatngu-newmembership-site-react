// useQuill.js
import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const DEFAULT_TOOLBAR = [
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

export function useQuill({
  initialValue = "",
  placeholder = "",
  toolbarOptions = DEFAULT_TOOLBAR, // fallback về mặc định
}) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const contentRef = useRef(initialValue);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: toolbarOptions, // lúc này chắc chắn có toolbar
        },
      });

      // set nội dung khởi tạo
      if (initialValue) {
        quillRef.current.root.innerHTML = initialValue;
      }

      // lắng nghe thay đổi
      quillRef.current.on("text-change", () => {
        contentRef.current = quillRef.current.root.innerHTML;
      });
    }
  }, [editorRef.current]);

  // Đồng bộ lại nếu initialValue thay đổi từ ngoài (ví dụ reset form)
  useEffect(() => {
    if (quillRef.current && initialValue !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = initialValue;
      contentRef.current = initialValue;
    }
  }, [initialValue]);

  // Hàm lấy giá trị mới nhất khi submit
  const getContent = () => contentRef.current;

  return { editorRef, getContent };
}
