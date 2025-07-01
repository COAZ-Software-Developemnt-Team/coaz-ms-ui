import React, {useState,useEffect,useContext,useRef} from 'react'
import { LiaAngleLeftSolid,LiaAngleRightSolid } from "react-icons/lia";
import { GlobalContext } from '../contexts/GlobalContext';
import Scrollable from './Scrollable';
import { request } from '../App';

  const Table = ({columns,retrieveRecords,getButtons}) => {
    const {user,setLoading} = useContext(GlobalContext);
    const [records,setRecords] = useState([]);
    const [selected,setSelected] = useState(null);
    const [pageNo,setPageNo] = useState(0);
    const [pageSize,setPageSize] = useState(0);
    const [totalElements,setTotalElements] = useState(0);
    const [totalPages,setTotalPages] = useState(0);
    const [last,setLast] = useState(true);
    const [booleanOptions,setBooleanOptions] = useState(['Yes','No']);
    const [filter,setFilter] = useState({});
    const [showScrollArrows, setShowScrollArrows] = useState(false);
    const [page,setPage] = useState({
        pageNo:0,
        pageSize:10,
        sortBy:'id',
        sortDir:'asc'
    })
    const mainContainerRef = useRef(null);
    const sliderRef = useRef(null);
    const tableRef = useRef(null);
    const headerRef = useRef(null);
    const [height,setHeight] = useState(0);
    const [messageHeight,setMessageHeight] = useState(32);
    const [tHeaderHeight,setTHeaderHeight] = useState(32);
    const [pagenationInfoHeight,setPagenationInfoHeight] = useState(64);

    const onDay = (e) => {
        const value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        if(value > 31) {
            return;
        }
        setFilter({...filter, [e.target.name]: value});
        setFocused(e.target.name);
    }
    const onMonth = (e) => {
        const value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        if(value > 12) {
            return;
        }
        setFilter({...filter, [e.target.name]: value});
        setFocused(e.target.name);
    }
    const onNumber = (e) => {
        const value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        setFilter({...filter, [e.target.name]: value});
        setFocused(e.target.name);
    };
    
    const onBoolean = (e) => {
        const value = e.target.value === 'Yes'?true:e.target.value === 'No'?false:null;
        setFilter({...filter, [e.target.name]: value});
        setFocused(e.target.name);
    };

    const onChange = (e) => {
        const value = e.target.value;
        setFilter({...filter, [e.target.name]: value});
        setFocused(e.target.name);
    };
    
    const [focused,setFocused] = useState('');
    
    const handleNext = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo < totalPages - 1) {
            setPage({...page, pageNo: page.pageNo + 1});
        }
    }

    const handlePrevious = (e) => {
        if(e) e.preventDefault();
        if(page.pageNo > 0) {
            setPage({...page, pageNo: page.pageNo - 1});
        }
    }

    const buttonsRef = useRef(null);
    const [btnColumns,setBtnColumns] = useState(0);
    const [buttons,setButtons] = useState([]);
    const [btnWidth,setBtnWidth] = useState(0);
    const paddingX = 32;
    const spaceX = 8;

    const calButtonsWidth = (pw,mw,pa,sp,cols) => {
        if(cols === 0){
          return {w:0,cols:0};
        }
        let w = 0;
        let aw = pw - (pa*2) - (sp * (cols - 1));
        w = aw/cols;
        if(w < mw && cols > 1) {
            cols -= 1;
            return calButtonsWidth(pw,mw,pa,sp,cols)
        } else {
          return {w,cols};
        }
    }

    const alignButtons = (buttonColumns) => {
        if(buttonsRef.current) {
            const width = buttonsRef.current.getBoundingClientRect().width;
            let minWidth = 64;
            let {w,cols} = calButtonsWidth(width,minWidth,paddingX,spaceX,buttonColumns); 
            setBtnWidth(w);
            setBtnColumns(cols);
        }
    }

    const addButtons = async () => {
        if(getButtons) {
            await getButtons(getRecords)
            .then(response => {
                setBtnColumns(response.length);
                setButtons(response);
                alignButtons(response.length);
            })
        }
    }

    const getRecords = async  () => {
        setLoading(true);
        await retrieveRecords(filter,page)
        .then((response) => {
            setLoading(false);
            if(response.status && response.status === 'SUCCESSFUL' && response.content) {
                setRecords(response.content);
                setPageNo(response.pageNo?response.pageNo:0);
                setPageSize(response.pageSize?response.pageSize:response.content.length);
                setTotalElements(response.totalElements?response.totalElements:response.content.length);
                setTotalPages(response.totalPages?response.totalPages:0);
                setLast(response.last != null && typeof response.last !== 'undefined'?response.last:true);
            } else {
                
            }
        })
        .catch((error) => {
            console.log(error.message);
            setLoading(false);
        })
    }

    useEffect(() => {
        getRecords();
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                addButtons(user);
            }
        });

        const observer2 = new ResizeObserver(entries => {
            for (let entry of entries) {
                setHeight(entry.target.getBoundingClientRect().height);
            }
        });

        if(mainContainerRef.current) {
            observer.observe(mainContainerRef.current)
        }
        if(sliderRef.current) {
            observer2.observe(sliderRef.current)
        }
        return () => {
            observer.disconnect();
            observer2.disconnect();
        }
    },[page]);

    return (
        <div 
            className='relative flex w-full h-auto overflow-hidden'>
            <div ref={mainContainerRef} className='flex flex-col w-full h-auto'>
                <div  className='relative flex flex-row w-full h-auto'>
                    <div className='flex flex-col w-full h-auto px-5 overflow-hidden'>
                        <Scrollable horizontal={true}>
                            <div ref={tableRef}
                                className='flex flex-col w-full h-auto text-sm'>
                                <div ref={headerRef}
                                    style={{height: tHeaderHeight + 'px',transition:'all .5s ease-in-out'}}
                                    className='flex flex-row w-fit shrink-0 font-jostBold text-black border-b cursor-pointer'
                                    onClick={(e) => {
                                        let height = tHeaderHeight === 32?68:32;
                                        setTHeaderHeight(height);
                                        setFocused('');
                                    }}
                                    onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                getRecords();
                                            }
                                        }
                                    }>
                                    {columns.map((column,i) => 
                                        <div key={i} className={column.id+' flex flex-col h-full overflow-hidden'}>
                                            <p className={`flex h-8 shrink-0 ${column.type === 'number'?'justify-end':''} items-center px-2 whitespace-nowrap`}>{column.label}</p>
                                            <div onClick={(e) => e.stopPropagation()} 
                                                className='flex w-fit h-8 shrink-0'>
                                                {(column.type === 'text' || column.type === 'number') &&
                                                    <input 
                                                        type="text" 
                                                        name={column.id}
                                                        value={filter[column.id]?filter[column.id]:''}
                                                        autoFocus={focused === column.id}
                                                        placeholder="Filter..."
                                                        onChange={onChange}
                                                        onClick={e => e.stopPropagation()}
                                                        className='flex w-full h-8 shrink-0 p-2 focus:outline-none text-[rgb(93,93,93)] font-jostBook text-sm tracking-wider whitespace-nowrap bg-transparent'
                                                    />
                                                }
                                                {column.type === 'boolean' && 
                                                    <select
                                                        type="text" 
                                                        name={column.id}
                                                        value={filter[column.id] === null?'':filter[column.id]?booleanOptions[0]:booleanOptions[1]}
                                                        autoFocus={focused === column.id}
                                                        placeholder="Filter..."
                                                        onChange={onBoolean}
                                                        onClick={e => e.stopPropagation()}
                                                        className='flex h-8 shrink-0 px-1 focus:outline-none text-[rgb(93,93,93)] font-jostBook text-sm tracking-wider whitespace-nowrap bg-transparent'
                                                    > 
                                                        <option value=''>All</option>
                                                        {booleanOptions.map((option,i) => <option key={i} value={option}>{option}</option>)}
                                                    </select>
                                                }
                                                {column.type === 'select' &&
                                                    <select
                                                        type="text" 
                                                        name={column.id}
                                                        value={filter[column.id]?filter[column.id]:''}
                                                        autoFocus={focused === column.id}
                                                        placeholder="Filter..."
                                                        onChange={onChange}
                                                        onClick={e => e.stopPropagation()}
                                                        className='flex h-8 shrink-0 px-1 focus:outline-none text-[rgb(93,93,93)] font-jostBook text-sm tracking-wider whitespace-nowrap bg-transparent'
                                                    > 
                                                        <option value=''>All</option>
                                                        {column.options.map((option,i) => <option key={i} value={option}>{option}</option>)}
                                                    </select>
                                                }
                                                {column.type === 'date' &&
                                                    <div className='flex flex-row items-center justify-center w-auto h-8 px-2 shrink-0 text-[rgb(93,93,93)] font-jostBook text-sm '>
                                                        <input 
                                                            type='text'
                                                            inputMode='numeric'
                                                            maxLength={2}
                                                            name={column.id+'Day'}
                                                            value={filter[column.id+'Day'] && filter[column.id+'Day'] > 0?filter[column.id+'Day']:''}
                                                            autoFocus={focused === column.id+'Day'}
                                                            placeholder="DD"
                                                            onChange={onDay}
                                                            onClick={e => e.stopPropagation()}
                                                            className='flex w-6 h-full text-right focus:outline-none tracking-wider whitespace-nowrap bg-transparent'
                                                        />
                                                        <p className=''>/</p>
                                                        <input 
                                                            type='text'
                                                            inputMode='numeric'
                                                            maxLength={2}
                                                            name={column.id+'Month'}
                                                            value={filter[column.id+'Month'] && filter[column.id+'Month'] > 0?filter[column.id]+'Month':''}
                                                            autoFocus={focused === column.id+'Month'}
                                                            placeholder="MM"
                                                            onChange={onMonth}
                                                            onClick={e => e.stopPropagation()}
                                                            className='flex w-6 h-full text-right focus:outline-none tracking-wider whitespace-nowrap bg-transparent'
                                                        />
                                                        <p className=''>/</p>
                                                        <input 
                                                            type='text'
                                                            inputMode='numeric'
                                                            maxLength={4}
                                                            name={column.id+'Year'}
                                                            value={filter[column.id+'Year'] && filter[column.id+'Year'] > 0?filter[column.id+'Year']:''}
                                                            autoFocus={focused === column.id+'Year'}
                                                            placeholder='YYYY'
                                                            onChange={onNumber}
                                                            onClick={e => e.stopPropagation()}
                                                            className='flex w-9 h-full text-right focus:outline-none tracking-wider whitespace-nowrap bg-transparent'
                                                        /> 
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div  className='flex w-fit min-h-[200px] overflow-hidden'>
                                    {records && <Page records={records} columns={columns} tableRef={tableRef} headerRef={headerRef} 
                                    selected={selected} setSelected={setSelected} setShowScrollArrows={setShowScrollArrows}/>}
                                </div>
                            </div>
                        </Scrollable>
                        <div style={{height: pagenationInfoHeight + 'px'}}
                            className='flex flex-row-reverse w-full shrink-0 items-end text-[rgb(100,100,100)]'>
                                {page && 
                                <div className='flex flex-row space-x-1 w-fit h-full items-center'>
                                    <p className='font-jostBook text-xs'>
                                        {`${records && records.length > 0?(pageNo * pageSize)+1:0} -- ${((pageNo * pageSize)+records.length)} of ${totalElements}`}
                                    </p>
                                    <button 
                                        disabled={pageNo < 1}
                                        onClick={(e) => handlePrevious(e)}
                                        className={`flex w-10 h-10 m-auto ${pageNo < 1?'text-[rgb(170,170,170)]':'hover:bg-[rgb(235,235,235)]'} rounded-full`}
                                    >
                                        <LiaAngleLeftSolid size={16} className='flex m-auto'/>
                                    </button>
                                    <button 
                                        disabled={last}
                                        onClick={(e) => handleNext(e)}
                                        className={`flex w-10 h-10 m-auto ${last?'text-[rgb(170,170,170)]':'hover:bg-[rgb(235,235,235)]'} rounded-full`}
                                    >
                                        <LiaAngleRightSolid size={16} className='flex m-auto'/>
                                    </button>
                                </div>
                                }
                        </div>
                    </div>
                </div>
                {buttons && buttons.length > 0 &&
                    <div ref={buttonsRef} style={{padding:paddingX+'px'}} 
                        className='flex flex-col space-y-4 w-full h-auto shrink-0 items-center px-5 text-sm font-jostBook text-[rgb(93,93,93)] bg-[rgb(247,247,247)]'>
                        {
                            (() => {
                                const rows = [];
                                let rowKey = 0;
                                for (let i = 0; i < buttons.length;) {
                                    const row = [];
                                    if(btnColumns > 0) {
                                        for (let j = 0; j < btnColumns; j++) {
                                            if(i < buttons.length) {
                                                let button = buttons[i];
                                                let disabled = button.disabled(selected);
                                                row.push(
                                                    <div key={i} style={{width:btnWidth+'px'}} className='flex h-[82px] overflow-hidden'>
                                                        <button 
                                                            onClick={(e) => button.onClick(e,selected)}
                                                            disabled={disabled}
                                                            className='flex flex-col items-center space-y-1 w-full h-auto shrink-0'>
                                                            <div className={`flex w-10 h-10 items-center justify-center shrink-0 ${!disabled?'bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)]':'bg-[rgba(0,175,240,.5)]'} text-white shadow-md rounded-lg`}>
                                                                <button.Icon size={32}/>
                                                            </div>
                                                            <p className='text-sm text-center capitalize'>{button.name}</p>
                                                        </button>
                                                    </div>
                                                );
                                                i++;
                                            } else {
                                                break;
                                            }
                                        }
                                    } else {
                                        break;
                                    }
                                    rows.push(<div key={rowKey} style={{'--space-x':spaceX+'px'}} className='flex flex-row w-full space-x-[var(--space-x)] shrink-0'>{row}</div>);
                                    rowKey++;
                                }
                                return rows;
                            })()
                        }
                    </div>
                }
            </div>
        </div>
    )
}

const Page = ({records,columns,tableRef,headerRef,selected,setSelected,setShowScrollArrows}) => {
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

    let USDecimal = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        if(!pagesRef.current) {
            return;
        }
        if(!tableRef.current) {
            return;
        }
        if(!headerRef.current) {
            return;
        }
        let columnWidths = [];
        let totalWidth = 0;
        for(let column of columns) {
            const columnHeader = headerRef.current.getElementsByClassName(column.id)[0];
            if(!columnHeader) {
                continue;
            }
            const columnLabel = columnHeader.getElementsByTagName('p')[0];
            const columnFilter = columnHeader.getElementsByTagName('div')[0];
            let width = 0;
            if(columnLabel){
                width = getTextWidth(columnLabel.textContent,'Jost-700-Bold',14)+16;
            }
            if(columnFilter){
                const filterWidth = columnFilter.getBoundingClientRect().width;
                width = filterWidth > width?filterWidth:width;  
            }
            const elements = pagesRef.current.getElementsByClassName(column.id);
            for(let element of elements){
                let w = getTextWidth(element.textContent,'Jost-400-Book',14)+16;
                if(w > width){
                    width = w;
                }
            }
            columnHeader.style.width = width+'px';
            for(let element of elements){
                element.style.width = width+'px';
            }
            columnWidths.push(width);
            totalWidth += width;
        }
        const tableWidth = tableRef.current.getBoundingClientRect().width;
        if(totalWidth < tableWidth) {
            for(let i = 0; i < columns.length; i++) {
                const column = columns[i];
                const colWidth = columnWidths[i];
                if(colWidth) {
                    let width = colWidth/totalWidth * tableWidth;
                    const columnHeader = headerRef.current.getElementsByClassName(column.id)[0];
                    columnHeader.style.width = width+'px';
                    const elements = pagesRef.current.getElementsByClassName(column.id);
                    for(let element of elements){
                        element.style.width = width+'px';
                    }
                }
            }
            setShowScrollArrows(false);
        } else {
            setShowScrollArrows(true);
        }
    },[records]);

    return (
        <div ref={pagesRef} className='flex flex-col w-fit h-auto shrink-0'>
            {records.map((record,i) =>
                <div key={i} 
                    onClick={(e) => setSelected(record)}
                    className={`flex flex-row w-fit h-10 shrink-0 items-center font-jostBook ${selected && selected.id === record.id?'text-[rgb(0,175,240)]':'text-[rgb(93,93,93)]'} cursor-pointer`}>
                    {columns.map((column,i) => {
                        let value = '';
                        if(Array.isArray(column.name) ) {
                            value = record;
                            for(let attribute of column.name) {
                                if(typeof value === 'object' && !Array.isArray(value) && value !== null) {
                                    value = value[attribute];
                                } else {
                                    if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
                                        value = '';
                                    }
                                    break;
                                }
                            }
                        } else {
                            value = record[column.name]
                        }
                        return <div key={i} 
                            style={{textAlign:typeof value === 'number'?'right':'left'}}
                            className={column.id+' w-fit start-0 px-2 whitespace-nowrap'}>
                            {value instanceof Date?value.getDate()+'/'+(value.getMonth()+1)+'/'+value.getFullYear():
                            typeof value === 'boolean'?value?'Yes':'No':
                            typeof value === 'number'?USDecimal.format(value):
                            value}
                        </div>
                        }
                    )}
                </div>
            )}
            
        </div>
    )
}

export default Table

