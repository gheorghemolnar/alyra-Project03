import useEth from "../../contexts/EthContext/useEth";

const VotingResults = ({results = []}) => {
    const { state: { proposals}} = useEth();

    return <div><h3>Winning proposal(s):</h3> {
        results.length > 0 && proposals.length > 0?
        results.map(id=> <div key={id}>{`${id}`} - {`${proposals[id].returnValues.description}`}</div>)
        : "No results available !"
    }</div>;
};

export default VotingResults;