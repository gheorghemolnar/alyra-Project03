const actions = {
  init: "INIT",
  voterAdded: "VOTER_ADDED",
  proposalAdded: "PROPOSAL_ADDED"
};

const initialState = {
  artifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  contract: null,
  owner: null,
  status: 0,
  voters: [],
  proposals: []
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    case actions.voterAdded:
      return {
        ...state,
        voters: [...state.voters, data.voter]
      };
    case actions.proposalAdded:
      return {
        ...state,
        proposals: [...state.proposals, data.proposal]
      };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
