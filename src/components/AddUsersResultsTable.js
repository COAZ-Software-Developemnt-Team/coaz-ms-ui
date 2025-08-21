import React, {useState,useEffect,useContext,useRef} from 'react'
import { LiaAngleLeftSolid,LiaAngleRightSolid } from "react-icons/lia";
import Message from './Message';

  const AddUsersResultsTable = ({pages,pageSize,totalElements,message}) => {
    const [pageNo,setPageNo] = useState(0);
    const [page,setPage] = useState(null);

    const tableContainerRef = useRef(null);
    const tableRef = useRef(null);
    const headerRef = useRef(null);
    const [tableHeight,setTableHeight] = useState(0);
    const [tHeaderHeight,setTHeaderHeight] = useState(32);
    const [tBodyHeight,setTBodyHeight] = useState(0);
    const [messageHeight,setMessageHeight] = useState(32);
    const [pagenationInfoHeight,setPagenationInfoHeight] = useState(64);
    const calcHeights = (tableContainerHeight) => {
        let height = tableContainerHeight - pagenationInfoHeight - messageHeight;
        setTableHeight(height);
        setTBodyHeight(height - tHeaderHeight);
    }

    let timerId;
    
    const columns = [
        {
            name:'username',
            label:'Username'
        },
        {
            name:'firstname',
            label:'Firstname'
        },
        {
            name:'lastname',
            label:'Lastname'
        },
        {
            name:'middlename',
            label:'Middlename'
        },
        {
            name:'sex',
            label:'Sex'
        },
        {
            name:'dateOfBirth',
            label:'Date of Birth'
        },
        {
            name:'idType',
            label:'ID Type'
        },
        {
            name:'idNumber',
            label:'ID Number'
        },
        {
            name:'nationality',
            label:'Nationality'
        },
        {
            name:'email',
            label:'Email'
        },
        {
            name:'phone1',
            label:'Phone 1'
        },
        {
            name:'phone2',
            label:'Phone 2'
        },
        {
            name:'physicalAddress',
            label:'Physical Address'
        },
        {
            name:'postalAddress',
            label:'PostalAddress'
        },
        {
            name:'province',
            label:'Province'
        },
        {
            name:'district',
            label:'District'
        },
        {
            name:'program',
            label:'Program'
        },
        {
            name:'institution',
            label:'Institution'
        },
        {
            name:'professionalCategory',
            label:'Professional Category'
        },
        {
            name:'employed',
            label:'Employed'
        },
        {
            name:'employer',
            label:'Employer'
        },
        {
            name:'organizationalUnit',
            label:'Organizational Unit'
        },
        {
            name:'currentPosition',
            label:'Current Position'
        },
        {
            name:'facility',
            label:'Facility'
        },
        {
            name:'status',
            label:'Status'
        }
    ]

    const handleNext = (e) => {
        if(e) e.preventDefault();
        if(pageNo < pages.length - 1) {
            setPageNo(pageNo + 1);
        }
    }

    const handlePrevious = (e) => {
        if(e) e.preventDefault();
        if(pageNo > 0) {
            setPageNo(pageNo - 1);
        }
    }

    const isLastPage = () => {
        let last = !(pageNo < pages.length - 1);
        return last;
    }

    useEffect(() => {
        setPage(pages[pageNo]);
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                let height = entry.target.getBoundingClientRect().height;
                calcHeights(height);
            }
        });

        if(tableContainerRef.current) {
            observer.observe(tableContainerRef.current)
        }
        return () => {
            observer.disconnect();
        }
    },[pageNo]);

    return (
        <div ref={tableContainerRef}  className='relative flex flex-row w-full h-full'>
            <div style={{top:tHeaderHeight + 'px',bottom:tHeaderHeight + 'px'}} 
                className='absolute flex -left-5 w-10'>
                <button 
                    onMouseDown={(e) => {
                        if(tableRef.current) {
                            timerId = setInterval(() => {
                                tableRef.current.scrollBy({
                                    top: 0,
                                    left: -32,
                                    behavior: "smooth",
                                });
                            },100);
                        }    
                    }} 
                    onMouseUp={(e) => {
                        timerId && clearInterval(timerId);
                    }}
                    onMouseOut={(e) => {
                        timerId && clearInterval(timerId);
                    }}
                    style={{backdropFilter:'blur(10px)',
                            boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                            transition: 'all 0.3s linear'
                        }}
                    className={`${true?'visible opacity-100':'invisible opacity-0'} flex w-10 h-10 m-auto bg-[rgb(255,255,255)] rounded-full`}
                >
                    <LiaAngleLeftSolid size={16} className='flex m-auto text-gray-600'/>
                </button>
            </div>
            <div className='flex flex-col w-full h-full px-5 overflow-hidden'>
                <div ref={tableRef}
                    style={{height: tableHeight + 'px'}} 
                    className='flex flex-col w-full text-sm  no-scrollbar overflow-x-auto overflow-y-hidden'>
                    <div ref={headerRef}
                        style={{height: tHeaderHeight + 'px',transition:'all .5s ease-in-out'}}
                        className='flex flex-row w-fit items-center shrink-0 font-jostBold text-black border-b cursor-pointer'
                        >
                        {columns.map((column,i) => 
                            <p key={i} className={column.name+' shrink-0 px-2 text-left whitespace-nowrap overflow-hidden'}>
                                {column.label}
                            </p>
                        )}
                    </div>
                    <div style={{height: tBodyHeight + 'px'}}  
                        className='flex w-fit overflow-hidden'>
                        {page && <Page page={page} columns={columns} headerRef={headerRef}/>}
                    </div>
                </div>
                <div style={{height: pagenationInfoHeight + 'px'}}
                    className='flex flex-row-reverse w-full shrink-0 items-end text-[rgb(100,100,100)]'>
                        {page && 
                        <div className='flex flex-row space-x-1 w-fit h-full items-center'>
                            <p className='font-jostBook text-xs'>
                                {(pageNo * pageSize)+1+' -- '+((pageNo * pageSize)+page.length)+' of '+totalElements}
                            </p>
                            <button 
                                disabled={!pageNo > 0}
                                onClick={(e) => handlePrevious(e)}
                                className={`flex w-10 h-10 m-auto ${pageNo > 0?'hover:bg-[rgb(235,235,235)]':'text-[rgb(170,170,160)]'} rounded-full`}
                            >
                                <LiaAngleLeftSolid size={16} className='flex m-auto'/>
                            </button>
                            <button 
                                disabled={isLastPage()}
                                onClick={(e) => handleNext(e)}
                                className={`flex w-10 h-10 m-auto ${isLastPage()?'text-[rgb(170,170,170)]':'hover:bg-[rgb(235,235,235)]'} rounded-full`}
                            >
                                <LiaAngleRightSolid size={16} className='flex m-auto'/>
                            </button>
                        </div>
                        }
                </div>
                <div style={{height:messageHeight + 'px'}} className='flex w-full shrink-0 items-center'>
                    <Message message={message}/>
                </div>
            </div>
            <div style={{top:tHeaderHeight + 'px', bottom:tHeaderHeight + 'px'}} 
                className='absolute flex -right-5 w-10'>
                <button 
                    onMouseDown={(e) => {
                        if(tableRef.current) {
                            //setDisableLScrollBtn(false);
                            timerId = setInterval(() => {
                                tableRef.current.scrollBy({
                                    top: 0,
                                    left: 32,
                                    behavior: "smooth",
                                });
                            },100);
                        }    
                    }} 
                    onMouseUp={(e) => {
                        timerId && clearInterval(timerId);
                    }}
                    onMouseOut={(e) => {
                        timerId && clearInterval(timerId);
                    }}
                    style={{backdropFilter:'blur(10px)',
                            boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                            transition: 'all 0.5s linear'
                        }}
                    className={`${false?'invisible opacity-0':'visible opacity-100'} flex w-10 h-10 m-auto bg-white rounded-full`}
                >
                    <LiaAngleRightSolid size={16} className='flex m-auto text-gray-600'/>
                </button>
            </div>
        </div>
    )
}

const Page = ({page,columns,headerRef}) => {
    const pagesRef = useRef(null);
    function getTextWidth(text,font,fontSize) { 
        let span = document.createElement("span"); 
        document.body.appendChild(span); 
        span.style.fontFamily = font; 
        span.style.fontSize = fontSize + "px"; 
        span.style.height = 'auto'; 
        span.style.width = 'auto'; 
        span.style.position = 'absolute'; 
        span.style.whiteSpace = 'no-wrap'; 
        span.innerHTML = text; 
     
        let width = Math.ceil(span.clientWidth);   
        document.body.removeChild(span); 
        return width;
    } 

    useEffect(() => {
        if(!pagesRef.current) {
            return;
        }
        if(!headerRef.current) {
            return;
        }
        let totalWidth = 0;
        for(let column of columns) {
            const columnHeader = headerRef.current.getElementsByClassName(column.name)[0];
            if(!columnHeader) {
                continue;
            }
            let width = getTextWidth(columnHeader.textContent,'Jost-700-Bold',14)+16;
            const elements = pagesRef.current.getElementsByClassName(column.name);
            for(let element of elements){
                let w = getTextWidth(element.textContent,'Jost-400-Book',14)+16;
                if(w > width){
                    width = w;
                }
            }
            if(width > 320) {
                width = 320;
            }
            let allowance = 4;
            width += allowance;
            columnHeader.style.width = width+'px';
            for(let element of elements){
                element.style.width = width+'px';
            }
            totalWidth += width;
        }
    },[page]);

    return (
        <div ref={pagesRef} className='flex flex-col w-fit h-full shrink-0 no-scrollbar overflow-y-auto'>
            {page.map((user,i) =>
                <div key={i} className='flex flex-row w-fit h-10 shrink-0 items-center font-jostBook text-[rgb(93,93,93)] cursor-pointer'>
                    {columns.map((column,i) => 
                        <div key={i} className={column.name+` start-0 px-2 text-left whitespace-nowrap overflow-hidden overflow-ellipsis ${user['status'] === 'ERROR'?'text-red-500':user['status'] === 'WARNING'?'text-yellow-500':''}`}>
                            {user[column.name] instanceof Date?user[column.name].toLocaleDateString():
                            typeof user[column.name] === 'boolean'?user[column.name]?'Yes':'No':
                            column.name === 'district'?user.district.name:
                            column.name === 'province'?user.district.province:
                            user[column.name]}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AddUsersResultsTable

