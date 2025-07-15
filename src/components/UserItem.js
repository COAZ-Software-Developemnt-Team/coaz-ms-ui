import React, {useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import {  NavLink,useNavigate} from 'react-router-dom';
import { PiTrash,PiDotsThreeVertical} from "react-icons/pi";
import YesNoDialog from './YesNoDialog';
import { request } from '../App';

const UserItem = ({user,deleteAuthority,reload}) => {
    const {setDialog,setPopupData} = useContext(GlobalContext);
    const [highlighted,setHighlighted] = useState(false);
    const moreRef = useRef(null)

    const navigate = useNavigate();

    const onOpen = (e) => {
        e.preventDefault();
        navigate(`/users/${user.id}`)
    }

    const onDelete = (e) => {
        e.preventDefault();
        if(user) {
            setDialog({
                show:true,
                Component:() =>                       
                    <YesNoDialog 
                        title='Delete Program' 
                        message={`Are you sure you want to delete ${user.name}?`} 
                        onYes={async (e) => {
                            await request ('DELETE',`user/${user.id}`,null,null,true)
                            .then(response => {
                                reload && reload({});
                            })
                        }}
                    />
            })
        }
    }

    return (
        <div className='flex flex-row w-full h-auto'>
            {user &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                    onMouseLeave={(e) => setHighlighted(false)} 
                    className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                <NavLink to={`/users/${user.id}`} state={{parentPath:'/users'}}>
                    <div className='flex flex-row w-fit items-center space-x-2 shrink-0 cursor-pointer'>
                        <p className='flex w-10 h-10 shrink-0 rounded-full text-xl font-jostMedium items-center justify-center text-white bg-[rgb(0,175,240)]'>
                            {user.firstname.charAt(0).toUpperCase()+user.lastname.charAt(0).toUpperCase()}
                        </p>
                        <div className='flex flex-col w-full h-fit'>
                            <p className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                {user.name}
                            </p>
                            <div className='flex flex-row space-x-2'>
                                {user.userType &&
                                    <p className='text-xs text-[rgb(145,145,145)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize'>
                                        {user.userType.name}
                                    </p>
                                }
                                {user.status && <p className={`text-xs ${user.status === 'ACTIVE'?'text-green-600':user.status === 'OTP'?'text-yellow-400':'text-[rgb(145,145,145)]'} font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis capitalize`}>
                                    {user.status.toLowerCase()}
                                </p>}
                            </div>
                        </div>
                    </div>
                </NavLink>
                <div className='flex flex-row w-fit h-10 shrink-0'>
                    {highlighted && deleteAuthority && !user.reserved &&
                        <button ref={moreRef}
                            onClick={(e) => {
                                e.stopPropagation();
                                setPopupData({
                                    show:true,
                                    parentElement:moreRef.current,
                                    Component:
                                        <div className='flex flex-col w-fit h-fit text-left text-sm font-[arial] text-[rgb(68,71,70)]'>
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
                            className='flex w-10 h-10 items-center justify-center shrink-0 hover:bg-[rgba(0,0,0,.06)] rounded-full'>
                            <PiDotsThreeVertical size={20} />
                        </button>
                    }
                </div>
            </div>}
        </div>
    )
}

export default UserItem