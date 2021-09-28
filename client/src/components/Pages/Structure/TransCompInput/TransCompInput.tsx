import {useRef} from 'react';
import {Card, CardContent, Button, TextField} from '@material-ui/core';

import './TransCompInput.scss';

interface Props {
  compType: string,
  index: number,
  id: string,
  handleSave: (index: number, compType, ...inputs: unknown[]) => void;
  handleCancel: (id: string) => void;
}






export const TransCompInput: React.FC<Props> = ({ compType, handleCancel, handleSave, index, id}) => {

  //Genomic Region
  const strandInput = useRef('');
  const chromosomeInput = useRef('');
  const startPositionInput = useRef('');
  const endPositionInput = useRef('');

  // Transcript Segment
  const transcriptInput = useRef('');
  const transcriptGeneInput = useRef('');
  const startingExonInput = useRef('');
  const endingExonInput = useRef('');

  // Linker Sequence
  const sequenceInput = useRef('');

  // Gene
  const geneInput = useRef('');

  const renderSwitch = (compType) => {
    switch(compType) {
      case 'genomic_region':
        return(
          <Card >
              <CardContent>
                <div className="card-parent">
                  <div className="input-parent">
                  <div className="top-inputs">
                  <TextField 
                    margin="dense" 
                    style={{ height: 38, width: 125 }} 
                    inputRef={chromosomeInput}
                    label="Chromosome"></TextField>                
                  <TextField 
                    margin="dense" 
                    style={{ height: 38, width: 125 }} 
                    label="Strand"
                    inputRef={strandInput}
                    ></TextField>                
                  </div>
                  <div className="bottom-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Start Position" inputRef={startPositionInput}></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="End Position" inputRef={endPositionInput}></TextField>      
                  </div> 
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" onClick={() => handleCancel(id)}>Cancel</Button>
                  <Button 
                    style={{margin: '8px'}} 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => handleSave(index, compType, chromosomeInput, strandInput, startPositionInput, endPositionInput)}
                  >
                    Save
                  </Button>
                  </div>
                </div>                
              </CardContent>
            </Card> 
        )
      case 'transcript_segment':
        return(
          <Card >
              <CardContent>
                <div className="card-parent">
                  <div className="input-parent">
                  <div className="top-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Transcript" inputRef={transcriptInput}></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Gene" inputRef={transcriptGeneInput}></TextField>                
                  </div>
                  <div className="bottom-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Starting Exon" inputRef={startingExonInput}></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Ending Exon" inputRef={endingExonInput}></TextField>      
                  </div> 
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" onClick={() => handleCancel(id)}>Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" 
                    onClick={() => handleSave(index, compType, transcriptInput, transcriptGeneInput, startingExonInput, endingExonInput)}
                  >Save</Button>
                  </div>
                </div>                
              </CardContent>
            </Card> 
        )
      case 'linker_sequence':
        return(
          <Card >
              <CardContent>
                <div className="card-parent">
                  <div className="input-parent">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Sequence" inputRef={sequenceInput}></TextField>                
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" onClick={() => handleCancel(id)}>Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index, compType, sequenceInput)}>Save</Button>
                  </div>
                </div>                
              </CardContent>
            </Card> 
        )
      case 'gene':
        return(
          <Card >
              <CardContent>
                <div className="card-parent">
                  <div className="input-parent">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Gene" inputRef={geneInput}></TextField>                
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" onClick={() => handleCancel(id)}>Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index, compType, geneInput)}>Save</Button>
                  </div>
                </div>                
              </CardContent>
            </Card> 
        )
    }
  }

  return(
    <>
     <div>
       {renderSwitch(compType)}
     </div>
    </>
  )
}