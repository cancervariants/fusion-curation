import "./Readable.scss";
import { ClientStructuralElement } from "../../../../services/ResponseModels";
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
import { FusionType } from "../Main/Summary";
import { getFusionNomenclature } from "../../../../services/main";

type Props = {
  validatedFusion: FusionType;
};

export const Readable: React.FC<Props> = ({ validatedFusion }) => {
  // the validated fusion object is available as a parameter, but we'll use the
  // client-ified version to grab things like nomenclature and display values
  const { fusion } = useContext(FusionContext);
  const [nomenclature, setNomenclature] = useState<string>("");

  useEffect(() => {
    getFusionNomenclature(validatedFusion).then((nmResponse) =>
      setNomenclature(nmResponse.nomenclature as string)
    );
  }, [validatedFusion]);

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
            {eventDisplayMap[fusion.causative_event.event_type] || ""}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Typography className="row-name">Assay</Typography>
        </TableCell>
        <TableCell align="right">
          <Typography>{`${fusion.assay.assay_name} (${fusion.assay.assay_id})`}</Typography>
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
          {fusion.critical_functional_domains &&
            fusion.critical_functional_domains.length > 0 &&
            fusion.critical_functional_domains.map((domain, index) => (
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
            {fusion.r_frame_preserved === true
              ? "Preserved"
              : fusion.r_frame_preserved === false
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
                {fusion.structural_elements.map(
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
                {fusion.regulatory_element ? (
                  <Chip label={fusion.regulatory_element.nomenclature} />
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
