import {
  Box,
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
    utilContainer: {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "stretch",
      flex: 1,
    },
    inputContainer: {
      height: "40%",
      minHeight: "85px",
      width: "40%",
      backgroundColor: colorTheme["--light-gray"],
    },
    inputOptions: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    sequenceInput: {
      padding: "0 0 20px 0",
    },
    demoButton: {
      padding: "10px",
    },
    resultContainer: { width: "70%" },
    sequenceIdResult: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
    },
    idsContainer: {
      padding: "20px",
    },
    ga4ghId: {
      color: colorTheme["--dark-gray"],
    },
    namespaceText: {
      padding: "0 2px 0 0",
    },
    aliasHeader: {
      margin: "15px 0 5px 0",
    },
    downloadContainer: {
      display: "flex",
      justifyContent: "center",
      padding: "10px",
    },
  }));
  const classes = useStyles();

  const inputField = (
    <Box className={classes.inputOptions}>
      <TextField
        margin="dense"
        style={{ height: 38, width: 250 }}
        value={inputSequence}
        onChange={(event) => setInputSequence(event.target.value)}
        label="Enter sequence ID"
        error={helperText.length > 0}
        helperText={helperText}
        className={classes.sequenceInput}
      />
      <Box>
        <Button
          className={classes.demoButton}
          onClick={() => setInputSequence("NM_002529.3")}
        >
          RefSeq Demo
        </Button>
        <Button
          className={classes.demoButton}
          onClick={() =>
            setInputSequence("ga4gh:SQ.jkiXxxRjK7uTMiW2KQFjpgvF3VQi-HhX")
          }
        >
          GA4GH Demo
        </Button>
      </Box>
    </Box>
  );

  const renderedIdInfo = (
    <Box className={classes.sequenceIdResult}>
      <Box className={classes.idsContainer}>
        <Box>
          <Typography variant="h4">
            <span className={classes.namespaceText}>refseq:</span>
            <span>{refseqId.split(":")[1]}</span>
          </Typography>
        </Box>
        <Box className={classes.ga4ghId} ml="20px">
          <Typography variant="h6">
            <span className={classes.namespaceText}>ga4gh:</span>
            <span>{ga4ghId.split(":")[1]}</span>
          </Typography>
        </Box>
        <Box>
          <Box className={classes.aliasHeader}>
            <Typography variant="h6">Aliases</Typography>
          </Box>
          <Box ml="20px">
            {aliases.map((alias, i) => (
              <Box mb="5px">
                <Typography variant="body2" key={i}>
                  {alias}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box className={classes.downloadContainer}>
        <Link
          href={`${process.env.REACT_APP_DEV_PROXY}/api/utilities/download_sequence?sequence_id=${inputSequence}`}
          target="_blank"
          download
        >
          <Button color="primary" variant="contained">
            Download FASTA
          </Button>
        </Link>
      </Box>
    </Box>
  );

  return (
    <Box className={classes.utilContainer}>
      <Box className={classes.inputContainer}>{inputField}</Box>
      <Box className={classes.resultContainer}>
        {refseqId && ga4ghId ? renderedIdInfo : <></>}
      </Box>
    </Box>
  );
};

export default GetSequenceIds;
