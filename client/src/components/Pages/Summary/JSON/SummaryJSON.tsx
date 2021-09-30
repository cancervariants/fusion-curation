import './SummaryJSON.scss'

interface Props {
  // TODO: get types from model
  fusion: any
}

export const SummaryJSON: React.FC<Props> = ( { fusion }) => {

  return (
     <pre className="summary-json-container">
       {JSON.stringify(fusion, null, 2)}
     </pre>
  )
}
