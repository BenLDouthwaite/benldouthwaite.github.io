export default function FinanceTracker() {

    let accountData = getAccountData();
    let accounts = accountData.accounts;

    let transactionData = getTransactionData();
    let transactions = transactionData.transactions;

    return (<>
        <h1>Finance Tracker</h1>
        <p>
            Project to create a personal finance tracker. 
        </p>
        <p>Requirements:</p>
        <ul>
            <li>Want to be able to track value of accounts.</li>
            <li>Should be able to visualise the value of accounts over time.</li>
            <li>Track individual transactions assigned to a specific budget.</li>
            <li>View Transactions per account.</li>
        </ul>
        <p>Technical Considerations:</p>
        <ul>
            <li>Not intending to host this anywhere, it will be run purely on my own personal device, so security / hosting is less of a consideration.</li> 
            <li>As an exercise in design, the frontend should be usable in a debug mode with a mock backend and auto-generated test data, before creating the real backend</li> 
        </ul>
        <hr/>
        <Accounts id="accounts" accounts={accounts}/>
        <Transactions id="transactions" transactions={transactions}/>
</>
    )
}

function Accounts(props) {
    let accounts = props.accounts;
    console.log(accounts);
    return <>
        <h2>Accounts:</h2>
        <ul>
        <For each={accounts}>{(account, i) =>
            <li>{account.name}: {account.value}</li>
        }</For>
        </ul>
    </>
}

function getAccountData() {
    return {
        "accounts": [
            {
                "name": "Bank 1",
                "value": "£123"
            },
            {
                "name": "Bank 2",
                "value": "£456"
            }
        ]
    }
}

function Transactions(props) {
    let transactions = props.transactions;
    console.log(transactions);
    return <>
        <h2>Transactions</h2>
        <ul>
            <For each={transactions}>{(transaction, i) =>
                <li>{transaction.name}: {transaction.value}</li>
            }</For>
        </ul>
    </>
}

function getTransactionData() {
    return {
        "transactions": [
            {
                "name": "Coffee",
                "value": "£3",
            },
            {
                "name": "groceries",
                "value": "£20"
            },
            {
                "name": "Train ticket",
                "value": "£10"
            }
        ]
    }
}
