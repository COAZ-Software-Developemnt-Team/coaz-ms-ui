import React, {useEffect,useState,useContext,useRef} from 'react'
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams, useOutletContext } from 'react-router-dom';
import { PiPath, PiPathFill } from 'react-icons/pi';
import Scrollable from './Scrollable';
import MsHeader from './Header';
import {useData} from '../data';
import AddCriteriaPathItem from './AddCriteriaPathItem';
import CriteriaPathItem from './CriteriaPathItem';
import Detail from './Detail';

const CriteriaPath = () => {
	const {setDialog} = useContext(GlobalContext);
	const [criteriaPathItem,setCriteriaPathItem] = useState(null);
	const [deleteAuthority,setDeleteAuthority] = useState(false);
	const [children,setChildren] = useState([]);
	const [buttons,setButtons] = useState([]);
	const {request} = useData();
	const {pathId} = useParams();
	const {parentPath} = useOutletContext();
	const path = useLocation().pathname;

	const onAddChild = (e) => {
		e.preventDefault();
		setDialog({
			show:true,
			Component:() => <AddCriteriaPathItem previouId={pathId} reload={getChildren}/>
		})
	}

	const getCriteriaPathItem = async () => {
		let createAuth = false;
		await request('GET','hasauthority',null,{
			contextName:'CRITERIA_PATH_ITEM',
			authority:'CREATE'
		},true)
		.then((response) => {
			if(response.status === 'YES') {
				createAuth = true;
			}
		})

		await request('GET','hasauthority',null,{
			contextName:'CRITERIA_PATH_ITEM',
			authority:'DELETE'
		},true)
		.then((response) => {
			if(response.status === 'YES') {
				setDeleteAuthority(true)
			}
		})

		if(pathId) {
			await request('GET',`criteriapath/${pathId}`,null,null,true)
			.then((response) => {
				if(response.content) {
					setCriteriaPathItem(response.content);
					let btns = [];
					if(createAuth) {
						btns.push(
							{
								Icon:PiPath,
								name:'Add Child',
								handler:onAddChild
							}
						);
					}

					setButtons(btns);
				}  else {
					setCriteriaPathItem(null);
				}
			})
			.catch((error) => {
				setCriteriaPathItem(null);
			})
		}
	}

	const getChildren = () => {
		if(pathId) {
			request('GET','criteriapaths/previous',null,{previousId:pathId},true)
			.then((response) => {
				if(response.status && response.status === 'SUCCESSFUL' && response.content) {
					setChildren(response.content);
				} else {
					setChildren([]);
				}
			})
			.catch((error) => {
				setChildren([]);
			})
		}
	}

	useEffect(() => {
		getCriteriaPathItem();
		getChildren();
	},[path])

  return (
	<div className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
		{criteriaPathItem &&
			<>
			<MsHeader previous={criteriaPathItem.previous?`${parentPath}/${criteriaPathItem.previous.id}`:parentPath} buttons={buttons} Icon={PiPathFill} text={criteriaPathItem.name} subText={criteriaPathItem.id}/>
			<div className='relative w-[95%] h-full bg-[rgb(255,255,255)] rounded-2xl border border-[rgba(0,175,240,.2)] overflow-hidden p-4'>
				<Scrollable vertical={true}>
					<div className='flex flex-col w-full h-auto space-y-4'>
						<div className='flex flex-col w-full h-auto space-y-2'>
							<p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Details</p>
							<Detail label='Name' value={criteriaPathItem.name?criteriaPathItem.name:''}/>
							<Detail label='Type' value={criteriaPathItem.type?criteriaPathItem.type:''}/>
							<Detail label='Class Name' value={criteriaPathItem.className?criteriaPathItem.className:''}/>
							{criteriaPathItem.getMethod && 
								<Detail label='method' value={criteriaPathItem.getMethod}/>
							}
							{criteriaPathItem.previous && 
								<Detail label='Previous' value={criteriaPathItem.previous.name}/>
							}
						</div>
                        {children && children.length > 0 &&
                        <div className='flex flex-col w-full h-auto space-y-2'>
                            <p className='w-full h-6 text-xs font-helveticaNeueRegular tracking-wider text-[rgba(0,175,240,.5)] uppercase'>Children</p>
                            {children.map((child,i) => <CriteriaPathItem key={i} criteriaPathItem={child} deleteAuthority={deleteAuthority} reload={getChildren}/>)}
                        </div>
                        }
                    </div>
				</Scrollable>
			</div>
			</>
		}
	</div>
  )
}

export default CriteriaPath

