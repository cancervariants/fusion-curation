import { TextField } from "@material-ui/core";
import { useState } from "react";
import "./GetSequenceIds.scss";

const GetSequenceIds: React.FC = () => {
  const [inputSequence, setInputSequence] = useState<string>("");

  return (
    <div className="get-sequence-ids-tab-container">
      <div className="top">
        <TextField
          margin="dense"
          style={{ height: 38, width: 300 }}
          value={inputSequence}
          onChange={(event) => setInputSequence(event.target.value)}
          label="Enter sequence ID"
        />
      </div>
      <div className="bottom">sdfkj</div>
    </div>
  );
};

export default GetSequenceIds;
