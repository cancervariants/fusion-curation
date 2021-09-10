import React from 'react';
import { StructureInput } from '../StructureInput/StructureInput';

const StructureForm: React.FC = () => {

  return (
    <>
    <StructureInput title="Transcript Region" inputs={['Transcript', 'Starting Exon', 'Ending Exon', 'Gene']}/>
    <StructureInput title="Genomic Region" inputs={['Chromosome', 'Strand', 'Start Position', 'End Position']}/>
    <StructureInput title="Linker" inputs={['Sequence']}/>
    <StructureInput title="Gene" inputs={['Gene']}/>
    </>
  )
}

export default StructureForm;