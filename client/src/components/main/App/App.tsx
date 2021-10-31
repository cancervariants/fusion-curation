import React, { useEffect, useState } from 'react';
import NavTabs from '../Nav/NavTabs';
import { SuggestionContext } from '../../../global/contexts/SuggestionContext';
import { FusionContext } from '../../../global/contexts/FusionContext';
import { GeneContext } from '../../../global/contexts/GeneContext';
import { DomainOptionsContext } from '../../../global/contexts/DomainOptionsContext';
import { ClientFusion } from '../../../services/ResponseModels';

import '../../../global/styles/global.scss';
import { ThemeProvider, Button } from '@material-ui/core';
import theme from '../../../global/styles/theme';
import { useColorTheme } from '../../../global/contexts/Theme/ColorThemeContext';
import './App.scss';

const demoData: ClientFusion = {
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
      'region': {
        'id': 'fusor.location_descriptor:12',
        'type': 'LocationDescriptor',
        'location_id': 'ga4gh:VSL.yV48KeMFxaYYDFEoQ3d4__vav-_qeokW',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'sequence.id:12',
          'interval': {
            'type': 'SequenceInterval',
            'start': {
              'type': 'Number',
              'value': 44908820
            },
            'end': {
              'type': 'Number',
              'value': 44908822
            }
          }
        }
      },
      'strand': '+',
      'component_id': 'c187c893-0f88-415e-b247-4adc2558bd5f',
      'component_name': 'chr12:44908820_44908822(+)',
      'hr_name': 'chr12:44908820_44908822(+)'
    }
  ],
  'regulatory_elements': [
    {
      'type': 'promoter',
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
      'status': 'preserved',
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
  'causative_event': 'rearrangement'
};

const App = (): React.ReactElement => {

  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<ClientFusion>({} as ClientFusion);
  const [globalGenes, setGlobalGenes] = useState<Object>({});
  const [domainOptions, setDomainOptions] = useState<Object>({});

  // update global genes and domain options context
  useEffect(() => {
    const remainingGeneIds: Array<string> = [];
    fusion.structural_components?.forEach(comp => {
      switch(comp.component_type) {
        case 'gene':
          remainingGeneIds.push(comp.gene_descriptor.gene_id);
          break;
        case 'transcript_segment':
          remainingGeneIds.push(comp.gene_descriptor.gene_id);
          break;
      }
    });
    fusion.regulatory_elements?.forEach(re => {
      remainingGeneIds.push(re.gene_descriptor.gene_id);
    });
    const uniqueRemainingGeneIds: Array<string> = remainingGeneIds.filter(
      (geneId, index) => remainingGeneIds.indexOf(geneId) === index
    );
    const geneContextCopy = {};
    uniqueRemainingGeneIds.forEach((geneId: string) => {
      geneContextCopy[geneId] = globalGenes[geneId];
    });
    setGlobalGenes(geneContextCopy);
    // TODO for each gene, copy domain option over
  }, [fusion]);

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
