document.addEventListener('DOMContentLoaded', () => {

  const URI = 'https://psa-api-pagos.herokuapp.com';
  //const URI = 'http://localhost:8080';

  // global vars
  var allWallets = {};
  var cbuToDelete;
  
  // materialize setup
  M.AutoInit();

  var elemsAutocomplete = document.querySelectorAll('.autocomplete');
  var instancesAutocomplete = M.Autocomplete.init(elemsAutocomplete, {
    data:{
      "Meli": './icons/mercadopago.png',
      "Brubank": './icons/brubank.png',
      "Galicia": './icons/galicia.png',
      "Uala": './icons/uala.jpg'
    }
  });

  // dom
  const buttonCreate = document.querySelector('#create-wallet');
  const walletCollection = document.querySelector('#wallet-collection');
  const form = document.querySelector('form');
  const saldo = document.querySelector('#show-saldo');
  const acceptDeleteButton = document.querySelector('#confirmacion-eliminar');

  // listeners
  buttonCreate.addEventListener('click', e => {

    e.preventDefault();
    createWallet(`${URI}/accounts/`);
    showWallets(`${URI}/accounts/`);
    
  });

  walletCollection.addEventListener('click', e => {
    if(e.target.textContent === 'delete' ) {
      var id = e.target.offsetParent.id;
      allWallets.forEach(wallet => {
        if(wallet.id==id){
          cbuToDelete = wallet.cbu;
        }
      });
    };
  });

  acceptDeleteButton.addEventListener('click', e => {
    deleteWallet(cbuToDelete);
  });

  // functions
  const createWallet = (URI) => {

    const walletName = form['wallet-name'].value;
    const cbuOrId = form['cbu-or-id'].value;
    const currencySelection = form['currency-selection'].value;
    const currency = ["ARS", "USD", "BTC"]; // problema a resolver queda debilmente acomplado al form

    const body = {
      "balance": getBalance(cbuOrId),
      "name": walletName,
      "cbu": cbuOrId,
      "currency": currency[currencySelection]
    };

    fetch(URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(resp => console.log(resp))
    .catch(err => console.log(err));

    // clean form
    form['wallet-name'].value = '';
    form['cbu-or-id'].value = '';
    form['currency-selection'].value = 0;
  };

  const showWallets = (URI) => {

    // clear front
    walletCollection.innerHTML = '';

    // sum wallets
    const wallet = {"ARS":0, "USD":0, "BTC":0};

    fetch(URI)
      .then(resp=> resp.json())
      .then(data => {
        allWallets = data;
        data.forEach(arr => {
          parseWallets(arr);
          wallet[arr.currency] += arr.balance;
        });
        showSaldo(wallet);
      }).catch(err => console.log(err));
  };

  const parseWallets = (arr) => {
    const template = `
    <li class="collection-item avatar">
    <i class="material-icons circle deep-purple">account_balance_wallet</i>
    <span class="title">${arr.name}</span>
    <p>Saldo: ${Math.round(arr.balance)} ${arr.currency}</p>
    <p>Cbu: ${arr.cbu}</p>
    <a href="#confirmacion" id="${arr.id}" class="secondary-content modal-trigger"><i class="material-icons deep-purple-text">delete</i></a>
    </li>
    `;
    walletCollection.innerHTML += template;
  }

  const deleteWallet = (cbu) => {

    console.log(cbu + " Ha sido eliminado");
    fetch(`${URI}/accounts/${cbu}/`, {
      method:'DELETE'
    }).then(resp => showWallets(`${URI}/accounts/`));
    
  };

  const getBalance = (id) => {
    return Math.round(Math.random()*id)*10
  };

  const showSaldo = (objectWallet) => {
    const saldoTotal = Math.round(objectWallet["ARS"]*0.01 + objectWallet["USD"] + objectWallet["BTC"]*0.000016);
    const template = `
    <div class="collapsible-header deep-purple lighten-5"><h5>Tu saldo es ≈$${saldoTotal}</h5></div>
    <div class="collapsible-body"><span>$ARS ${objectWallet["ARS"]}</span></div>
    <div class="collapsible-body"><span>$UDS ${objectWallet["USD"]}</span></div>
    <div class="collapsible-body"><span>${objectWallet["BTC"]} BTC</span></div>
    `;
    saldo.innerHTML = template;
  };

  // app setup
  showWallets(`${URI}/accounts`);

});
