import inquirer from 'inquirer'
import chalk from 'chalk'
import fs from 'fs'

operation()

function operation() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'Q1',
                message: 'O que você deseja fazer?',
                choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Transferir', 'Sair']
            }
        ])
        .then((answers) => {
            const action = answers['Q1']

            if(action === 'Criar Conta') {
                createAccount()
            } else if(action === 'Consultar Saldo') {
                getAccountBalance()
            } else if(action === 'Depositar') {
                deposit()
            } else if(action === 'Sacar') {
                withDraw()
            } else if(action === 'Transferir') {
                transfer()
            } else {
                console.log(chalk.green('Obrigado por usar o Accounts!'))
                process.exit()
            }
        })
        .catch(error => console.log(error));
}

function createAccount() {
    console.log(chalk.green('Obrigado por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir!'))

    buildAccount()
}

function buildAccount() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'Q2',
                message: 'Digite um nome para sua conta'
            }
        ])
        .then((answers) => {
            const accountName = answers['Q2']

            if(!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            if(fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome'))
                buildAccount()
                return
            }

            fs.writeFileSync(`accounts/${accountName}.json`, '{ "balance": 0 }', err => {
                console.log(err)
            })

            console.log(chalk.bgGreen('Parabéns sua conta foi criada!'))
            operation()
        })
        .catch(error => console.log(error));
}

function deposit() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'Q3',
                message: 'Qual é o nome da sua conta?'
            }
        ])
        .then((answers) => {
            const accountName = answers['Q3']

            if(!checkAccount(accountName)) {
                return deposit()
            }

            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'Q4',
                        message: 'Quanto você deseja depositar?'
                    }
                ])
                .then((answers) => {
                    accountName
                    const amount = answers['Q4']
                    
                    if(!checkAccount(accountName)) {
                        return deposit()
                    }

                    addAmount(accountName, amount)
                })
                .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
}

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.red(`${accountName} não existe digite uma conta valida!`))
        return false
    }

    return true
}

function addAmount(accountName, amount, isTransfer) {
    const account = getAccount(accountName)
    const accountData = getAccount(accountName)
    const data = new Date()

    if(!amount) {
        console.log('Ocorreu um erro, tente novamente mais tarde!')
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(account.balance)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {console.log(err)})

    if(isTransfer) {
        console.log(chalk.green.bold(`VOCÊ FEZ UMA TRANFERÊNCIA!
        VALOR: R$${amount}
        CONTA: ${accountName}
        DATA: ${data.getDay()}/${data.getMonth()}/${data.getFullYear()}
        HORA: ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`))
    } else {
        console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
    operation()
    }
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function getAccountBalance() {
    inquirer
        .prompt([
            {
                name: 'Q5',
                message: 'Qual é o nome da sua conta?'
            }
        ])
        .then((answers) => {
            const accountName = answers['Q5']

            if(!checkAccount(accountName)) {
                return getAccountBalance()
            }

            const accountData = getAccount(accountName)

            console.log(chalk.blue(`Olá o saldo da sua conta é de: R$${accountData.balance}`))
            operation()

        })
        .catch(err => console.log(err))
}

function withDraw() {
    inquirer
        .prompt([
            {
                name: 'Q6',
                message: 'Qual é o nome da sua conta?'
            }
        ])
        .then((answer) => {
            const accountName = answer['Q6']

            if(!checkAccount(accountName)) {
                return withDraw()
            }

            inquirer
                .prompt([
                    {
                        name: 'Q7',
                        message: 'Quanto você deseja sacar?'
                    }
                ])
                .then((answers) => {
                    const amount = answers['Q7']

                    removeAmount(accountName, amount)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}

function removeAmount(accountName, amount, isTransfer) {
    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.red('Ocorreu um erro, tente novamente masi tarde!'))
        return withDraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.red('Valor Indisponivel!'))
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), err => console.log(err))

    if(!isTransfer) {
        console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta`))
        operation()
    }

}

function transfer() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'Q8',
                message: 'Qual é o nome da sua conta?'
            },
            {
                type: 'input',
                name: 'Q9',
                message: 'Qual é o nome da conta que você deseja realizar a transferência?'
            }
        ])
        .then((answers) => {
            const accountName = answers['Q8']
            const secondAccountName = answers['Q9']

            if((!checkAccount(accountName)) || (!checkAccount(secondAccountName))) {
                return transfer()
            }
        
            if(validAccount(accountName, secondAccountName)) {
                return transfer()
            }

            getValueTransfer(accountName, secondAccountName)

        })
        .catch((err) => console.log(err))
}

function validAccount(accountName, secondAccountName) {
    if(accountName === secondAccountName) {
        console.log(chalk.red(`Você precisa selecionar uma conta diferente para realizar a tranferência!`))
        return true
    }
}

function getValueTransfer(accountName, secondAccountName, accountValue) {
    inquirer 
        .prompt([
            {
                type: 'input',
                name: 'Q10',
                message: 'Qual é o valor que você deseja transferir?'
            }
        ])
        .then((answers) => {
            const accountData = getAccount(accountName)
            const accountValue = answers['Q10']

            if(accountValue > accountData.balance) {
                console.log(chalk.red(`Saldo insuficiente para realizar a tranferência!`))
                return getValueTransfer(accountName, null, accountValue)
            }

            addAmount(secondAccountName, accountValue, true)
            removeAmount(accountName, accountValue, true)
        })
        .catch((err) => console.log(err))
}
