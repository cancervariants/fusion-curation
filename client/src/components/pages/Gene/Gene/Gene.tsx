import { useContext } from 'react';
import {GeneSearch} from '../GeneSearch/GeneSearch'
import {GeneResults} from '../GeneResults/GeneResults'

interface Props {
  index: number
}
export const Gene: React.FC<Props> = ( { index }) => {

  return (
    <div>
      <GeneSearch />
      <GeneResults/>
    </div>
  )
}