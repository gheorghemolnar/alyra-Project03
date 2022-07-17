import React, {useEffect, useState} from 'react';
import { Tab, Nav, Row, Col } from "react-bootstrap";

import useEth from "../../contexts/EthContext/useEth";

function VotingInformations({step}){
    const getActiveTab = (step) => step === 0 ? 1 : 2;
    const { state: { voters, proposals }} = useEth();
    const [tab, setTab] = useState(getActiveTab(step));

    useEffect(() => {
      setTab(getActiveTab(step));
  }, [step]);

    const handleSelect = (eventKey) => {
        if(eventKey !== tab){
            setTab(eventKey);
        }
    };
    const votersContent = voters.length ?
        <div className="details-list-voters">
          <h3>Voters list: ({voters.length})</h3>
          <div className="listing">
            {voters.map(({returnValues}, i) => <div className="item" key={returnValues.voterAddress}>{returnValues.voterAddress}</div>)}
          </div>
        </div>
        : "No voters yet";
    const proposalsContent = proposals.length ?
        <div className="details-list-proposals">
          <h3>Proposals list: ({proposals.length})</h3>
          <div className="listing">
            {proposals.map(({returnValues}) => <div className="item" key={returnValues.proposalId}>{returnValues.proposalId} - {returnValues.description}</div>)}
          </div>
        </div>
        : "No proposal yet";

    return <div className="voting-informations">
      <Tab.Container id="VotingInformations" activeKey={tab} onSelect={handleSelect}>
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="1">Voters list</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="2">Proposals list</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="1">
                {votersContent}
              </Tab.Pane>
              <Tab.Pane eventKey="2">
                {proposalsContent}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>;
}

export default VotingInformations;