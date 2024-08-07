import copy from "clipboard-copy";
import React, { useEffect, useState } from "react";
import { validateFusion } from "../../../../services/main";
import {
  FormattedAssayedFusion,
  FormattedCategoricalFusion,
} from "../../../../services/ResponseModels";
import "./SummaryJSON.scss";

interface Props {
  formattedFusion: FormattedAssayedFusion | FormattedCategoricalFusion;
}

export const SummaryJSON: React.FC<Props> = ({ formattedFusion }) => {
  const [isDown, setIsDown] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [printedFusion, setPrintedFusion] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    // make request
    validateFusion(formattedFusion).then((response) => {
      if (response.warnings && response.warnings?.length > 0) {
        if (
          JSON.stringify(response.warnings.sort()) !==
          JSON.stringify(validationErrors.sort())
        ) {
          setValidationErrors(response.warnings);
        }
      } else {
        setPrintedFusion(JSON.stringify(response.fusion, null, 2));
      }
    });
  }, [formattedFusion]);

  const handleCopy = () => {
    copy(printedFusion);
    setIsDown(false);
    setIsCopied(true);
  };

  const handleMouseDown = () => {
    setIsDown(true);
  };

  return (
    <>
      {validationErrors.length > 0 ? (
        <div className="summary-json-container summary-json-container-error">
          {JSON.stringify(validationErrors)}
        </div>
      ) : (
        <>
          <div className="headline">
            <span className="copy-message">
              {isCopied ? "Copied to Clipboard!" : "Click to Copy"}
            </span>
          </div>
          <pre
            className={`${isDown ? "clicking" : ""} summary-json-container`}
            onClick={handleCopy}
            onMouseDown={handleMouseDown}
          >
            <div>{printedFusion}</div>
          </pre>
        </>
      )}
    </>
  );
};
