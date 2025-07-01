import React, {useEffect,useState,useContext,useRef} from 'react'
import { useNavigate,useLocation,useParams,useOutletContext, Outlet } from 'react-router-dom';
import JSZip from 'jszip';
import { download } from '../App';

const HtmlResource = () => {
    const {resourceId} = useParams();
    const [iframeSrc, setIframeSrc] = useState(null);

    const getMimeType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return {
          html: 'text/html',
          js: 'application/javascript',
          css: 'text/css',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          svg: 'image/svg+xml',
        }[ext] || 'application/octet-stream';
    };

    useEffect(() => {
        download(`resource/download/${resourceId}`,null,true)
        .then(async (response) => {
            if(response instanceof Blob) {
                const zip = await JSZip.loadAsync(response)
                .then(async (zip) => {
                    const htmlFile = zip.file('index.html');
                    if (htmlFile) {
                        // Extract HTML content
                        const htmlContent = await htmlFile.async('string');

                        const blobURLs = {};

                        for (const [name, file] of Object.entries(zip.files)) {
                            if (name === htmlFile.name) continue;
                            const blob = await file.async('blob');
                            const blobURL = URL.createObjectURL(blob);
                            blobURLs[name] = blobURL;
                        }
                        for (const entry of Object.entries(blobURLs)) {
                            const type = getMimeType(entry[0]);
                            if(type === 'text/css') {
                                const response = await fetch(entry[1]);
                                const blob = await response.blob();
                                if(blob instanceof Blob) {
                                    const css = await blob.text();
                                    const updated = css.replace(/url\(\s*(['"]?)(https?:\/\/[^\s'"]+|[^\s'")]+)\1\s*\)/g, (match,bracket,url) => { 
                                        const cleanUrl = url.replace(/^.\//, '');
                                      	return blobURLs[cleanUrl] ? `url(${blobURLs[cleanUrl]})` : match;
                                    });
                                    blobURLs[entry[0]] = URL.createObjectURL(new Blob([updated], { type: type }))
                                }
                            }
                        }
                        const updatedHtml = htmlContent.replace(/(src|href)="([^"]+)"/g, (match, attr, url) => {
                            const cleanUrl = url.replace(/^.\//, '');
                            return blobURLs[cleanUrl] ? `${attr}="${blobURLs[cleanUrl]}"` : match;
                        });
                        const finalBlob = new Blob([updatedHtml], { type: 'text/html' });
                        const finalUrl = URL.createObjectURL(finalBlob);
                        setIframeSrc(finalUrl);
                    }
                });
            }
        })
    },[resourceId])

  return (
    <div className='relative w-full h-full bg-white overflow-auto'>
        {iframeSrc && (
          <iframe
            src={iframeSrc}
            title="Embedded Website"
            className='w-full h-full'
          />
      )}
    </div>
  )
}

export default HtmlResource