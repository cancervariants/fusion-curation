import React from "react";
import { Box, Typography, makeStyles, Link, Paper } from "@material-ui/core";
import Carousel from "react-material-ui-carousel";

const useStyles = makeStyles(() => ({
  landingContent: {
    width: "100%",
    height: "100%",
    marginTop: "15px",
  },
  carouselContainer: {
    width: "100%",
    height: "200px",
    backgroundColor: "#2980b9",
    color: "white",
  },
  carouselItem: {
    marginLeft: "100px",
    marginTop: "50px",
  },
  landingSection: {
    fontSize: "20px",
    margin: "15px",
  },
  fullSection: {
    width:"100%", 
    minHeight: "250px", 
    marginTop: "50px"
  },
  splitSection: {
    width:"49%", 
    minHeight: "300px", 
    marginTop: "30px"
  },
}));

export default function LandingPage(): React.ReactElement {
  const classes = useStyles()

  return (
    <Box className={classes.landingContent}>
      <Paper elevation={0} className={classes.carouselContainer}>
      <Carousel interval={5000} height="200px" navButtonsAlwaysVisible>
        <Box className={classes.carouselItem}><h2>Welcome to the <b>VICC Fusion Curation Interface</b>, an educational tool for exploring gene fusions.</h2>  
        </Box>
        <Box className={classes.carouselItem}><h2>Contribute on our <Link href="https://github.com/cancervariants/fusion-curation" target="_blank" color="inherit"><b>GitHub repository.</b></Link></h2></Box>
        <Box className={classes.carouselItem}><h2>Learn about the <Link href="https://fusions.cancervariants.org/en/latest/index.html"><b>Gene Fusion Specification.</b></Link></h2></Box>
      </Carousel>
      </Paper>
      <Paper className={classes.fullSection}>
        <Box className={classes.landingSection} pt="1px" pb="15px"><h3>About the VICC Fusion Curation Interface</h3>
          <Typography>Maximizing the research and clinical value of genomic information will require that clinicians, researchers, and testing laboratories capture and report genetic variation data reliably. <Link href="https://fusions.cancervariants.org/en/latest/index.html" target="_blank">The Gene Fusion Specification</Link> — written by a partnership among experts from clinical laboratory testing and informatics societies — is an open specification to standardize the representation of gene fusion data and knowledge.</Typography>
          <Box mt="15px"><Typography>The Gene Fusion Specification is a collection of models and guidance for the precise representation of gene fusions, assembled by a cross-consortia initiative between members of the Clinical Genome (ClinGen) Somatic Cancer Clinical Domain Working Group, the Cancer Genomics Consortium, the Cytogenetics Committee of the College of American Pathologists (CAP) and the American College of Medical Genetics and Genomics (ACMG), and the Variant Interpretation for Cancer Consortium.</Typography></Box>
          <Box mt="15px"><Typography>This web tool provides a user interface supporting gene fusion curation. This tool is primarily an educational resource to demonstrate the computable structure and associated nomenclature for gene fusions constructed in the application.</Typography></Box>
        </Box>
      </Paper>
      <Box display="flex" justifyContent="space-between">
      <Paper className={classes.splitSection}>
        <Box className={classes.landingSection}>
          <h3>Assayed and Categorical Fusion Tools</h3>
          <Typography>Determining the salient elements for a gene fusion is dependent upon the context in which the gene fusion is being described.</Typography>
          <Box mt="15px"><Typography><b>Assayed gene fusions</b> from biological specimens are directly detected using RNA-based gene fusion assays, or alternatively may be inferred from genomic rearrangements detected by whole genome sequencing or cytogenomic assays in the context of informative phenotypic biomarkers.</Typography></Box>
          <Box mt="15px"><Typography>In contrast, <b>categorical gene fusions</b> are generalized concepts representing a class of fusions by their shared attributes, such as retained or lost regulatory elements and/or functional domains, and are typically curated from the biomedical literature for use in genomic knowledgebases.</Typography></Box>
        </Box>
      </Paper>
      <Paper className={classes.splitSection}>
        <Box className={classes.landingSection}>
          <h3>Utilities Information</h3>
          <Typography>The following standalone tools are provided to support curation efforts:</Typography>
          <Box mt="15px"><Typography><b>MANE transcripts retrieval</b>, providing matched transcripts given a gene name</Typography></Box>
          <Box mt="15px"><Typography><b>Coordinate conversion</b>, returning corresponding genomic and exon coordinates given a location</Typography></Box>
          <Box mt="15px"><Typography><b>Sequence ID lookup</b>, supplying synonymous identifiers given an accession</Typography></Box>
        </Box>
      </Paper>
      </Box>
    </Box>
  )
}