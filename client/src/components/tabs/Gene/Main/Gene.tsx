import {GeneSearch} from '../GeneSearch/GeneSearch'
import {GeneResults} from '../GeneResults/GeneResults'

import './Gene.scss'

interface Props {
  index: number
}
export const Gene: React.FC<Props> = ( { index }) => {

  return (
    <div className="gene">
      <GeneSearch />
      <GeneResults/>
    </div>
  )
}