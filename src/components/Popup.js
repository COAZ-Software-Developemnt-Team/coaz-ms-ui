import React,{useEffect,useState,useContext, useRef} from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GlobalContext } from '../contexts/GlobalContext'

const Popup = () => {
    const {popupData} = useContext(GlobalContext);
    const [rect,setRect] = useState(null);
    const popupRef = useRef(null)

    const calcSize = () => {
        let span = document.createElement("span"); 
        document.body.appendChild(span); 
        span.style.height = 'fit-content'; 
        span.style.width = 'fit-content'; 
        span.style.position = 'absolute'; 
        span.style.whiteSpace = 'no-wrap'; 
        span.innerHTML = renderToStaticMarkup(popupData.Component?popupData.Component:<></>); 
        let width = Math.ceil(span.clientWidth); 
        let height = Math.ceil(span.clientHeight);   
        document.body.removeChild(span); 
        return {width:width,height:height};
    } 

    useEffect(() => {
        if(popupData && popupData.parentElement) {
            const parentRect = popupData.parentElement.getBoundingClientRect();
            let vw = document.documentElement.clientWidth;
            let vh = document.documentElement.clientHeight;
            let size = calcSize();
            if(vh > (parentRect.bottom + size.height) && vw > (parentRect.left + size.width)) {
                setRect({
                    top: parentRect.bottom,
                    left: parentRect.left,
                    width: size.width,
                    height: size.height
                })
            } else if(vw > (parentRect.right + size.width) && vh > (parentRect.top + size.height)) {
                setRect({
                    top: parentRect.top,
                    left: parentRect.right,
                    width: size.width,
                    height: size.height
                })
            } else if(0 < (parentRect.left - size.width) && vh > (parentRect.top + size.height)) {
                setRect({
                    top: parentRect.top,
                    left: parentRect.left - size.width,
                    width: size.width,
                    height: size.height
                })
            } else if(vh > (parentRect.bottom + size.height) && 0 < (parentRect.right - size.width)) {
                setRect({
                    top: parentRect.bottom,
                    left: parentRect.right - size.width,
                    width: size.width,
                    height: size.height
                })
            } else if(0 < (parentRect.bottom - size.height) && 0 < (parentRect.left - size.width)) {

                setRect({
                    top: parentRect.bottom - size.height,
                    left: parentRect.left - size.width,
                    width: size.width,
                    height: size.height
                })
            } else if(0 < (parentRect.top - size.height) && vw > (parentRect.left + size.width)) {
                setRect({
                    top: parentRect.top - size.height,
                    left: parentRect.left,
                    width: size.width,
                    height: size.height
                })
            } else if(0 < (parentRect.top - size.height) && 0 < (parentRect.right - size.width)) {
                setRect({
                    top: parentRect.top - size.height,
                    left: parentRect.right - size.width,
                    width: size.width,
                    height: size.height
                })
            } else if(0 < (parentRect.bottom - size.height) && vw > (parentRect.right + size.width)) {
                setRect({
                    top: parentRect.bottom - size.height,
                    left: parentRect.right,
                    width: size.width,
                    height: size.height
                })
            } else {
                setRect({
                    top: parentRect.bottom,
                    left: parentRect.left,
                    width: Math.min(size.width,vw - parentRect.left),
                    height: Math.min(size.height,vh - parentRect.bottom) 
                })
            }
        }
    },[])
  return (
    <div>
        {popupData && popupData.Component && rect && 
        <div ref={popupRef} 
            style={{
                top:rect.top? rect.top+'px':'0',
                left:rect.left? rect.left+'px':'0',
                width:rect.width? rect.width+'px':'0',
                height:rect.height?rect.height+'px':'0'
            }}
            className={`fixed flex max-h-screen bg-[rgb(250,250,250)] overflow-x-hidden overflow-y-auto rounded-md shadow-lg z-50`}
        >
            {popupData.Component}
        </div>}
    </div>
  )
}

export default Popup