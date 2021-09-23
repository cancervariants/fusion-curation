import { useState, useEffect, useContext } from 'react';
import {Card, CardContent, Button, TextField, Box} from '@material-ui/core';

interface Props {
  compType: string,
  index: number,
  id: string,
  handleSave: (index: number) => void;
}

export const TransCompInput: React.FC<Props> = ({ compType, handleSave, index, id}) => {

  const renderSwitch = (compType) => {
    switch(compType) {
      case 'genomic_region':
        return(
          <Card >
              <CardContent>
                <div className="card-parent">
                  <div className="input-parent">
                  <div className="top-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Chromosome"></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Strand"></TextField>                
                  </div>
                  <div className="bottom-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Start Position"></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="End Position"></TextField>      
                  </div> 
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" >Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index)}>Save</Button>
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
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Transcript"></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Gene"></TextField>                
                  </div>
                  <div className="bottom-inputs">
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Starting Exon"></TextField>                
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Ending Exon"></TextField>      
                  </div> 
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" >Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index)}>Save</Button>
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
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Sequence"></TextField>                
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" >Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index)}>Save</Button>
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
                  <TextField margin="dense" style={{ height: 38, width: 125 }} label="Gene"></TextField>                
                  </div>
                  <div className="buttons">
                  <Button style={{margin: '8px'}} variant="outlined" color="secondary" >Cancel</Button>
                  <Button style={{margin: '8px'}} variant="outlined" color="primary" onClick={() => handleSave(index)}>Save</Button>
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