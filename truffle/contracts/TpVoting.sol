// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

/// @author Gheorghe Molnar
/// @title A Web3 Voting application
/// @notice You can use this contract for some basic voting
/// @dev The current version of the contract only support some basic votes tallying
contract Voting is Ownable {
    uint public winningProposalID;
    /// @notice Used to store the Voter details
    /// @dev Structure used for the Voter details
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /// @notice Used to store the Proposal
    /// @dev Structure used for the Proposal details
    struct Proposal {
        string description;
        uint voteCount;
    }
    /// @notice Used to store the worklow statuses
    /// @dev Enum used to store the worklow statuses
    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice Used to store the current workflow status
    /// @dev Used to store the current workflow status
    WorkflowStatus public workflowStatus;

    /// @notice Array used to store the proposals, with a max of 100 elements
    /// @dev Array used to store the proposals, with a max of 100 elements
    Proposal[] proposalsArray;

    /// @notice Mapping used to link an address to a Voter
    /// @dev Mapping used to link an address to a Voter
    mapping (address => Voter) voters;


    /// @notice Event emitted when a new Voter has been added
    /// @dev Event emitted when a new Voter has been added
    event VoterRegistered(address voterAddress); 
    /// @notice Event emitted when workflow status has changed
    /// @dev Event emitted when workflow status has changed
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    /// @notice Event emitted when a new Proposal has been added
    /// @dev Event emitted when a new Proposal has been added
    event ProposalRegistered(uint proposalId, string description);
    /// @notice Event emitted when a proposal has been Voted has been added
    /// @dev Event emitted when a proposal has been Voted
    event Voted (address voter, uint proposalId);

    /// @notice Modifier used to limit the functionality only to registered voters
    /// @dev Modifier is based on the Voter's isRegistered property
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Returns a Voter details
    /// @dev Returns a Voter structure corresponding to the address
    /// @param _addr address
    /// @return Voter
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }

    /// @notice Returns a Proposal details
    /// @dev Returns a Proposal structure corresponding to the address
    /// @param _id uint
    /// @return Proposal
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /// @notice Allows to register a new Voter when the workflow is 'RegisteringVoters'
    /// @dev Allows registration of a new Voter when the workflow is 'RegisteringVoters' and emits an 'VoterRegistered' event
    /// @param _addr address
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 
    /// @notice Allows registered voters to add a Proposal when the workflow is 'ProposalsRegistrationStarted'
    /// @dev Allows registration of a new Voter when the workflow is 'ProposalsRegistrationStarted' and emits an 'ProposalRegistered' event
    /// @param _desc string
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(proposalsArray.length < 100, "The maximum number of Proposals has been reached"); // Max 100 proposals
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1, _desc);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice Allows registered voters to vote a Proposal when the workflow is 'VotingSessionStarted'
    /// @dev Allows registered voters to vote a Proposal when the workflow is 'VotingSessionStarted' and emits an 'ProposalRegistered' event
    /// @param _id uint
    function setVote( uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice Allows the application owner to change the workflow status in order to allow proposals registration
    /// @dev Allows the application owner to change the workflow status to 'ProposalsRegistrationStarted' and emits an 'WorkflowStatusChange' event
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice Allows the application owner to change the workflow status in order to end proposals registration
    /// @dev Allows the application owner to change the workflow status to 'ProposalsRegistrationEnded' and emits an 'WorkflowStatusChange' event
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice Allows the application owner to change the workflow status in order to allow votes registration
    /// @dev Allows the application owner to change the workflow status to 'VotingSessionStarted' and emits an 'WorkflowStatusChange' event
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice Allows the application owner to change the workflow status in order to end votes registration
    /// @dev Allows the application owner to change the workflow status to 'VotingSessionEnded' and emits an 'WorkflowStatusChange' event
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /// @notice Allows the application owner to change the workflow status in order to tally votes
    /// @dev Allows the application owner to change the workflow status to 'VotesTallied' and emits an 'WorkflowStatusChange' event; it computes the voting result and updates the 'winningProposalID'; the computation logic should be improved
   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
       uint _winningProposalId;
      for (uint256 p = 0; p < proposalsArray.length; p++) {
           if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
               _winningProposalId = p;
          }
       }
       winningProposalID = _winningProposalId;
       
       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}