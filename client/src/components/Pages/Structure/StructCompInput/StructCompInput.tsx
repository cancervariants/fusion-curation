import GeneCompInput from '../Input/GeneCompInput/GeneCompInput';
import LinkerCompInput from '../Input/LinkerCompInput/LinkerCompInput';
import TemplatedSequenceCompInput from
  '../Input/TemplatedSequenceCompInput/TemplatedSequenceCompInput';
import TxSegmentCompInput from '../Input/TxSegmentCompInput/TxSegmentCompInput';
import './StructCompInput.scss';

interface Props {
  compType: string,
  index: number,
  id: string,
  handleSave: (index: number, compType, ...inputs: unknown[]) => void;
  handleCancel: (id: string) => void;
}

// TODO: disappear error onChange

const StructCompInput: React.FC<Props> = (
  { compType, handleCancel, handleSave, index, id }
) => {
  const renderSwitch = (compType: string) => {
    switch (compType) {
      case 'templated_sequence':
        return (
          <TemplatedSequenceCompInput {...{index, id, handleCancel, handleSave}} />
        );
      case 'transcript_segment':
        return (
          <TxSegmentCompInput {...{index, id, handleCancel, handleSave}} />
        );
      case 'linker_sequence':
        return (
          <LinkerCompInput {...{index, id, handleCancel, handleSave}} />
        );
      case 'gene':
        return (
          <GeneCompInput {...{index, id, handleCancel, handleSave}} />
        );
    }
  };

  return (
    <>
      <div>
        {renderSwitch(compType)}
      </div>
    </>
  );
};

export default StructCompInput;