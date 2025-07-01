import React, {useState,useEffect,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import FormDialog from './FormDialog';
import Inputs from './Inputs';
import Message from './Message';
import FormValidator from './FormValidator';
import Scrollable from './Scrollable';
import { request } from '../App';

const AddContextRole = ({objectId,reload}) => {
    const {setLoading,setDialog} = useContext(GlobalContext);
    const [contexts,setContexts] = useState([]);
    const [roles,setRoles] = useState([]);
    const [contextId,setContextId] = useState(null);
    const [roleId,setRoleId] = useState(null);
    const [object,setObject] = useState(null);
    const [message,setMessage] = useState({content:'',success:false}); 
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);

    const handleSubmit = async (e) => {
        setMessage({content:'',success:false});
        setLoading(true);
        if(object && contextId) {
            await request('POST','objectcontextrole',null,{
                objectId:object.id,
                contextId:contextId,
                roleId:roleId
            },true)
            .then((response) => {
                setLoading(false);
                if(response.status) {
                    if(response.status === 'SUCCESSFUL' && response.message) {
                        reload && reload();
                        setDialog(null);
                    } else {
                        setMessage({content:response.message,success:false});
                    }
                } else  {
                    setMessage({content:response,success:false});
                }
            })
            .catch((error) => {
                setMessage({content:error.message,success:false});
                setLoading(false);
            })
        }
    }

    const inputs = [
      {
          label:'Object',
          type:'text', 
          name:'object',
          disabled:true,
          value:object && object.name?object.name:'',   
          placeholder:'Enter name...'
      },
      {
          label:'Context',
          type:'select',
          options:() => {
              let options = [];
              contexts && contexts.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
              return options;
          },
          name:'context', 
          disabled: !(contexts && contexts.length > 0),
          value: contextId,
          placeholder:'Context...',
          onChange: (e) => {
            setContextId(e.target.value);
          }
      },
      {
          label:'Role',
          type:'select',
          options:() => {
              let options = [];
              roles && roles.map((option,i) => options.push(<option key={i} value={option.id}>{option.name}</option>));
              return options;
          },
          name:'role', 
          disabled: !(roles && roles.length > 0),
          value: roleId,
          placeholder:'Role...',
          onChange: (e) => {
            setRoleId(e.target.value);
          }
      }
  ]

  useEffect(() => {
      ( async () => {
          setLoading(true);
          await request('GET',`auditable/${objectId}`,null,null,true)
          .then((response) => {
              if(response.content) {
                setObject(response.content);
              }
          })

          await request('GET','contexts',null,null,true)
          .then((response) => {
              if(response.content) {
                  setContexts(response.content);
                  setContextId(response.content[0].id);
              }  else {
                setContexts([]);
              }
          })
          .catch((error) => {
              setLoading(false);
              setRoles([]);
          })
          await request('GET','roles',null,null,true)
          .then((response) => {
              setLoading(false);
              if(response.content) {
                  setRoles(response.content);
                  setRoleId(response.content[0].id);
              }  else {
                  setRoles([]);
              }
          })
          .catch((error) => {
              setLoading(false);
              setRoles([]);
          })
      }
      )();
  },[objectId]);

  return (
    <FormDialog title='Add Context Role'>
        <FormValidator>
            <div className='flex flex-col w-full sm:w-[640px] h-auto p-8'>
                <Scrollable vertical={true}>
                    <div className='flex flex-col w-full h-auto shrink-0'>
                        <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='add_role' setCalcWidth={setInputWidth}/>
                        <Message message={message}/>
                        <button style={{'--width':inputWidth+'px'}} 
                            onClick={handleSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                            Submit
                        </button>
                    </div>
                </Scrollable>
            </div>
        </FormValidator>
    </FormDialog>
  )
}

export default AddContextRole