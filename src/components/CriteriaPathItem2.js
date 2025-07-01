import React,{ useEffect,useState,useRef, useContext } from 'react'
import { request } from '../App';
import { PiArrowRight, PiCircle, PiCircleFill, PiCircleLight, PiPath, PiTrash } from 'react-icons/pi';
import AddCriteriaPathItem from './AddCriteriaPathItem';
import { GlobalContext } from '../contexts/GlobalContext';

const CriteriaPathItem = ({criteriaPathItem,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext)
    const [children,setChildren] = useState([]);
    const buttonRef = useRef(null);

    const onAddPath = (e) => {
        e.preventDefault()
        setDialog({
            show:true,
            Component:() => <AddCriteriaPathItem parentPathItem={criteriaPathItem} reload={loadChildren}/>
        })
    }

    const onDelete = (e) => {
        e.preventDefault()
        request('DELETE','criteriapath/startswith',null,{startsWith:criteriaPathItem.id},true)
        .then((response) => {
            reload && reload();
        })
        .catch(() => {

        })
    }

    const loadChildren = async () => {
        if(criteriaPathItem && criteriaPathItem.id) {
            request('GET','criteriapaths/previous',null,{previousId:criteriaPathItem.id})
            .then((response) => {
                if(response.content) {
                    setChildren(response.content);
                }
            })
        }
    }

    useEffect(() => {
        loadChildren();
    },[])
  return (
    <div className='flex flex-row h-fit items-center space-x-2'>
        {criteriaPathItem && 
        <div className='flex flex-row h-fit items-center space-x-2'>
            {criteriaPathItem.previous && <PiCircleFill size={8} className='text-[rgb(0,175,240)]'/>}
            <button ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setPopupData({
                        show:true,
                        parentElement:buttonRef.current,
                        Component:
                            <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
                                <button 
                                    onClick={onAddPath}
                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                    <PiPath size={20} className='flex shrink-0'/>
                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                        Add path
                                    </p>
                                </button>
                                <button 
                                    onClick={onDelete}
                                    className='flex flex-row w-full px-2 h-8 space-x-2 items-center hover:bg-[rgb(234,235,239)] shrink-0'>
                                    <PiTrash size={20} className='flex shrink-0'/>
                                    <p className='w-full text-left whitespace-nowrap overflow-hidden overflow-ellipsis'>
                                        Delete
                                    </p>
                                </button>
                            </div>
                    })
                }}
                className='font-helveticaNeueRegular text-sm text-[rgb(68,71,70)]'>
                {criteriaPathItem.name}
            </button>
        </div>}
        {children && children.length > 0 &&
            <Children children={children} reload={loadChildren}/>
        }
    </div>
  )
}

export default CriteriaPathItem

const Children = ({children,reload}) => {
    const canvasRef = useRef(null);
    const childrenRef = useRef(null);

    const drawLines = () => {
        if(canvasRef.current && childrenRef.current) {
            canvasRef.current.innerHTML = "";
            const width = 32+'px';
            const height = childrenRef.current.offsetHeight;
            canvasRef.current.style.width = width;
            canvasRef.current.style.height = height;
            let y = 0;
            for(let child of childrenRef.current.children) {
                let childHeight = child.offsetHeight;
                let top = y + childHeight/2;
                y += childHeight;
                if(top < height/2) {
                    let div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = 0;
                    div.style.top = top+'px';
                    div.style.right = 0;
                    div.style.bottom = (height/2)+'px';
                    div.style.overflow = 'hidden';
                    let innerDiv = document.createElement('div');
                    innerDiv.style.width = 200+'%';
                    innerDiv.style.height = 200+'%';
                    innerDiv.style.borderRadius = 50+'%';
                    innerDiv.style.borderWidth = 1+'px';
                    innerDiv.style.borderColor = 'rgb(0,175,240)';
                    div.appendChild(innerDiv);
                    canvasRef.current.appendChild(div);
                } else {
                    let div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.left = 0;
                    div.style.top = (height/2)+'px';
                    div.style.right = 0;
                    div.style.bottom = (height - top)+'px';
                    div.style.overflow = 'hidden';
                    let innerDiv = document.createElement('div');
                    innerDiv.style.width = 200+'%';
                    innerDiv.style.height = 200+'%';
                    innerDiv.style.borderRadius = 50+'%';
                    innerDiv.style.borderWidth = 1+'px';
                    innerDiv.style.borderColor = 'rgb(0,175,240)';
                    innerDiv.style.transform = 'translate(0,-50%)';
                    div.appendChild(innerDiv);
                    canvasRef.current.appendChild(div);
                }
            }
        }
    }

    useEffect(() => {
        drawLines();
    })

    return (
        <div className='flex flex-row w-fit h-fit'>
            <div ref={canvasRef} className='relative'>
            </div>
            <div ref={childrenRef} className='flex flex-col h-fit rounded-full'>
                {children && children.length > 0 && children.map((child,i) => 
                    <CriteriaPathItem key={i} criteriaPathItem={child} reload={reload}/>
                )}
            </div>
        </div>
    )
}