import React, {useEffect,useState,useRef} from 'react'
import Input from './Input';
import Select from './Select';
import Checkbox from './Checkbox';
import Time from './Time';
import TextArea from './TextArea';
import FileInput from './FileInput';

const Inputs = ({inputs,minWidth,paddingX,spaceX,id,setCalcWidth}) => {
    const inputsRef = useRef(null);
    const [columns,setColumns] = useState(inputs?inputs.length:0);
    const [inputWidth,setInputWidth] = useState(0);

    const calWidth = (pw,mw,pa,sp,cols) => {
        if(cols === 0){
          return {w:0,cols:0};
        }
        let w = 0;
        let aw = pw - (pa*2) - (sp * (cols - 1));
        w = aw/cols;
        if(w < mw && cols > 1) {
            cols -= 1;
            return calWidth(pw,mw,pa,sp,cols)
        } else {
          return {w,cols};
        }
    }

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if(inputs.length === 1) {
                    setInputWidth(minWidth);
                    setCalcWidth && setCalcWidth(minWidth);
                    setColumns(1);
                } else {
                    const width = entry.target.getBoundingClientRect().width;
                    let {w,cols} = calWidth(width,minWidth,paddingX,spaceX,columns); 
                    setInputWidth(w);
                    setCalcWidth && setCalcWidth(w);
                    setColumns(cols);
                }
            }
        });

        if(inputsRef.current) {
            observer.observe(inputsRef.current)
        }
        return () => {
            observer.disconnect();
        }
    },[]);
  return (
    <div ref={inputsRef}
        id={id}
        style={{padding:paddingX+'px'}}
        className='flex flex-col w-full h-auto space-y-4 shrink-0'>
        {inputs && (
            (() => {
                const rows = [];
                let rowKey = 0;
                for (let i = 0; i < inputs.length;) {
                    const row = [];
                    if(columns && columns > 0) {
                        for (let j = 0; j < columns; j++) {
                            if(i < inputs.length) {
                                if(inputs[i].type == 'select') {
                                    row.push(
                                        <Select 
                                            key={j+'-'+i} 
                                            label={inputs[i].label} 
                                            id={id+'_'+i} 
                                            name={inputs[i].name}  
                                            value={inputs[i].value}
                                            disabled={inputs[i].disabled}
                                            placeholder={inputs[i].placeholder}
                                            onChange={inputs[i].onChange}
                                            register={inputs[i].register}
                                            errors={inputs[i].errors}
                                            width={inputWidth}
                                        >
                                            {inputs[i].options()}
                                        </Select>
                                    );
                                } else if(inputs[i].type == 'checkbox') {
                                    row.push(
                                        <Checkbox 
                                            key={j+'-'+i}
                                            name={inputs[i].label}
                                            width={inputWidth} 
                                            checked={inputs[i].value} 
                                            disabled={inputs[i].disabled}
                                            onClick={inputs[i].onChange}
                                        />
                                    );
                                } else if(inputs[i].type == 'time') {
                                    row.push(
                                        <Time 
                                            key={j+'-'+i} 
                                            label={inputs[i].label}
                                            id={id+'_'+i}   
                                            value={inputs[i].value}
                                            disabled={inputs[i].disabled}
                                            onChange={inputs[i].onChange}
                                            register={inputs[i].register}
                                            errors={inputs[i].errors}
                                            width={inputWidth}
                                        />
                                    );
                                } else if(inputs[i].type == 'textarea') {
                                    row.push(
                                        <TextArea
                                            key={j+'-'+i} 
                                            label={inputs[i].label}
                                            id={id+'_'+i}  
                                            name={inputs[i].name}  
                                            value={inputs[i].value}
                                            disabled={inputs[i].disabled}
                                            placeholder={inputs[i].placeholder}
                                            onChange={inputs[i].onChange}
                                            width={inputWidth}
                                        />
                                    );
                                } else if(inputs[i].type == 'file') {
                                    row.push(
                                        <FileInput
                                            key={j+'-'+i} 
                                            label={inputs[i].label}
                                            id={id+'_'+i}  
                                            name={inputs[i].name}  
                                            accept={inputs[i].accept}
                                            disabled={inputs[i].disabled}
                                            placeholder={inputs[i].placeholder}
                                            onChange={inputs[i].onChange}
                                            register={inputs[i].register}
                                            errors={inputs[i].errors}
                                            width={inputWidth}
                                        />
                                    );
                                } else if(inputs[i].type == 'blank') {
                                    row.push(<div key={i} style={{width:inputWidth+'px'}}></div>);
                                } else {
                                    row.push(
                                        <Input 
                                            key={j+'-'+i} 
                                            label={inputs[i].label}
                                            type={inputs[i].type} 
                                            id={id+'_'+i}  
                                            name={inputs[i].name}  
                                            value={inputs[i].value}
                                            disabled={inputs[i].disabled}
                                            placeholder={inputs[i].placeholder}
                                            onChange={inputs[i].onChange}
                                            register={inputs[i].register}
                                            errors={inputs[i].errors}
                                            width={inputWidth}
                                        />
                                    );
                                }
                                i++;
                            } else {
                                break;
                            }
                        }
                        rows.push(<div key={rowKey} style={{'--space-x':spaceX+'px'}} className={`flex flex-row w-full ${columns < 2?'justify-center':''} items-end space-x-[var(--space-x)] shrink-0`}>{row}</div>);
                        rowKey++;
                    } else {
                        break;
                    }
                }
                return rows;
            })()
        )}
    </div>
  )
}

export default Inputs