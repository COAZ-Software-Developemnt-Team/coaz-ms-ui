import React,{useState,useEffect,useContext} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useParams,useNavigate,useLocation,Outlet} from 'react-router-dom';
import { PiUser,PiUsersFour, PiUsersThree, PiMaskHappy,PiChartLine,PiGraduationCap, PiBook, PiPath, PiCalendarDots, PiMoneyWavy, PiArrowsLeftRight, PiBank, PiFolder, PiUsers, PiStudent, PiChalkboardTeacher} from "react-icons/pi";
import Menu from './Menu';
import MobileMenu from './MobileMenu';
import Login from './Login';
import LoadingIcons from 'react-loading-icons'
import {useData} from '../data';
import { useLogin } from './Login';

const ManagementSystem = () => {
    const path = useLocation().pathname;
    const [menus,setMenus] = useState([]);
    const [openMobileMenu,setOpenMobileMenu] = useState(false);
    const [loading,setLoading] = useState(false);
    const {currentUserId} = useParams();
    const {request} = useData();
    const {logout} = useLogin();
    const navigate = useNavigate();

    const onLogin = (e) => {
        e.preventDefault();
        navigate('/login')
    }

    const onLogout = (e) => {
        e.preventDefault();
        logout();
    }

    const load = async () => {
        setLoading(true);
        let user = null;
        await request('GET','current',null,null,true)
        .then(async (currentResponse) => {
            if(currentResponse.status && currentResponse.status === 'SUCCESSFUL' && currentResponse.content && currentResponse.content.user && currentResponse.content.user.status === 'ACTIVE') {
                currentResponse.content.user.dateOfBirth = currentResponse.content.user.dateOfBirth?new Date(currentResponse.content.user.dateOfBirth):new Date();
                user = currentResponse.content.user;
            } else {
                user = false;
            }
        })
        .catch((error) => {
            console.error(error);
        })
        let mnus = [];
        if(currentUserId && currentUserId == user.id) {
            mnus.push({name:'My Profile', link:`/${currentUserId}/profile`, Icon:PiUser});
            mnus.push({name:'My Transactions', link:`/${currentUserId}/my_transactions`, Icon:PiArrowsLeftRight});
            mnus.push({name:'My Files', link:`/${currentUserId}/file`, Icon:PiFolder});
            let enroll = false;
            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'ENROLL'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    enroll = true;
                    mnus.push({name:'My statistics', link:`/${currentUserId}/statistics`, Icon:PiChartLine})
                    mnus.push({name:'Enrollments', link:`/${currentUserId}/enrollments`, Icon:PiStudent})
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'COURSE',
                authority:'TEACH'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    mnus.push({name:'My CPDs', link:`/${currentUserId}/my_courses`, Icon:PiChalkboardTeacher})
                }
            })
            mnus.push({name:'My Events', link:`/${currentUserId}/my_events`, Icon:PiCalendarDots})
            let settingsMenus = []
            let createUser = false;
            let readUser = false;
            let updateUser = false;
            let deleteUser = false;
            await request('GET','hasauthority',null,{
                contextName:'USER',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createUser = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USER',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    readUser = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USER',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateUser = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USER',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteUser = true;
                }
            })
            if(createUser || readUser || updateUser || deleteUser) {
                settingsMenus.push({name:'Users', link:`/${currentUserId}/users`, Icon:PiUsers});
            }
            
            let createUserType = false;
            let readUserType = false;
            let updateUserType = false;
            let deleteUserType = false;
            await request('GET','hasauthority',null,{
                contextName:'USERTYPE',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createUserType = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USERTYPE',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    readUserType = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USERTYPE',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateUserType = true;
                }
            })
            await request('GET','hasauthority',null,{
                contextName:'USERTYPE',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteUserType = true;
                }
            })
            if(createUserType || readUserType || updateUserType || deleteUserType) {
                settingsMenus.push({name:'User types', link:`/${currentUserId}/usertypes`, Icon:PiUsersThree});
            }

            let createUserGroup = false;
            let readUserGroup = false;
            let updateUserGroup = false;
            let deleteUserGroup = false;

            await request('GET','hasauthority',null,{
                contextName:'USERGROUP',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createUserGroup = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'USERGROUP',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    readUserGroup = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'USERGROUP',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateUserGroup = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'USERGROUP',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteUserGroup = true;
                }
            })

            if(createUserGroup || readUserGroup || updateUserGroup || deleteUserGroup) {
                settingsMenus.push({name:'User groups', link:`/${currentUserId}/usergroups`, Icon:PiUsersFour});
            }

            let createRole = false;
            let readRole = false;
            let updateRole = false;
            let deleteRole = false;

            await request('GET','hasauthority',null,{
                contextName:'ROLE',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createRole = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'ROLE',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    readRole = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'ROLE',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateRole = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'ROLE',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteRole = true;
                }
            })

            if(createRole || readRole || updateRole || deleteRole) {
                settingsMenus.push({name:'Roles', link:`/${currentUserId}/roles`, Icon:PiMaskHappy});
            }
            
            let createProgram = false;
            let readProgram = false;
            let updateProgram = false;
            let deleteProgram = false;

            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createProgram = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    readProgram = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateProgram = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'PROGRAM',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteProgram = true;
                }
            })

            if(createProgram || readProgram || updateProgram || deleteProgram) {
                settingsMenus.push({name:'Programs', link:`/${currentUserId}/programs`, Icon:PiGraduationCap})
            } 

            let createEvent = false;
            let updateEvent = false;
            let deleteEvent = false;
            
            await request('GET','hasauthority',null,{
                contextName:'EVENT',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createEvent = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'EVENT',
                authority:'UPDATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    updateEvent = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'EVENT',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteEvent = true;
                }
            })
            if(createEvent || updateEvent || deleteEvent) {
                settingsMenus.push({name:'Events', link:`/${currentUserId}/events`, Icon:PiCalendarDots})
            }
            
            let createCriteriaPath = false;
            let deleteCriteriaPath = false;
            await request('GET','hasauthority',null,{
                contextName:'CRITERIA_PATH_ITEM',
                authority:'CREATE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    createCriteriaPath = true;
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'CRITERIA_PATH_ITEM',
                authority:'DELETE'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    deleteCriteriaPath = true;
                }
            })
            if(createCriteriaPath || deleteCriteriaPath) {
                settingsMenus.push({name:'Criteria Paths', link:`/${currentUserId}/paths`, Icon:PiPath})
            }

            await request('GET','hasauthority',null,{
                contextName:'ACCOUNT',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    settingsMenus.push({name:'Accounts', link:`/${currentUserId}/accounts`, Icon:PiBank});
                }
            })

            await request('GET','hasauthority',null,{
                contextName:'TRANSACTION',
                authority:'READ'
            },true)
            .then((response) => {
                if(response.status && response.status === 'YES') {
                    settingsMenus.push({name:'Transactions', link:`/${currentUserId}/transactions`, Icon:PiArrowsLeftRight})
                }
            })
            if(settingsMenus.length > 0) {
                mnus.push({name:'Settings', separator:true})
                for(let menu of settingsMenus) {
                    mnus.push(menu);
                }
            }
        } else {
            logout();
        }
    
        setMenus(mnus);
        setLoading(false)
    }

    useEffect(() => {
        load();
    },[currentUserId]);

  return (
    <div className='flex w-full h-full bg-[url(/public/images/bg_cpd.jpg)] bg-cover bg-center overflow-hidden'>
        <div className='flex flex-col sm:flex-row w-[90%] h-[90%] m-auto shadow-2xl rounded-2xl overflow-hidden'>
            {loading? 
                <div className='flex w-full h-full items-center justify-center text-[rgb(0,175,240)]'>
                    <LoadingIcons.ThreeDots width={32} height={64} fill="rgb(0,175,240)"/>
                </div>
                :
                <>
                    <Menu menus={menus} openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} onLogin={onLogin} onLogout={onLogout}/>
                    <div style={{backgroundSize:304+'px',backgroundImage:'url(/images/home_bg.jpg)'}}
                        className='flex flex-col w-full h-full bg-white overflow-hidden'>
                        <div style={{transition:'height 1s ease-in-out'}} className={`w-full ${openMobileMenu?'h-full':'h-0'} overflow-hidden`}>
                            <MobileMenu menus={menus} openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} onLogin={onLogin} onLogout={onLogout}/>
                        </div>
                        <div style={{transition:'height 1s ease-in-out'}} className={`w-full ${!openMobileMenu?'h-full':'h-0'} overflow-hidden`}>
                            <Outlet/>
                        </div>
                    </div>
                </>
                }
        </div>
    </div>
  )
}

export default ManagementSystem