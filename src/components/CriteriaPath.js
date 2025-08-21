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
import ContentContainer from './ContentContainer';

const CriteriaPath = () => {
	const {setDialog} = useContext(GlobalContext);
	const [criteriaPathItem,setCriteriaPathItem] = useState(null);
	const [deleteAuthority,setDeleteAuthority] = useState(false);
	const [children,setChildren] = useState([]);
	const [buttons,setButtons] = useState([]);
	const [loading,setLoading] = useState(false);
	const {request} = useData();
	const {currentUserId,pathId} = useParams();
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

	const getChildren = async () => {
		if(pathId) {
			await request('GET','criteriapaths/previous',null,{previousId:pathId},true)
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

	const load = async () => {
		setLoading(true);
		await getCriteriaPathItem();
		await getChildren();
		setLoading(false);
	}

	useEffect(() => {
		load();
	},[path])

  return (
	<div className='flex flex-col w-full h-full pb-8 space-y-8 items-center overflow-hidden'>
		<ContentContainer previous={currentUserId && criteriaPathItem && criteriaPathItem.previous?`/${currentUserId}/paths/${criteriaPathItem.previous.name}`:currentUserId && path !== `/${currentUserId}/paths`?`/${currentUserId}/paths`:currentUserId?`/${currentUserId}/home`:'/home'}
            buttons={buttons} 
            Icon={PiPathFill} 
            text={criteriaPathItem?criteriaPathItem.name:''} 
            loading={loading}> 
			{criteriaPathItem && 
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
			}
        </ContentContainer>
	</div>
  )
}

export default CriteriaPath

