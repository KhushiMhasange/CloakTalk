import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css"


function Pdf({file}){
    
    const [width,setWidth] = useState(window.innerWidth);

    useEffect(() => {
       const handleSize = () =>{
         setWidth(window.innerWidth);
       }
       window.addEventListener('resize',handleSize);
      return () => {
        window.removeEventListener('resize',handleSize);
      }
    }, [])
    
    const pdfWidth = width > 900 ? 450 : width*0.9;

    return(
        <div style={{
      width: pdfWidth,
      margin: "auto",
      padding: "10px",
      backgroundColor: "var(--bg-primary)",
      height: "calc(100vh - 100px)",
      overflowY: "auto",           
      border: "1px solid #ccc",
      borderRadius: "8px"
    }}>
          <Worker workerUrl={"https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js"}>
            <Viewer fileUrl={file} style={{width:pdfWidth}} initialPage={0} />
          </Worker>
        </div>
    )
}
Pdf.propTypes = {
    file: PropTypes.string.isRequired, 
};

export default Pdf ;