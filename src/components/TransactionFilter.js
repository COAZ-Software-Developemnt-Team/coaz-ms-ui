import React, {useState,useEffect,useContext} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {sex} from '../constants';
import FormValidator from './FormValidator';
import Inputs from './Inputs';
import Scrollable from './Scrollable';
import Message from './Message';
import FormDialog from './FormDialog';
import {request} from '../App'

const TransactionFilter = ({userId,reload}) => {
    const {currentUser,setDialog,setLoading,transactionFilter,setTransactionFilter} = useContext(GlobalContext);
    const [readAuthority,setReadAuthority] = useState(false);
    const minWidth = 240;
    const [inputWidth,setInputWidth] = useState(minWidth);
    const [message,setMessage] = useState({content:'',success:false});

    const paymentTypes = ['Mobile','Card'];
    const currencies = ['ZMW','USD','GBP','EUR','ZAR']; 
    const statuses = ['SUCCESSFUL','PENDING','FAILED']; 

    const onChange = (e) => {
        if(transactionFilter && setTransactionFilter) {
            const value = e.target.value;
            if(value === '') {
                setTransactionFilter({...transactionFilter, [e.target.name]: null});
            } else {
                setTransactionFilter({...transactionFilter, [e.target.name]: value});
            }
        }
    };

    const onNumber = (e) => {
        const value = e.target.value;
        if(isNaN(value)) {
            return;
        }
        if(value === '' && value) {
          setTransactionFilter({...transactionFilter, [e.target.name]: null});
        } else {
          setTransactionFilter({...transactionFilter, [e.target.name]: value});
        }
    }

    const onDate = (e) => {
        const value = e.target.value;
        setTransactionFilter({...transactionFilter, [e.target.name]: new Date(value)});
    };

    const onSubmit = async  () => {
        if(reload) {
            setLoading(true);
            await reload(transactionFilter)
            .then((response) => {
                setDialog(null);
            })
            .catch((error) => {
                setDialog(null);
            }); 
            setLoading(false);
        }
    }

    const inputs = [
        {
            label:'User Id',
            type:'number',
            name:'userid', 
            value:userId?userId:transactionFilter && transactionFilter.userId?transactionFilter.userId:'',
            placeholder:'Enter user id...',
            disabled:userId,
            onChange:(e) => onNumber(e)
        },
        {
            label:'Payment Type',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                paymentTypes.map((option,i) => options.push(<option key={i}>{option}</option>));
                return options;
            },
            name:'paymentType', 
            value:transactionFilter && transactionFilter.paymentType?transactionFilter.paymentType:'',
            onChange:(e) => onChange(e)
        },
        {
            label:'Currency',
            type:'select',
            options:() => {
                let options = [<option value={''}>All</option>];
                currencies.map((option,i) => options.push(<option key={i}>{option}</option>));
                return options;
            },
            name:'currency', 
            value:transactionFilter && transactionFilter.currency?transactionFilter.currency:'',
            onChange:(e) => onChange(e)
        },
        {
            label:'Amount',
            type:'number', 
            name:'amount',
            value:transactionFilter && transactionFilter.amount?transactionFilter.amount:'',   
            placeholder:'Enter amount...',
            onChange:(e) => onNumber(e)
        },
        {
            label:'Account Number',
            type:'text',
            name:'lastname', 
            value:transactionFilter && transactionFilter.accountNumber?transactionFilter.accountNumber:'',
            placeholder:'Enter account number...',
            onChange:(e) => onChange(e)
        },
        {
            label:'Transaction Id',
            type:'text',
            name:'transactionId', 
            value:transactionFilter && transactionFilter.transactionId?transactionFilter.transactionId:'',
            placeholder:'Enter transaction Id...',
            onChange:(e) => onChange(e)
        },
        {
            label:'External Id',
            type:'text',
            name:'externalId',
            value:transactionFilter && transactionFilter.externalId?transactionFilter.externalId:'',   
            placeholder:'Enter external Id...',
            onChange:(e) => onChange(e)
        },
        {
            label:'From',
            type:'date',
            name:'from', 
            value:transactionFilter && transactionFilter.from?transactionFilter.from.toISOString().slice(0, 10):'',
            placeholder:'Pick start date...',
            onChange:(e) => onDate(e)
        },
        {
            label:'To',
            type:'date',
            name:'to', 
            value:transactionFilter && transactionFilter.to?transactionFilter.to.toISOString().slice(0, 10):'',
            placeholder:'Pick end date...',
            onChange:(e) => onDate(e)
        },
        {
            label:'Status',
            type:'select',
            options:() => {
                let options = [<option value=''>All</option>];
                statuses.map((option,i) => options.push(<option key={i} value={option}>{option}</option>));
                return options;
            },
            name:'status', 
            value:transactionFilter && transactionFilter.status?transactionFilter.status:'',
            placeholder:'Select status...',
            onChange:(e) => onChange(e)
        }
    ]

    useEffect(() => {
        ( async () => {
            setLoading(true);
            await request('GET','hasauthority',null,{
                contextName:'TRANSACTION',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    setReadAuthority(true);
                }
            })
            setLoading(false);
        }
        )();
    },[]);

  return (
    <FormDialog title='Transaction Filter'>
        {<FormValidator>
            <div className='flex flex-col w-full sm:w-[640px] h-fit p-8'>
                <Scrollable vertical={true}>
                    <Inputs inputs={inputs} minWidth={minWidth} paddingX={0} spaceX={32} id='filter' setCalcWidth={setInputWidth}/>
                    <Message message={message}/>
                    <button style={{'--width':inputWidth+'px'}} 
                        onClick={onSubmit} className='flex shrink-0 w-[var(--width)] h-10 mx-auto rounded-lg items-center justify-center bg-[rgb(0,175,240)] hover:bg-[rgba(0,175,240,.7)] text-white'>
                        Submit
                    </button>
                </Scrollable>
            </div>
        </FormValidator>}
    </FormDialog>
  )
}

export default TransactionFilter