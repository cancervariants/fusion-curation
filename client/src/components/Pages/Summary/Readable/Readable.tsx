import "./Readable.scss";
import {
  ClientStructuralElement,
  FormattedAssayedFusion,
  FormattedCategoricalFusion,
} from "../../../../services/ResponseModels";
import React, { useContext, useEffect, useState } from "react";
import Chip from "@material-ui/core/Chip";
import { FusionContext } from "../../../../global/contexts/FusionContext";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { eventDisplayMap } from "../../CausativeEvent/CausativeEvent";
import { getFusionNomenclature } from "../../../../services/main";

type Props = {
  formattedFusion: FormattedAssayedFusion | FormattedCategoricalFusion;
};

export const Readable: React.FC<Props> = ({
  formattedFusion: formattedFusion,
}) => {
  // the validated fusion object is available as a parameter, but we'll use the
  // client-ified version to grab things like nomenclature and display values
  const { fusion } = useContext(FusionContext);
  const [nomenclature, setNomenclature] = useState<string>("");

  useEffect(() => {
    getFusionNomenclature(formattedFusion).then((nmResponse) =>
      setNomenclature(nmResponse.nomenclature as string)
    );
  }, [formattedFusion]);

  const assayName = fusion.assay?.assayName ? fusion.assay.assayName : "";
  const assayId = fusion.assay?.assayId ? `(${fusion.assay.assayId})` : "";

  /**
   * Render rows specific to assayed fusion fields
   * @returns React component containing table rows
   */
  const renderAssayedRows = () => (
    <>
      <TableRow>
        <TableCell>
          <Typography className="row-name">Causative Event</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>
            {eventDisplayMap[fusion.causativeEvent?.eventType] || ""}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Typography className="row-name">Assay</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>
            {fusion.assay ? `${assayName} ${assayId}` : ""}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );

  /**
   * Render table sections that are categorical fusion-specific
   * @returns React component containing tablerows
   */
  const renderCategoricalRows = () => (
    <>
      <TableRow>
        <TableCell>
          <Typography className="row-name">Functional domains</Typography>
        </TableCell>
        <TableCell align="right">
          {fusion.criticalFunctionalDomains &&
            fusion.criticalFunctionalDomains.length > 0 &&
            fusion.criticalFunctionalDomains.map((domain, index) => (
              <Typography
                key={index}
              >{`${domain.status}: ${domain.label}`}</Typography>
            ))}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Typography className="row-name">Reading Frame</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>
            {fusion.readingFramePreserved === true
              ? "Preserved"
              : fusion.readingFramePreserved === false
              ? "Not preserved"
              : "Unspecified"}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );

  return (
    <div>
      <Typography className="nomenclature" align="center" variant="h6">
        {nomenclature}
      </Typography>
      <TableContainer>
        <Table aria-label="fusion summary">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography className="row-name">Structure</Typography>
              </TableCell>
              <TableCell align="right">
                {fusion.structure.map(
                  (element: ClientStructuralElement, index: number) => (
                    <Chip key={index} label={element.nomenclature} />
                  )
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Typography className="row-name">Regulatory Element</Typography>
              </TableCell>
              <TableCell align="right">
                {fusion.regulatoryElement ? (
                  <Chip label={fusion.regulatoryElement.nomenclature} />
                ) : (
                  ""
                )}
              </TableCell>
            </TableRow>
            {fusion.type === "CategoricalFusion" ? (
              renderCategoricalRows()
            ) : fusion.type === "AssayedFusion" ? (
              renderAssayedRows()
            ) : (
              <></>
            )}
          </TableHead>
        </Table>
      </TableContainer>
    </div>
  );
};
