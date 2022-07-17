// Max nunmber of Proposals that can be added !
export const MAX_NUMBER_OF_PROPOSALS   = 100;

// Used to empty the toast message
export const EMPTY_TOAST_MESSSAGE      = { message: '', isError: false };

/* Form Fields Validations */
const validateEthAddress = (address) => {
    const REGEX_ETHEREUM_ADDRESS = new RegExp(/^0x[a-fA-F0-9]{40}$/,'gi');
    return REGEX_ETHEREUM_ADDRESS.test(address);
};
const validateDescription = (description) => {
    return description.trim() !== '';
};
const validateId = (id, proposalsNr) => {
    const REGEX_NUMBER = new RegExp(/^\d{1,3}$/,'g');
    return REGEX_NUMBER.test(id) && (id < proposalsNr);
};

export const mappingFieldValidation = {
    "0": { 
        validate: validateEthAddress, 
        errorMessage: 'Please enter a valid address (ex. 0x0Fc26AD404Ade2e68ba50EDc0f9fC6cC6a87aBE6)'
    },
    "1": {
        validate: validateDescription,
        errorMessage: 'Please enter a valid description'
    },
    "2": {
        validate: validateId,
        errorMessage: 'Please enter an existant proposition id'
    }
};


function getParsedJsonContent(message = "") {
    const boundaries = ['{','}'];
    const begin = message.indexOf(boundaries[0]);
    const end = message.indexOf(boundaries[1]);
    const stringObject = message.substring(begin, end+1);

    return JSON.parse(stringObject);
}

function isJSON_RPC(message = "") {
    return message.indexOf("JSON-RPC") !== -1;
}


export const EMPTY_FIELD_VALIDATION = { value: '', isValid: null, errorMessage: '' };

export const resetFieldValue = (step, formFields) => {
    return {
        ...formFields,
        [`${step}`]: {
            value: '',
            isValid: null,
            // isTouched: false
        }
    }
};

// Is App Owner
export const isOwner = (currentUser, owner) => currentUser === owner;

// Is registered Voter
export const isRegisteredVoter = (currentUser, votersList = []) => {
    const votersAddresses = votersList.length > 0 ? votersList.map(({returnValues}, i) => returnValues.voterAddress) : [];

    return votersAddresses.includes(currentUser);
}

// Mapping between Workflow Steps and the App Steps
export const mappingWorkflowStatusToSteps = {
    0: 0,
    1: 1,
    2: 2,
    3: 2,
    4: 3,
    5: 3,
};

export function getErrorMessage(message = "") {
    if(isJSON_RPC(message)) {
        return getParsedJsonContent(message).message;
    }

    return message;
}
