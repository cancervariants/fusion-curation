import './Success.scss';
import SuccessCheck from './SuccessCheck';
import { Button } from '@material-ui/core/';

interface Props {
  setAccepted
}



export const Success: React.FC<Props> = ({ setAccepted }) => {
  const handleReturn = () => setAccepted(true);

  return (
    <div className="success-confirmation">
      <SuccessCheck />
      <h2>Success!</h2>
      <h4>Fusion successfully curated.</h4>
      <Button variant="contained" color="primary" onClick={handleReturn}>OK</Button>
    </div>
  );
};
