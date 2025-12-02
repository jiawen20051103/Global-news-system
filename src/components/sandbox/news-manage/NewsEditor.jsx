import { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertToRaw,ContentState,EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { useTheme } from '@/context/ThemeContext.jsx';
import './NewsPreview.css';

export default function NewsEditor(props) {
  const { isDarkMode } = useTheme();
  const [editorState,setEditorState] = useState('')
  useEffect(()=>{
    // console.log(props.content);
    const html = props.content
    if(html === undefined) return
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);
      setEditorState(editorState)
    }
  },[props.content])

  return (
    <div className={`news-preview-content ${isDarkMode ? 'dark' : ''}`}>
      <Editor
        className={`news-preview-content ${isDarkMode ? 'dark' : ''}`}
        editorState={editorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="wrapperClassName"
        editorClassName="editorClassName"
        onEditorStateChange={(editorState)=>setEditorState(editorState)}

        onBlur={()=>{
          // console.log(draftToHtml(convertToRaw(editorState.getCurrentContent())));
          props.getContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
        }}
      />
    </div>
  )
}
