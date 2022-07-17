import useEth from "../../contexts/EthContext/useEth";

import { isOwner } from '../../utils';

const EMPTY = '--';

export default function Header() {
    const {state: { owner, accounts, networkID }} = useEth();
    const account = accounts && accounts.length > 0 ? accounts[0] : EMPTY;
    const network = networkID ? networkID : EMPTY;
    const AdminPrefix = isOwner(account, owner) ? 'Welcome ADMIN !' : '';

    return <div>{AdminPrefix} Account: {account} / Network: {network}</div>;

}