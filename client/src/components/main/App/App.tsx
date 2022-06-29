import { Menu, MenuItem, ThemeProvider } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import UtilitiesNavTabs from '../../../components/Utilities/UtilitiesNavTabs/UtilitiesNavTabs';
import { DomainOptionsContext } from '../../../global/contexts/DomainOptionsContext';
import { FusionContext } from '../../../global/contexts/FusionContext';
import { GeneContext } from '../../../global/contexts/GeneContext';
import { SuggestionContext } from '../../../global/contexts/SuggestionContext';
import { useColorTheme } from '../../../global/contexts/Theme/ColorThemeContext';
import '../../../global/styles/global.scss';
import theme from '../../../global/styles/theme';
import { getAssociatedDomains } from '../../../services/main';
import NavTabs from '../Nav/NavTabs';
import About from '../About/About';
import ButtonTop from '../shared/Buttons/ButtonTop';
import './App.scss';


const demoData: ClientFusion = {
  'structural_components': [
    {
      'component_type': 'transcript_segment',
      'transcript': 'refseq:NM_152263.3',
      'exon_start': 1,
      'exon_start_offset': 0, 'exon_end': 8,
      'exon_end_offset': 0,
      'gene_descriptor': {
        'id': 'normalize.gene:TPM3',
        'type': 'GeneDescriptor',
        'label': 'TPM3',
        'gene_id': 'hgnc:12012'
      },
      'component_genomic_start': {
        'id': 'fusor.location_descriptor:NC_000001.11',
        'type': 'LocationDescriptor',
        'label': 'NC_000001.11',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'refseq:NC_000001.11',
          'interval': {
            'type': 'SequenceInterval',
            'start': {
              'type': 'Number',
              'value': 154192135
            },
            'end': {
              'type': 'Number',
              'value': 154192136
            }
          }
        }
      },
      'component_genomic_end': {
        'id': 'fusor.location_descriptor:NC_000001.11',
        'type': 'LocationDescriptor',
        'label': 'NC_000001.11',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'refseq:NC_000001.11',
          'interval': {
            'type': 'SequenceInterval',
            'start': {
              'type': 'Number',
              'value': 154170398
            },
            'end': {
              'type': 'Number',
              'value': 154170399
            }
          }
        }
      },
      'component_id': '63b1ae27-dae7-4e71-ab3f-b43469e9bb94',
      'component_name': 'refseq:NM_152263.3 TPM3',
      'hr_name': 'refseq:NM_152263.3(TPM3):e[1_8]',
      'shorthand': 'refseq:NM_152263.3'
    },
    {
      'component_type': 'gene',
      'gene_descriptor': {
        'id': 'normalize.gene:ALK',
        'type': 'GeneDescriptor',
        'label': 'ALK',
        'gene_id': 'hgnc:427'
      },
      'component_id': 'f12bc366-e682-414d-866d-6b98ce419967',
      'component_name': 'ALK(hgnc:427)',
      'hr_name': 'ALK(hgnc:427)'
    },
    {
      'component_type': 'linker_sequence',
      'linker_sequence': {
        'id': 'fusor.sequence:ACGT',
        'type': 'SequenceDescriptor',
        'sequence': 'ACGT',
        'residue_type': 'SO:0000348'
      }, 'component_id': '22544b5b-8118-46b1-8976-b6ef291c41bd',
      'component_name': 'ACGT',
      'hr_name': 'ACGT'
    },
    {
      'component_type': 'templated_sequence',
      'region': {
        'id': 'fusor.location_descriptor:12',
        'type': 'LocationDescriptor',
        'location_id': 'ga4gh:VSL.WtBQFD0pXUlW0MrRALT0a_cd8PzYUXEL',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'sequence.id:12',
          'interval': {
            'type': 'SequenceInterval',
            'start': {
              'type': 'Number',
              'value': 44908819
            },
            'end': {
              'type': 'Number',
              'value': 44908822
            }
          }
        }
      },
      'strand': '+',
      'component_id': '23ad326d-f450-43bc-9d06-74113fc9cb66',
      'component_name': 'chr12:44908819_44908822(+)',
      'hr_name': 'chr12:44908819_44908822(+)'
    }
  ],
  'regulatory_elements': [
    {
      'type': 'enhancer',
      'element_id': '62c81bd0-b013-444e-8de3-12d29d860072',
      'gene_descriptor': {
        'id': 'gene:BRAF',
        'type': 'GeneDescriptor',
        'gene_id': 'hgnc:1097',
        'label': 'BRAF'
      }
    }
  ],
  'functional_domains': [
    {
      'id': 'interpro:IPR003116',
      'name': 'Raf-like Ras-binding',
      'status': 'lost',
      'gene_descriptor': {
        'id': 'normalize.gene:hgnc%3A1097',
        'type': 'GeneDescriptor',
        'label': 'BRAF',
        'gene_id': 'hgnc:1097'
      },
      'location_descriptor': {
        'id': 'fusor.location_descriptor:NP_004324.2',
        'type': 'LocationDescriptor',
        'location': {
          'type': 'SequenceLocation',
          'sequence_id': 'refseq:NP_004324.2',
          'interval': {
            'type': 'SequenceInterval',
            'start': {
              'type': 'Number',
              'value': 157
            },
            'end': {
              'type': 'Number',
              'value': 225
            }
          }
        }
      },
      'domain_id': '23ad326d-f450-43aa-9d06-74113fc9cb66'
    }
  ],
  'r_frame_preserved': true,
  'causative_event': 'rearrangement'
};

const defaultFusion: ClientFusion = {
  structural_components: [],
  functional_domains: [],
  regulatory_elements: [],
};

const App = (): React.ReactElement => {

  const [suggestions, setSuggestions] = useState<unknown>([]);
  const [fusion, setFusion] = useState<ClientFusion>(defaultFusion);
  const [globalGenes, setGlobalGenes] = useState<Object>({});
  const [domainOptions, setDomainOptions] = useState<Object>({});
  const [showMain, setShowMain] = useState<boolean>(true);
  const [showServiceInfo, setShowServiceInfo] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // update global genes and domain options context
  useEffect(() => {
    const newGenes = {};
    const remainingGeneIds: Array<string> = [];
    fusion.structural_components?.filter(comp => comp).forEach(comp => {
      switch (comp.component_type) {
        case 'gene':
        case 'transcript_segment':
          remainingGeneIds.push(comp.gene_descriptor.gene_id);
          if (!(comp.gene_descriptor.gene_id in globalGenes)) {
            newGenes[comp.gene_descriptor.gene_id] = comp.gene_descriptor;
          }
          break;
      }
    });
    fusion.regulatory_elements?.forEach(re => {
      remainingGeneIds.push(re.gene_descriptor.gene_id);
      if (!(re.gene_descriptor.gene_id in globalGenes)) {
        newGenes[re.gene_descriptor.gene_id] = re.gene_descriptor;
      }
    });
    const uniqueRemainingGeneIds: Array<string> = remainingGeneIds.filter(
      (geneId, index) => remainingGeneIds.indexOf(geneId) === index
    );
    const geneContextCopy = {};
    uniqueRemainingGeneIds.forEach((geneId: string) => {
      if (geneId in globalGenes) {
        geneContextCopy[geneId] = globalGenes[geneId];
      } else {
        geneContextCopy[geneId] = newGenes[geneId];
      }
    });
    setGlobalGenes(geneContextCopy);
  }, [fusion]);

  // update domain options based on available genes
  useEffect(() => {
    const updatedDomainOptions = {};
    Object.keys(globalGenes).forEach((geneId: string) => {
      if (geneId) {
        if (geneId in domainOptions) {
          updatedDomainOptions[geneId] = domainOptions[geneId];
        } else {
          getAssociatedDomains(geneId).then(response => {
            updatedDomainOptions[geneId] = response.suggestions || [];
          });
        }
      }
    });
    setDomainOptions(updatedDomainOptions);
  }, [globalGenes]);

  // disable superfluous react_dnd warnings
  window['__react-beautiful-dnd-disable-dev-warnings'] = true;

  const { colorTheme } = useColorTheme();

  const handleClear = () => {
    setAnchorEl(null);
    setFusion(defaultFusion as ClientFusion);
    setGlobalGenes({});
    setDomainOptions({});
  };

  const handleDemo = () => {
    setAnchorEl(null);
    setFusion(demoData);
  };

  const handleShowMainClick = () => {
    setAnchorEl(null);
    setShowMain(!showMain);
  };

  const handleServiceInfo = () => {
    setAnchorEl(null);
    setShowServiceInfo(true);
  };

  document.title = 'VICC Fusion Curation';

  return (
    <ThemeProvider theme={theme}>
      <div
        className={showMain ? 'app-main' : 'app-utils'}
        style={{
          ...colorTheme
        } as React.CSSProperties}>
        <div className='menu-container'>
          <ButtonTop
            text='Menu'
            variant='contained'
            color='secondary'
            onClick={(event) => setAnchorEl(event.currentTarget)}
          />
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {
              showMain ?
                (
                  <div>
                    <MenuItem onClick={() => handleClear()}>Clear Entered Data</MenuItem>
                    <MenuItem onClick={() => handleDemo()}>Use Demo Data</MenuItem>
                    <MenuItem onClick={() => handleShowMainClick()}>Utilities</MenuItem>
                  </div>
                )
                :
                <MenuItem onClick={() => handleShowMainClick()}>Return to Curation</MenuItem>
            }
            <MenuItem onClick={() => handleServiceInfo()}>About</MenuItem>
          </Menu>
        </div>
        <h1 className='title'>VICC Fusion Curation {showMain ? 'Interface' : 'Utilities'}</h1>
        <div className='main-component'>
          {
            showMain ?
              (
                <GeneContext.Provider value={{ globalGenes, setGlobalGenes }}>
                  <DomainOptionsContext.Provider value={{ domainOptions, setDomainOptions }}>
                    <SuggestionContext.Provider value={[suggestions, setSuggestions]}>
                      <FusionContext.Provider value={{ fusion, setFusion }}>
                        <NavTabs />
                      </FusionContext.Provider>
                    </SuggestionContext.Provider>
                  </DomainOptionsContext.Provider>
                </GeneContext.Provider>
              )
              :
              <UtilitiesNavTabs />
          }
        </div>
      </div>
      <About show={showServiceInfo} setShow={setShowServiceInfo} />
    </ThemeProvider>
  );
};

export default App;
