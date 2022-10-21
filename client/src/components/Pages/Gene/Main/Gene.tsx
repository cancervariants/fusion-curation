import { GeneSearch } from "../Search/GeneSearch";
import { GeneResults } from "../Results/GeneResults";

import "./Gene.scss";

interface Props {
  index: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Gene: React.FC<Props> = ({ index }) => {
  return (
    <div className="genetab-container">
      <GeneSearch />
      <GeneResults />
    </div>
  );
};
