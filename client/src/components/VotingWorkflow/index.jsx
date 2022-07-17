import React,{ useEffect, useState } from 'react';
import { Button, Card, Form, InputGroup, Nav, Spinner, Toast, ToastContainer } from "react-bootstrap";

import useEth from "../../contexts/EthContext/useEth";
import { isOwner, isRegisteredVoter, resetFieldValue, getErrorMessage, mappingFieldValidation, EMPTY_FIELD_VALIDATION, MAX_NUMBER_OF_PROPOSALS, EMPTY_TOAST_MESSSAGE } from "../../utils";
import VotingResults from '../VotingResults';
import VotingNoAccess from '../VotingNoAccess';

// Workllfw Steps
const WORKFLOW_STEPS = {
    VOTERS_REGISTRATION:        0,
    PROPOSALS_REGISTRATION:     1,
    VOTING_SESSION:             2,
    VOTES_TALLY:                3
};

// Structure for form fields used to manage the fields values and their  validations
const FORM_FIELDS = {
    "0": { ...EMPTY_FIELD_VALIDATION },
    "1": { ...EMPTY_FIELD_VALIDATION },
    "2": { ...EMPTY_FIELD_VALIDATION }
};

// Structure used for the voting process
const VotingSteps = [
    { eventKey:   WORKFLOW_STEPS.VOTERS_REGISTRATION,     label: "Registering voters",     title: "Voter registration",     invite: "Add a new voter",      placeholder:"User address"},
    { eventKey:   WORKFLOW_STEPS.PROPOSALS_REGISTRATION,  label: "Registering proposals",  title: "Proposal registration",  invite: "Add a new proposal",   placeholder:"Proposal description"},
    { eventKey:   WORKFLOW_STEPS.VOTING_SESSION,          label: "Voting session",         title: "Proposal voting",        invite: "Vote a proposal",      placeholder:"Enter a proposal id"},
    { eventKey:   WORKFLOW_STEPS.VOTES_TALLY,             label: "Tally votes",            title: "Votes tallying",         invite: "The results",          placeholder:""},
];

const VotingWorkflow = ({step, setStep}) => {
    const { state: { accounts, contract, owner, voters, proposals}} = useEth();
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState({...EMPTY_TOAST_MESSSAGE });
    const [validated, setValidated] = useState(false);
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);

    const [formFields, setFormFields] = useState({ ...FORM_FIELDS });

    const bIsOwner = isOwner(accounts[0], owner);
    const bIsRegisteredVoter = isRegisteredVoter(accounts[0], voters);

    /**
     * Hooks
     */
    useEffect(() => {
        setFormFields({ ...FORM_FIELDS });
    }, [contract]);

    useEffect(() => {
        let response = [];
        const fetchData = async() => {
            const responseTmp = await contract.methods.winningProposalID().call();
            response = response.concat(responseTmp);
            setResults(response);
        }
        if(step === VotingSteps.length-1) {
            fetchData();
        }
    }, [contract, step]);

    const resetToastMessage = (msg = EMPTY_TOAST_MESSSAGE) => setToastMessage({ ...msg });

    /**
     * Workflow functions - Start
     */
    const startProposalRegistering = async() => await contract.methods.startProposalsRegistering().send({ from: accounts[0] });

    const startVotingSession = async() => {
        await Promise.all([
            contract.methods.endProposalsRegistering().send({ from: accounts[0] }),
            contract.methods.startVotingSession().send({ from: accounts[0] })
        ]);
    }
    const tallyVotes = async() => {
        await contract.methods.endVotingSession().send({ from: accounts[0] });
        await contract.methods.tallyVotes().send({ from: accounts[0] });
    };

    const addVoter = async (voter) => await contract.methods.addVoter(voter).send({ from: accounts[0] });

    const addProposal = async (description) => {
        if (proposals.length < MAX_NUMBER_OF_PROPOSALS) {
            await contract.methods.addProposal(description).send({ from: accounts[0] });
        }else {
            throw new Error("Maximum number of proposals has been reached !");
        }
    };

    const setVote = async (id) => await contract.methods.setVote(id).send({ from: accounts[0] });

    /**
     * Workflow functions - End
     */

    // Mappings of functions for handling submit and workflow status change, with appropiated messages
    const mappingWorkflow = {
        0: {stepWkf: null, actSave: addVoter, actMsg: 'New voter added', stepMsg: '' },
        1: {stepWkf: startProposalRegistering, actSave: addProposal, actMsg: 'New proposal added', stepMsg: 'Proposals registration'},
        2: {stepWkf: startVotingSession, actSave: setVote, actMsg: 'Vote accounted', stepMsg: 'Voting proposals'},
        3: {stepWkf: tallyVotes, actSave: null, actMsg: '', stepMsg: 'Voting have been tallied !'}
    };

    // handling workflow status change
    const handleWorkflowStepSelect = async(eventKey) => {
        const nextStep = parseInt(eventKey, 10);

        if(nextStep > step && !isLoading && mappingWorkflow[nextStep].stepWkf){
            try {
                resetToastMessage();
                setShow(false);
                setIsLoading(true);
                await mappingWorkflow[nextStep].stepWkf();
                setStep(nextStep);

                const toastMessage = mappingWorkflow[nextStep].stepMsg
                if(toastMessage !== ''){
                    setToastMessage({ message: toastMessage});
                    setShow(true);
                }
                setValidated(false);                    
            } catch (err) {
                const errMessage = getErrorMessage(err.message);
                setToastMessage({message: errMessage, isError: true});
                setShow(true);    
            }
            setTimeout(() => setIsLoading(false), 2000);
        }else {
            setToastMessage({message: "You can't go back !", isError: true});
            setShow(true);
        }
    };

    // handling field value change
    const handleChange = (event) => {
        const oldFormValues = formFields;
        const newValue = event.target.value;
        const isValid = (step === WORKFLOW_STEPS.VOTING_SESSION) ? mappingFieldValidation[`${step}`].validate(newValue, proposals.length) : mappingFieldValidation[`${step}`].validate(newValue);

        const newFormValues = {
            ...oldFormValues,
            [`${step}`]: {
                ...EMPTY_FIELD_VALIDATION,
                value: newValue,
                isValid: isValid,
                errorMessage: isValid ? '' : mappingFieldValidation[`${step}`].errorMessage
            }
        };
        setFormFields(newFormValues);
    };

    // handling form submit
    const handleSubmit = async(event) => {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            setValidated(true);
        } else {
            resetToastMessage();
            try {
                const newData = formFields[`${step}`].value.trim();
                setShow(false);
                setIsLoading(true);

                if(mappingWorkflow[step].actSave) {
                    await mappingWorkflow[step].actSave(newData);
                    setFormFields(resetFieldValue(step, formFields));
                    setValidated(false);
                    setToastMessage({message: "Success", isError: false, actionType: mappingWorkflow[step].actMsg});
                    setShow(true);
                }
            } catch (err) {
                const errMessage = getErrorMessage(err.message);

                setToastMessage({message: errMessage, isError: true});
                setShow(true);
            }finally{
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="voting">
            <div className="voting-header">
                <div className="steps">
                    <Nav variant="pills" activeKey={step} onSelect={handleWorkflowStepSelect}>
                        {
                            VotingSteps.map(step => <Nav.Item key={step.eventKey}>
                                <Nav.Link eventKey={step.eventKey} disabled={!bIsOwner}>{step.label}</Nav.Link>
                            </Nav.Item>
                        )}
                    </Nav>
                </div>
            </div>

            <div className="voting-body">
            { ((bIsOwner && step < VotingSteps.length - 1) || ((bIsRegisteredVoter && step >= 1 && step < VotingSteps.length - 1)))
                ?
                    <Card className="text-center">
                        <Card.Header as="h5">{VotingSteps[step].title}</Card.Header>
                        <Card.Body>
                            <Card.Text>{VotingSteps[step].invite}</Card.Text>
                                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                    <InputGroup hasValidation>
                                        <Form.Control onChange={handleChange} type="text" required
                                            placeholder={VotingSteps[step].placeholder} 
                                            value={formFields[`${step}`].value}
                                            disabled={isLoading} 
                                            isValid={formFields[`${step}`].isValid}
                                            isInvalid={formFields[`${step}`].isValid != null ? !formFields[`${step}`].isValid : false}
                                            spellCheck="false" 
                                            />
                                        <Form.Control.Feedback type="invalid">{formFields[`${step}`].errorMessage}</Form.Control.Feedback>
                                    </InputGroup>
                                    <div className="cta">
                                        <div className="btns">
                                            <div className="d-grid gap-2">
                                                <Button variant="primary" size="lg" type="submit">
                                                    {isLoading ?
                                                    <Spinner animation="border" role="status" variant="warning">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </Spinner>
                                                    :
                                                    "Add"
                                                }
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Form>                           
                        </Card.Body>
                    </Card>
                :  (step === VotingSteps.length - 1) ? <VotingResults results={results}/> : <VotingNoAccess />
            }
            </div>

            <ToastContainer position="bottom-center" className="p-3">
                <Toast onClose={() => setShow(false)} show={show} bg={toastMessage.isError?'danger' : 'info'}>
                    <Toast.Header>
                        <strong className="me-auto">{toastMessage.isError ? "Error occured": toastMessage.actionType}</strong>
                    </Toast.Header>
                    <Toast.Body className={toastMessage.isError?'danger' : 'info'}>{toastMessage.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default VotingWorkflow;