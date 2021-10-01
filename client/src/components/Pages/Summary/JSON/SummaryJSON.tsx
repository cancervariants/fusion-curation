import './SummaryJSON.scss'
import { useState } from 'react';

interface Props {
  // TODO: get types from model
  fusion: any
}


export const SummaryJSON: React.FC<Props> = ( { fusion }) => {

  const [isDown, setIsDown] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  let formattedJSON = JSON.stringify(fusion, null, 2)

  const copy = require('clipboard-copy');

  const handleCopy = () => {
    copy(formattedJSON)
    setIsDown(false)
    setIsCopied(true)
  }

  const handleMouseDown = () => {
    setIsDown(true)
  }
  return (
    <>
    <div className="headline">
        <span className="copy-message">{isCopied ? 'Copied to Clipboard!' : 'Click to Copy'}</span>
        </div>
      <pre className={`${isDown ? 'clicking' : ''} summary-json-container`} onClick={handleCopy} onMouseDown={handleMouseDown}>
        
        
        <div>
        {formattedJSON}
        </div>
       
       
      </pre>
    </>
        
      
     
  )
}
