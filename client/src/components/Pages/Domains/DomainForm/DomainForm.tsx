import { useContext, useState, useEffect } from "react";
import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
} from "@material-ui/core/";
import { makeStyles } from "@material-ui/core/styles";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import { DomainOptionsContext } from "../../../../global/contexts/DomainOptionsContext";
import { GeneContext } from "../../../../global/contexts/GeneContext";
import { v4 as uuid } from "uuid";
import "./DomainForm.scss";
import {
  ClientFunctionalDomain,
  DomainParams,
  DomainStatus,
} from "../../../../services/ResponseModels";
import { getFunctionalDomain } from "../../../../services/main";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "80%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const DomainForm: React.FC = () => {
  // // TODO: shouldn't be necessary
  useEffect(() => {
    if (fusion.functional_domains === undefined) {
      setFusion({ ...fusion, ...{ functional_domains: [] } });
    }
  }, []);

  const classes = useStyles();

  const { domainOptions } = useContext(DomainOptionsContext);
  const { globalGenes } = useContext(GeneContext);
  const { fusion, setFusion } = useContext(FusionContext);

  // values for visible item
  const [gene, setGene] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");

  const handleGeneChange = (event) => {
    setGene(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleDomainChange = (event) => {
    setDomain(event.target.value);
  };

  const handleAdd = () => {
    const domainParams = domainOptions[gene].find(
      (domainOption: DomainParams) => domainOption.interpro_id == domain
    );
    getFunctionalDomain(domainParams, status as DomainStatus, gene).then(
      (response) => {
        if (response.domain) {
          const newDomain: ClientFunctionalDomain = {
            domain_id: uuid(),
            ...response.domain,
          };
          const cloneArray = Array.from(fusion["functional_domains"]);
          cloneArray.push(newDomain);
          setFusion({ ...fusion, ...{ functional_domains: cloneArray } });

          setStatus("default");
          setDomain("");
          setGene("");
        }
      }
    );
  };

  const renderGeneOptions = () => {
    // concatenate default/unselectable option with all selectable genes
    return [<MenuItem key={-1} value="" disabled></MenuItem>].concat(
      Object.keys(domainOptions).map((geneId: string, index: number) => (
        <MenuItem key={index} value={geneId}>
          {`${globalGenes[geneId].label}(${geneId})`}
        </MenuItem>
      ))
    );
  };

  const renderDomainOptions = () => {
    const domainOptionMenuItems = [
      <MenuItem key={-1} value="" disabled></MenuItem>,
    ];
    if (domainOptions[gene]) {
      const uniqueInterproIds: Set<string> = new Set();
      domainOptions[gene].forEach((domain: DomainParams, index: number) => {
        if (!uniqueInterproIds.has(domain.interpro_id)) {
          uniqueInterproIds.add(domain.interpro_id);
          domainOptionMenuItems.push(
            <MenuItem key={index} value={domain.interpro_id}>
              {domain.domain_name}
            </MenuItem>
          );
        }
      });
    }
    return domainOptionMenuItems;
  };

  return (
    <div className="form-container">
      <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">Gene</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={gene}
            onChange={handleGeneChange}
            disabled={Object.keys(domainOptions).length === 0}
          >
            {renderGeneOptions()}
          </Select>
        </FormControl>
      </div>

      <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel>Domain</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={domain}
            onChange={handleDomainChange}
            disabled={gene === ""}
          >
            {renderDomainOptions()}
          </Select>
        </FormControl>
      </div>
      <div className="formInput">
        <FormControl className={classes.formControl}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={handleStatusChange}
            disabled={domain === ""}
          >
            <MenuItem value="default" disabled></MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
            <MenuItem value="preserved">Preserved</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="add-button">
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAdd}
          disabled={status === ""}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default DomainForm;
