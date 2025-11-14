import { useParams } from "react-router-dom"
import "./index.scss"
import { EditorContainer } from "./EditorContainer"
import { useState,useRef, useCallback } from "react"
import { makeSubmission } from "./service"
export const PlaygroundScreen = () => {
    const params = useParams()
    const [showLoader,setShowLoader] = useState(false);
    const [input,setInput] = useState('')
    const [output,setOuput] = useState('')
    const { fileId, folderId } = params

    const importInput = (e) => {
        const file = e.target.files[0]
        const fileType = file.type.includes("text")
        if(fileType){
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = (e) => {
                setInput(e.target.result)
            }
        }
        else{
            alert("Please choose a program file!")
        }
    }

    const exportOutput = () => {
        const outputValue = output.trim();
        if(!outputValue){
            alert("Output is empty!")
            return;
        }
        const blob = new Blob([outputValue],{type:"text/plain"})
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `output.txt`;
        link.click()
    }

    const callback = ({apiStatus,data,message}) => {
        if(apiStatus === "loading"){
            setShowLoader(true);
        }
        else if(apiStatus === 'error'){
            setShowLoader(false)
            setOuput("Something went wrong")
        }
        else{
            //success
            setShowLoader(false)
            if(data.status.id === 3){
                setOuput(atob(data.stdout))
                console.log(atob(data.stdout))
            }
            else{
                setOuput(atob(data.stderr))
            }
            
        }
    }
    const runCode = useCallback(({code,language}) => {
        makeSubmission({code,language,stdin:input,callback})
    },[input])
    return (
        <div className="playground-container">
            <div className="header-container">
                <img src="/logo.png" className="logo" />
            </div>
            <div className="content-container">
                <div className="editor-container">
                    <EditorContainer fileId={fileId}  folderId={folderId} runCode={runCode}/>
                </div>
                <div className="input-output-container">
                    <div className="input-header">
                        <b>Input:</b>
                        <label htmlFor="input" className="icon-container">
                            <span className="material-icons">cloud_download</span>
                            <b>Import Input</b>
                        </label>
                        <input type="file" id="input" style={{display:'none'}} onChange={importInput}/>
                    </div>
                    <textarea value={input} onChange={(e) => setInput(e.target.value)}>

                    </textarea>
                </div>
                <div className="input-output-container">
                    <div className="input-header">
                        <b>Output:</b>
                        <button className="icon-container" onClick={exportOutput}>
                            <span className="material-icons">cloud_upload</span>
                            <b>Export Output</b>
                        </button>
                    </div>
                    <textarea readOnly  value={output} onChange={(e) => setOuput(e.target.value)}>

                    </textarea>
                </div>
            </div>
            {showLoader && 
            <div className="fullpage-loader">
                <div className="loader">

                </div>
            </div>}
        </div>
    )
}

const styles = {
    fullScreen:{
        position : 'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        zIndex:10
    }
}