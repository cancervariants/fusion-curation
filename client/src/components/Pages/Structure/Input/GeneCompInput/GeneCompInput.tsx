import { useEffect, useState } from 'react';
import { ClientGeneComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../../services/main';
import {
  AccordionDetails, Accordion, AccordionSummary, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { red, green } from '@material-ui/core/colors';

interface GeneComponentInputProps extends StructuralComponentInputProps {
  component: ClientGeneComponent;
}

const GeneCompInput: React.FC<GeneComponentInputProps> = (
  { component, index, handleSave, handleDelete }
) => {
  const [gene, setGene] = useState<string>(component.gene_descriptor?.label || '');
  const [geneText, setGeneText] = useState<string>('');
  const [geneError, setGeneError] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(!gene || geneError);

  useEffect(() => {
    if (gene && (!geneText) && (!geneError)) {
      buildGeneComponent();
    }
  }, [gene, geneText, geneError]);

  const buildGeneComponent = () => {
    getGeneComponent(gene)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneText('Gene not found');
          setGeneError(true);
          return;
        } else {
          const descr = geneComponentResponse.component.gene_descriptor;
          const nomenclature = `${descr.label}(${descr.gene_id})`;
          const clientGeneComponent: ClientGeneComponent = {
            ...geneComponentResponse.component,
            component_id: component.component_id,
            component_name: nomenclature,
            hr_name: nomenclature
          };
          handleSave(index, clientGeneComponent);
        }
      });
  };

  return (
    <Accordion
      defaultExpanded={!gene || geneError}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {
            component.hr_name ?
              component.hr_name :
              '<incomplete>'
          }
        </Typography>
        {
          (gene) && (!geneError) && (!geneText) ?
            <DoneIcon className='input-correct' style={{ color: green[500] }} /> :
            <ClearIcon className='input-incorrect' style={{ color: red[500] }} />
        }
        <DeleteIcon
          onClick={(event) => {
            event.stopPropagation();
            handleDelete(component.component_id);
          }
          }
          onFocus={(event) => event.stopPropagation()}
        />
      </AccordionSummary>
      <AccordionDetails>
        <div className="card-parent">
          <div className="input-parent">
            <GeneAutocomplete
              selectedGene={gene}
              setSelectedGene={setGene}
              geneText={geneText}
              setGeneText={setGeneText}
              geneError={geneError}
              setGeneError={setGeneError}
              onKeyDown={(e) => {
                if ((e.key === 'Enter') && gene && !geneError) {
                  setExpanded(false);
                }
              }}
              style={{ width: 125 }}
            />
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default GeneCompInput;