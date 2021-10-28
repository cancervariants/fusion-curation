import React, { useState } from 'react';
import NavTabs from '../Nav/NavTabs';
import { SuggestionContext } from '../../../global/contexts/SuggestionContext';
import { FusionContext } from '../../../global/contexts/FusionContext';
import { GeneContext } from '../../../global/contexts/GeneContext';
import { DomainOptionsContext } from '../../../global/contexts/DomainOptionsContext';
import '../../../global/styles/global.scss';
import { ThemeProvider, Button } from '@material-ui/core';
import theme from '../../../global/styles/theme';

import { useColorTheme } from '../../../global/contexts/Theme/ColorThemeContext';
import './App.scss';

const demoData = {
  'structural_components': [
    {
      'component_type': 'transcript_segment',
      'component_name': 'NM_152263.3 TPM3',
      'transcript': 'NM_152263.3',
      'component_id': '5ebaff7a-a109-40b6-aa00-1af5454a6b4e',
      'shorthand': 'NM_152263.3',
      'exon_start': 1,
      'exon_start_offset': 0,
      'exon_end': 8,
      'exon_end_offset': 0,
      'gene_descriptor': {
        'id': 'gene:TPM3',
        'gene_id': 'hgnc:12012',
        'type': 'GeneDescriptor',
        'label': 'TPM3'
      },
      'hr_name': 'NM_152263.3(TPM3):e[1_8]'
    },
    {
      'component_type': 'gene',
      'component_name': 'ALK hgnc:427',
      'component_id': 'e01e79ed-dfb4-4358-befa-474a00bb8417',
      'hr_name': 'ALK(hgnc:427)',
      'gene_descriptor': {
        'id': 'gene:ALK',
        'type': 'GeneDescriptor',
        'gene_id': 'hgnc:427',
        'label': 'ALK'
      }
    },
    {
      'component_type': 'linker_sequence',
      'component_name': 'ACGT',
      'component_id': '66d06a05-5638-44b6-814c-f8cdf3f1624a',
      'hr_name': 'ACGT',
      'linker_sequence': {
        'id': 'sequence:ACGT',
        'type': 'SequenceDescriptor',
        'sequence': 'ACGT'
      }
    },
    {
      'component_type': 'templated_sequence',
      'component_name': 'chr12:44908821_44908822(+)',
      'hr_name': 'chr12:44908821_44908822(+)',
      'component_id': 'fa57c20d-cda5-480a-aa4b-bf0a2a2355c1',
      'region': {
        'id': 'chr12:44908821-44908822(+)',
        'type': 'LocationDescriptor',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'ga4gh:SQ.6wlJpONE3oNb4D69ULmEXhqyDZ4vwNfl',
          'interval': {
            'type': 'SequenceLocation',
            'start': {
              'type': 'Number',
              'value': '44908821'
            },
            'end': {
              'type': 'Number',
              'value': '44908822'
            }
          }
        },
        'label': 'chr12:44908821-44908822(+)'
      },
      'strand': '+'
    }
  ],
  'regulatory_elements': [
    {
      'type': 'Promoter',
      'element_id': '6dbcce67-ea8e-4d11-b63d-38e6321c94e2',
      'gene_descriptor': {
        'id': 'gene:braf',
        'type': 'GeneDescriptor',
        'gene_id': 'hgnc:1097',
        'label': 'braf'
      }
    }
  ],
  'protein_domains': [
    {
      'status': 'Preserved',
      'name': 'Cystatin domain',
      'id': 'interpro:IPR000010',
      'domain_id': '4f8c295a-1302-41ff-9fab-17807617810a',
      'gene_descriptor': {
        'id': 'gene:CST1',
        'label': 'CST1',
        'gene_id': 'hgnc:2473'
      }
    }
  ],
  'r_frame_preserved': true,
  'causative_event': 'Rearrangement'
};

const App = (): React.ReactElement => {

  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<Object>({});
  const [globalGenes, setGlobalGenes] = useState<Object>({});
  const [domainOptions, setDomainOptions] = useState<Object>({});

  // disable superfluous react_dnd warnings
  window['__react-beautiful-dnd-disable-dev-warnings'] = true;

  const { colorTheme } = useColorTheme();

  const handleDemo = () => setFusion(demoData);

  document.title = 'VICC Fusion Curation';

  return (
    <ThemeProvider theme={theme}>
      <GeneContext.Provider value={{ globalGenes, setGlobalGenes }}>
        <DomainOptionsContext.Provider value={{ domainOptions, setDomainOptions }}>
          <SuggestionContext.Provider value={[suggestions, setSuggestions]}>
            <FusionContext.Provider value={{ fusion, setFusion }}>
              <div className='App'
                style={{
                  ...colorTheme
                } as React.CSSProperties}>
                <div className='demo-button-container'>
                  <Button
                    variant='contained'
                    color='secondary'
                    onClick={() => handleDemo()}
                  >Demo Data</Button>
                </div>
                <h1 className='title'>Fusion Curation</h1>
                <div className='main-component'>
                  <NavTabs />
                </div>
              </div>
            </FusionContext.Provider>
          </SuggestionContext.Provider>
        </DomainOptionsContext.Provider>
      </GeneContext.Provider>
    </ThemeProvider>
  );
};

export default App;
