import "./ColorKey.scss";

export const ColorKey: React.FC = () => {
  return (
    <div className="colorkey-container">
      <div className="key-row">
        <span className="color-block gene-block ">&nbsp;</span>
        Gene
      </div>
      <div className="key-row">
        <span className="transcript-segment-block  color-block">&nbsp;</span>
        Transcript Segment
      </div>
      <div className="key-row">
        <span className="region-block  color-block">&nbsp;</span>
        Genomic Region
      </div>
      <div className="key-row">
        <span className="linker-block  color-block">&nbsp;</span>
        Linker Sequence
      </div>
      <div className="key-row">
        <span className="regulatory-element-block color-block">&nbsp;</span>
        Regulatory Element
      </div>
    </div>
  );
};
