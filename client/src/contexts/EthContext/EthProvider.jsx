import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import { mappingWorkflowStatusToSteps } from '../../utils';

function EthProvider({ children }) {
  const [ state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async artifact => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        let initOwner = false, initStatus = 0, initVoters = [], initProposals = [];

        try {
          if (artifact.networks[networkID]) {
            address = artifact.networks[networkID].address;
            contract = new web3.eth.Contract(abi, address);

            // On recup tous les events passés du contrat
            if(contract) {
              const options = { fromBlock: 0, toBlock: 'latest' };

              [initOwner, initStatus, initVoters, initProposals] = await Promise.all([
                contract.methods.owner().call(),
                contract.methods.workflowStatus().call(),
                contract.getPastEvents('VoterRegistered', options),
                contract.getPastEvents('ProposalRegistered', options)
              ]);
            }
          }
        } catch (err) {
          console.error("EthProvider", err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract, owner: initOwner, status: mappingWorkflowStatusToSteps[parseInt(initStatus, 10)], voters: [...initVoters], proposals: [...initProposals] }
        });
      }
    }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/Voting.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    const eventsSubscriptions = {};
    const options1 = {fromBlock: 'latest'};

    if(state.contract) {
      const subVoters = state.contract.events.VoterRegistered(options1)
      .on('connected', event => {
        console.log("Voters subscription connected", event);
      })
      .on('data', event => {
        dispatch({
          type: actions.voterAdded,
          data: {
            voter: event
          }
        })
      });
      // add subscription for Voters
      eventsSubscriptions['voters'] = subVoters;

      const subProposals = state.contract.events.ProposalRegistered(options1)
      .on('connected', event => {
        console.log("Proposals subscription connected", event);
      })
      .on('data', event => {
        dispatch({
          type: actions.proposalAdded,
          data: {
            proposal: event
          }
        })
      });
      // add subscription for Proposals
      eventsSubscriptions['proposals'] = subProposals;

    }

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
      Object.entries(eventsSubscriptions).forEach(([key, subsription]) => {
        console.log("Unsubscribe for ", key);
        subsription.unsubscribe();
      })
    };
  }, [init, state.artifact, state.contract]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
