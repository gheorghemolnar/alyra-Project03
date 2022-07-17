import React,{ useEffect, useState } from 'react';

import useEth from "../../contexts/EthContext/useEth";

import VotingWorkflow from '../VotingWorkflow';
import VotingInformations from '../VotingInformations';

import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";


function Voting() {
  const { state: {artifact, contract, status}} = useEth();
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(status);
}, [status]);

  return (
    <div className="contract-container">
      {
        !artifact ? <NoticeNoArtifact /> :
          !contract ? <NoticeWrongNetwork /> :
          <>
            <VotingWorkflow step={step} setStep={setStep} />
            <VotingInformations step={step} />
          </>
      }
    </div>
  );
}

export default Voting;
