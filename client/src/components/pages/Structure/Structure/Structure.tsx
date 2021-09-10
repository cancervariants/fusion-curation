import { useContext } from 'react';
import { ResponsesContext } from '../../../../contexts/ResponsesContext';
import {GeneSearch} from '../../Gene/GeneSearch/GeneSearch';
import StructureForm from '../StructureForm/StructureForm';

interface Props {
  index: number
}

export const Structure: React.FC<Props> = ( { index }) => {

  return (
    <div>
      <StructureForm />
      

    </div>
  )

}