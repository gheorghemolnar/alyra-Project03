import { Card } from "react-bootstrap";

const VotingNoAccess = () => <Card className="text-center">
    <Card.Header as="h5">Access restricted</Card.Header>
    <Card.Body>
        <Card.Text>This functionality is available only to registered voters</Card.Text>
    </Card.Body>
    </Card>;

export default VotingNoAccess;