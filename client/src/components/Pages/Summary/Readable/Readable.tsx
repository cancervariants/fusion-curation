import './Readable.scss'

interface Props {
  // TODO: get types from model
  genes: any,
  proteinDomains: any,
  regulatoryElements: any,
  transcriptComponents: any
}

export const Readable: React.FC<Props> = ( { genes, proteinDomains, regulatoryElements, transcriptComponents }) => {

  return (
      <div className="readable-items-container">
      <div className="row-items">
      <div className="row">
        <div className="left-item">Gene </div>
        <div className="right-item">{genes.map(gene => `${gene}`)}</div>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Structure </span>
        <div className="right-item"> 
          {transcriptComponents.map(comp => <div className="right-sub-item">{comp.component_name}</div>)} 
        </div>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Regulatory Elements  </span>
        <span className="right-item">{regulatoryElements.map(re => `${re.type} ${re.gene_descriptor.label}`)}</span>
      </div>
      <hr />
      <div className="row">
        <span className="left-item">Protein Domains</span>
        <span className="right-item">{proteinDomains.map(pd => `${pd.status}: ${pd.gene_descriptor.label}`)} </span>
      </div>
      </div> 
      </div>
  )
}
