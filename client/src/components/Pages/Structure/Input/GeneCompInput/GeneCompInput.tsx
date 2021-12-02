import { useEffect, useState } from 'react';
import { ClientGeneComponent } from '../../../../../services/ResponseModels';
import { StructuralComponentInputProps } from '../StructCompInputProps';
import { GeneAutocomplete } from '../../../../main/shared/GeneAutocomplete/GeneAutocomplete';
import { getGeneComponent } from '../../../../../services/main';
import {
  AccordionDetails, Accordion, AccordionSummary, Typography, Tooltip
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
  const [expanded, setExpanded] = useState<boolean>(!gene || (geneText !== ''));

  useEffect(() => {
    if (gene && (!geneText)) buildGeneComponent();
  }, [gene, geneText]);

  const buildGeneComponent = () => {
    getGeneComponent(gene)
      .then(geneComponentResponse => {
        if (geneComponentResponse.warnings?.length > 0) {
          setGeneText('Gene not found');
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
      defaultExpanded={!gene || (geneText !== '')}
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
          (gene) && (!geneText) ?
            <Tooltip title="Validation successful">
              <DoneIcon className='input-correct' style={{ color: green[500] }} />
            </Tooltip> :
            <Tooltip title="Invalid component">
              <ClearIcon className='input-incorrect' style={{ color: red[500] }} />
            </Tooltip>
        }
        <Tooltip title="Delete component">
          <DeleteIcon
            onClick={(event) => {
              event.stopPropagation();
              handleDelete(component.component_id);
            }}
            onFocus={(event) => event.stopPropagation()}
          />
        </Tooltip>
      </AccordionSummary>
      <AccordionDetails>
        <div className="card-parent">
          <div className="input-parent">
            <GeneAutocomplete
              selectedGene={gene}
              setSelectedGene={setGene}
              geneText={geneText}
              setGeneText={setGeneText}
              onKeyDown={(e) => {
                if ((e.key === 'Enter') && gene && !geneText) {
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