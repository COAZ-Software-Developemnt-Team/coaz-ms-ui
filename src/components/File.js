import React, {useEffect,useState,useContext,useRef} from 'react';
import { GlobalContext } from '../contexts/GlobalContext';
import { useLocation,useParams,NavLink } from 'react-router-dom';
import { PiFileDocLight, PiFileLight, PiFilePdfLight, PiFolderFill, PiFolderLight } from 'react-icons/pi';
import { request } from '../App';
import Detail from './Detail';
import ContentContainer from './ContentContainer';

const File = () => {
    const {currentUser} = useContext(GlobalContext);
    const [loading,setLoading] = useState(false);
    const [parent,setParent] = useState('');
    const location = useLocation();
    const pathname = useLocation().pathname;
    const {path} = useParams();
    const [file,setFile] = useState(null);
    const { state } = location;

    const getFile = async () => {
        if(currentUser) {
            await request('GET','file',null,{path:path?path:currentUser.id},true)
            .then((response) => {
                if(response.content) {
                    setFile(response.content);
                }  else {
                    setFile(null);
                }
            })
            .catch((error) => {
                setFile(null);
            })
        }
    }

    const load = async () => {
        setLoading(true);
        getFile();
        setParent(pathname.replace(/^(.*)\-.*$/,'$1')) // Remove last string after '-'
        setLoading(false);
    }

    useEffect(() => {
        load()
    },[path])

  return (
    <ContentContainer previous={parent && parent != pathname?parent:''} Icon={PiFolderFill} text={currentUser && file && currentUser.id == file.name?'My Files':file?file.name:''} loading={loading}>
        {file &&
            <div className='flex flex-col w-full h-fit space-y-4'>
                <div className='flex flex-col w-full h-auto space-y-2'>
                    {file.children && file.children.length > 0 && 
                        file.children.map((child,i) => <FileItem key={i} file={child}/>)
                    }
                </div>
            </div>
        }
    </ContentContainer>
  )
}

export default File

const FileItem = ({file}) => {
    const [highlighted,setHighlighted] = useState(false);

    return (
        <div className='flex flex-row w-full h-auto'>
            {file &&
            <div  onMouseEnter={(e) => setHighlighted(true)} 
                onMouseLeave={(e) => setHighlighted(false)} 
                className='flex flex-row w-full p-2 items-center justify-between space-x-4 hover:bg-[rgba(0,0,0,.04)] rounded-md'>
                {file.children && file.children.length > 0? 
                <NavLink to={`/file/${file.path}`}>
                    <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                        <FileIcon file={file} size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                        <div className='flex flex-col w-full h-fit items-start'>
                            <span className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                                {file.name}
                            </span>
                        </div>
                    </div>
                </NavLink>
                :
                <div className='flex flex-row w-fit items-center space-x-2 shrink-0'>
                    <FileIcon file={file} size={40} className='text-[rgb(0,175,240)] shrink-0'/>
                    <div className='flex flex-col w-full h-fit items-start'>
                        <span className={`text-sm text-[rgb(68,71,70)] font-helveticaNeueRegular whitespace-nowrap overflow-hidden overflow-ellipsis`}>
                            {file.name}
                        </span>
                    </div>
                </div>
                }
            </div>}
        </div>
    )
}

const FileIcon = ({filename,size}) => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1 || lastDotIndex === 0) {
            return PiFileLight;
        }

        let ext = filename.substring(lastDotIndex + 1)

        if(ext === 'pdf') {
            return <PiFilePdfLight size={size}/>
        } else if(ext === 'doc' || ext === 'docx') {
            return <PiFileDocLight size={size}/>
        } else {
            return <PiFileLight size={size}/>
        }
    }



