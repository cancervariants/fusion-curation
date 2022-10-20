import {
  Button,
  Link,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getSequenceIds } from "../../../services/main";
import { useColorTheme } from "../../../global/contexts/Theme/ColorThemeContext";

const GetSequenceIds: React.FC = () => {
  const [inputSequence, setInputSequence] = useState<string>("");
  const [helperText, setHelperText] = useState<string>("");
  const [refseqId, setRefseqId] = useState<string>("");
  const [ga4ghId, setGa4ghId] = useState<string>("");
  const [aliases, setAliases] = useState<string[]>([]);

  useEffect(() => {
    if (inputSequence) {
      getSequenceIds(inputSequence).then((sequenceIdsResponse) => {
        if (sequenceIdsResponse.warnings) {
          setHelperText("Unrecognized sequence");
          setRefseqId("");
          setGa4ghId("");
          setAliases([]);
        } else {
          if (sequenceIdsResponse.refseq_id) {
            setRefseqId(sequenceIdsResponse.refseq_id);
          }
          if (sequenceIdsResponse.ga4gh_id) {
            setGa4ghId(sequenceIdsResponse.ga4gh_id);
          }
          if (sequenceIdsResponse.aliases) {
            setAliases(sequenceIdsResponse.aliases);
          }
          setHelperText("");
        }
      });
    }
  }, [inputSequence]);

  const { colorTheme } = useColorTheme();
  const useStyles = makeStyles(() => ({
    tabContainer: {
      display: "flex",
      width: "100%",
      height: "100%",
      "min-height": "39vh",
      "align-items": "stretch",
      flex: 1,
      padding: "10px",
    },
    left: {
      width: "30%",
      "background-color": colorTheme["--light-gray"],
      display: "flex",
      "justify-content": "center",
      "align-items": "center",
    },
    right: { width: "70%" },
    sequenceIdResult: {
      height: "100%",
      display: "flex",
      "flex-direction": "column",
      "justify-content": "space-between",
    },
    idsContainer: {
      padding: "20px",
    },
    refseqId: {},
    ga4ghId: {
      color: colorTheme["--dark-gray"],
    },
    namespaceText: {
      padding: "0 2px 0 0",
    },
    aliasHeader: {
      margin: "15px 0 0 0",
    },
    aliasContainer: {},
    identifier: {},
    downloadContainer: {
      display: "flex",
      justifyContent: "center",
      padding: "10px",
    },
  }));
  const classes = useStyles();

  const renderIdInfo = () => (
    <div className={classes.sequenceIdResult}>
      <div className={classes.idsContainer}>
        <div className={classes.refseqId}>
          <Typography variant="h4">
            <span className={classes.namespaceText}>refseq:</span>
            <span className={classes.identifier}>{refseqId.split(":")[1]}</span>
          </Typography>
        </div>
        <div className={classes.ga4ghId}>
          <Typography variant="h6">
            <span className={classes.namespaceText}>ga4gh:</span>
            <span className={classes.identifier}>{ga4ghId.split(":")[1]}</span>
          </Typography>
        </div>
        <div className={classes.aliasContainer}>
          <div className={classes.aliasHeader}>
            <Typography variant="h6">Aliases</Typography>
          </div>
          {aliases.map((alias, i) => (
            <Typography variant="body2" key={i}>
              {alias}
            </Typography>
          ))}
        </div>
      </div>
      <div className={classes.downloadContainer}>
        <Link
          href={`${process.env.REACT_APP_DEV_PROXY}/api/utilities/download_sequence?sequence_id=${inputSequence}`}
          target="_blank"
          download
        >
          <Button color="primary" variant="contained">
            Download FASTA
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className={classes.tabContainer}>
      <div className={classes.left}>
        <TextField
          margin="dense"
          style={{ height: 38, width: 200 }}
          value={inputSequence}
          onChange={(event) => setInputSequence(event.target.value)}
          label="Enter sequence ID"
          error={helperText.length > 0}
          helperText={helperText}
        />
      </div>
      <div className={classes.right}>
        {refseqId && ga4ghId ? renderIdInfo() : <></>}
      </div>
    </div>
  );
};

export default GetSequenceIds;
