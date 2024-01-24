var income = 0;

function addIncome() {
    var incomeInput = document.getElementById('income');
    var incomeValue = parseFloat(incomeInput.value) || 0;

    if (incomeValue >= 0) {
        income = incomeValue;
        updateBalance();
        incomeInput.value = '';
        document.getElementById('incomeForm').style.display = 'none';
        document.getElementById('incomeContainer').style.display = 'block';
        document.getElementById('incomeValue').innerText = 'R$ ' + income.toFixed(2);

        localStorage.setItem('balance', income);

        saveData();
    } else {
        alert('Por favor, insira um valor de renda válido (não negativo).');
    }
}

function editIncome() {
    document.getElementById('incomeForm').style.display = 'block';
    document.getElementById('incomeContainer').style.display = 'none';
}


function addExpense() {
    var description = document.getElementById('description').value;
    var amountInput = document.getElementById('amount');
    var amount = parseFloat(amountInput.value);

    if (description && !isNaN(amount) && amount >= 0) {
        var table = document.getElementById('expenseList');
        var newRow = table.insertRow(table.rows.length);
        var cell1 = newRow.insertCell(0);
        var cell2 = newRow.insertCell(1);
        var cell3 = newRow.insertCell(2);
        var cell4 = newRow.insertCell(3);

        cell1.innerHTML = description;
        cell2.innerHTML = 'R$ ' + amount.toFixed(2);
        cell3.innerHTML = '<button onclick="deleteExpense(this.parentNode)">Excluir</button>';

        var expenseDateTime = new Date();
        cell4.innerHTML = expenseDateTime.toLocaleString();

        var storedData = localStorage.getItem('expenseData');
        var expensesData = storedData ? JSON.parse(storedData) : [];

        expensesData.push({
            description: description,
            amount: amount,
            datetime: expenseDateTime.toLocaleString() 
        });

        localStorage.setItem('expenseData', JSON.stringify(expensesData));

        document.getElementById('description').value = '';
        amountInput.value = '';

        updateBalance();

    } else {
        alert('Por favor, preencha todos os campos corretamente e insira um valor válido (não negativo) para despesa.');
    }
}



function updateBalance() {
    var totalExpenses = calculateTotalExpenses();
    var balance = income - totalExpenses;
    document.getElementById('balanceAmount').innerText = 'R$ ' + balance.toFixed(2);
}

function calculateTotalExpenses() {
    var table = document.getElementById('expenseList');
    var totalExpenses = 0;

    for (var i = 0; i < table.rows.length; i++) {
        var amount = parseFloat(table.rows[i].cells[1].innerHTML.replace('R$ ', ''));
        totalExpenses += amount;
    }

    return totalExpenses;
}

function saveToFile() {
    var table = document.getElementById('expenseList');
    var expensesData = {};

    for (var i = 0; i < table.rows.length; i++) { 
        var cells = table.rows[i].cells;

        var description = cells[0].innerText;
        var amount = parseFloat(cells[1].innerText.replace('R$ ', ''));
        var datetimeString = cells[3].innerText;
        

        console.log('Description:', description);
        console.log('Amount:', amount);
        console.log('Datetime:', datetimeString);

        var datetime = parseDateTime(datetimeString);

        console.log('Parsed Datetime:', datetime);

        if (datetime !== null) {
            var monthYearKey = (datetime.getMonth() + 1) + '/' + datetime.getFullYear();

            if (!expensesData[monthYearKey]) {
                expensesData[monthYearKey] = [];
            }

            expensesData[monthYearKey].push({
                description: description,
                amount: amount,
                datetime: datetime.toLocaleString()
            });
        } else {
            console.error('Invalid Datetime:', datetimeString);
        }
    }

    var dataToSave = {
        income: income,
        expenses: expensesData,
        creditCards: creditCards
    };

    var textToSave = JSON.stringify(dataToSave, null, 2);
    var blob = new Blob([textToSave], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'expenses.txt';
    a.click();
}

function parseDateTime(datetimeString) {
    var match = datetimeString.match(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/);

    if (!match) {
        return null;
    }

    var [, day, month, year, hour, minute, second] = match;

    return new Date(year, month - 1, day, hour, minute, second);
}



function saveCreditCardsToFile() {
    var creditCardData = localStorage.getItem('creditCards');
    var creditCards = creditCardData ? JSON.parse(creditCardData) : [];
    var data = {
        income: income,
        creditCards: creditCards
    };

    var textToSave = JSON.stringify(data, null, 2);
    var blob = new Blob([textToSave], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'creditCards.txt';
    a.click();
}

function loadFromFile() {
    var input = document.createElement('input');
    input.type = 'file';

    input.addEventListener('change', function (event) {
        var file = event.target.files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = JSON.parse(e.target.result);

                if (data.hasOwnProperty('income')) {
                    income = parseFloat(data.income) || 0;
                }

                if (data.hasOwnProperty('expenses')) {
                    var table = document.getElementById('expenseList');
                    table.innerHTML = '';

                    for (var monthYearKey in data.expenses) {
                        data.expenses[monthYearKey].forEach(function (item) {
                            addExpenseToTable(item.description, item.amount, item.datetime);
                        });
                    }
                }

                if (data.hasOwnProperty('creditCards') && Array.isArray(data.creditCards)) {
                    creditCards = data.creditCards;
                    updateCreditCardDisplay();
                }

                updateBalance();
                saveData();
            };

            reader.readAsText(file);
        }
    });

    input.click();
}




function deleteExpense(button) {
    var row = button.closest('tr'); 
    var table = document.getElementById('expenseList');

  
    if (row && row.parentNode === table) {
        console.log('Linha a ser excluída:', row);

        row.parentNode.removeChild(row);

        updateBalance();

        saveData();
    } else {
        console.error('A linha não pertence à tabela. Não foi possível excluir a despesa.');
    }
}






function clearAll() {
    var table = document.getElementById('expenseList');
    table.innerHTML = '';

    localStorage.removeItem('expenseData');

    updateBalance();

    saveData();
}

function saveData() {
    var table = document.getElementById('expenseList');
    var data = [];

    for (var i = 0; i < table.rows.length; i++) {
        var description = table.rows[i].cells[0].innerHTML;
        var amount = parseFloat(table.rows[i].cells[1].innerHTML.replace('R$ ', ''));
        var datetime = table.rows[i].cells[3].innerHTML; 
        data.push({ description: description, amount: amount, datetime: datetime });
    }

    localStorage.setItem('expenseData', JSON.stringify(data));

    updateTable();
}


window.onload = function() {
    var storedBalance = localStorage.getItem('balance');
    if (storedBalance) {
        income = parseFloat(storedBalance) || 0;
    }
    var storedData = localStorage.getItem('expenseData');
    var expensesData = storedData ? JSON.parse(storedData) : [];   

    var storedCreditCards = localStorage.getItem('creditCards');
    if (storedCreditCards) {
        creditCards = JSON.parse(storedCreditCards);
        updateCreditCardDisplay();

        displayTotalCreditLimit();
    }

    updateTable();

    updateBalance();
};

function addExpenseToTable(description, amount, datetime) {
    var table = document.getElementById('expenseList');
    var newRow = table.insertRow(table.rows.length);
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    var cell4 = newRow.insertCell(3);

    cell1.innerHTML = description;
    cell2.innerHTML = 'R$ ' + amount.toFixed(2);
    cell4.innerHTML = datetime || new Date().toLocaleString();
    cell3.innerHTML = '<button onclick="deleteExpense(this.parentNode)">Excluir</button>';
    cell4.setAttribute('data-month', new Date(datetime).getMonth() + 1);

    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
}



function editExpense(row) {
    var description = row.cells[0].innerHTML;
    var amount = parseFloat(row.cells[1].innerHTML.replace('R$ ', ''));

    var newDescription = prompt('Editar Descrição:', description);
    var newAmount = parseFloat(prompt('Editar Valor:', amount.toFixed(2)));

    if (newDescription !== null && !isNaN(newAmount) && newAmount >= 0) {
        row.cells[0].innerHTML = newDescription;
        row.cells[1].innerHTML = 'R$ ' + newAmount.toFixed(2);
    }

    updateBalance();

    saveData();
}

function updateTable() {
    var storedData = localStorage.getItem('expenseData');

    if (storedData) {
        var data = JSON.parse(storedData);

        var table = document.getElementById('expenseList');
        table.innerHTML = '';

        data.forEach(function (item) {
        addExpenseToTable(item.description, item.amount, item.datetime);
    });
    }
}


var creditCards = [];

function openCreditCardModal() {
    var modal = document.getElementById('creditCardModal');
    modal.style.display = 'flex';
}

function closeCreditCardModal() {
    var modal = document.getElementById('creditCardModal');
    modal.style.display = 'none';
}

function addCreditCardExpense(currentExpense, bank) {
    addExpenseToTable(bank, currentExpense, new Date().toLocaleString()); 

    updateBalance();

    saveData();
}

function addCreditCard() {
    var bankSelect = document.getElementById('bank');
    var limitInput = document.getElementById('limit');
    var currentExpenseInput = document.getElementById('currentExpense');

    var bank = bankSelect.value;
    var limit = parseFloat(limitInput.value) || 0;
    var currentExpense = parseFloat(currentExpenseInput.value) || 0;

    if (bank && !isNaN(limit) && limit >= 0 && !isNaN(currentExpense) && currentExpense >= 0) {
        var imgPath = `img/${bank.toLowerCase()}.png`;

        creditCards.push({ bank: bank, limit: limit, currentExpense: currentExpense, imgPath: imgPath });

        bankSelect.value = '';
        limitInput.value = '';
        currentExpenseInput.value = '';

        closeCreditCardModal();

        addCreditCardExpense(currentExpense, bank);

        updateCreditCardDisplay();

        displayTotalCreditLimit();

        saveCreditCardsToLocal();
    } else {
        alert('Por favor, preencha todos os campos corretamente e insira valores válidos (não negativos) para limite e gasto atual.');
    }
}




function saveCreditCardsToLocal() {
    localStorage.setItem('creditCards', JSON.stringify(creditCards));
}



function updateCreditCardDisplay() {
    var creditCardContainer = document.getElementById('creditCardContainer');
    creditCardContainer.innerHTML = '';

    creditCards.forEach(function (card) {
        var cardElement = document.createElement('div');
        cardElement.innerHTML = `<strong>${card.bank}</strong><br>Limite: R$ ${card.limit.toFixed(2)}<br>Gasto Atual: R$ ${card.currentExpense.toFixed(2)}<br><br>`;
        creditCardContainer.appendChild(cardElement);
    });
}

function displayTotalCreditLimit() {
    var totalLimit = creditCards.reduce(function (accumulator, card) {
        return accumulator + card.limit;
    }, 0);

    var totalLimitElement = document.getElementById('totalCreditLimit');
    totalLimitElement.innerText = 'Limite Total: R$ ' + totalLimit.toFixed(2);

    localStorage.setItem('totalCreditLimit', totalLimit.toFixed(2));
}



var storedCreditCards = localStorage.getItem('creditCards');
if (storedCreditCards) {
    creditCards = JSON.parse(storedCreditCards);
    updateCreditCardDisplay();
}

function saveCreditCards() {
    localStorage.setItem('creditCards', JSON.stringify(creditCards));

    var storedData = localStorage.getItem('expenseData');
    var expensesData = storedData ? JSON.parse(storedData) : [];

    var data = {
        income: income,
        expenses: expensesData,
        creditCards: creditCards
    };

    var textToSave = JSON.stringify(data, null, 2);
    var blob = new Blob([textToSave], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'expenses.txt';
    a.click();
}

function removeCreditCard(index) {
    removeExpensesByCard(creditCards[index].bank);

    creditCards.splice(index, 1);

    updateCreditCardDisplay();

    displayTotalCreditLimit();

    saveCreditCardsToLocal();
}

function removeExpensesByCard(cardBank) {
    var table = document.getElementById('expenseList');
    for (var i = table.rows.length - 1; i >= 0; i--) {
        var description = table.rows[i].cells[0].innerHTML;
        if (description === cardBank) {
            table.deleteRow(i);
        }
    }

    updateBalance();

    saveData();
}


function updateCreditCardDisplay() {
    var creditCardContainer = document.getElementById('creditCardContainer');
    creditCardContainer.innerHTML = '';

    creditCards.forEach(function (card, index) {
        var cardElement = document.createElement('div');
        cardElement.id = 'card';
        cardElement.innerHTML = `<strong>${card.bank}</strong><br>Limite: R$ ${card.limit.toFixed(2)}<br>Gasto Atual: R$ ${card.currentExpense.toFixed(2)}<br>`;

        var containerElement = document.createElement('div');

        var imgElement = document.createElement('img');
        imgElement.src = card.imgPath;
        imgElement.alt = card.bank;

        var buttonElement = document.createElement('button');
        buttonElement.setAttribute('onclick', `removeCreditCard(${index})`);
        buttonElement.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        containerElement.appendChild(imgElement);
        containerElement.appendChild(buttonElement);

        cardElement.appendChild(containerElement);

        creditCardContainer.appendChild(cardElement);
    });
}


function filterByMonth() {
    var selectedMonth = document.getElementById('monthFilter').value;
    var table = document.getElementById('expenseList');
    var rows = table.getElementsByTagName('tr');

    for (var i = 1; i < rows.length; i++) {
        var cell = rows[i].getElementsByTagName('td')[3];  
        var monthYearKey = cell.getAttribute('data-month');

        if (selectedMonth === '0' || monthYearKey === selectedMonth) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}



function clearMonthFilter() {
    document.getElementById('monthFilter').value = '0';
    filterByMonth();
}
