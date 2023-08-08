const baseUrl = "https://api.coingecko.com/api/v3";
let interval;

const displayError = () => {
  const main = document.getElementById("main");
  const alertTemplate = `  <div class="alert alert-danger" role="alert">
  <h4 class="alert-heading">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>

    Something went wrong.
  </h4>
  <p>Sorry for inconvenience.</p>
  <hr />
  <p class="mb-0">Please try again later.</p>
</div>`;
  main.innerHTML = alertTemplate;
};

const fetchCoins = async () => {
  const res = await fetch(`${baseUrl}/coins/markets?vs_currency=btc`);
  return res.json();
};
const fetchCurrenys = async () => {
  const res = await fetch(`${baseUrl}/simple/supported_vs_currencies`);
  return res.json();
};

const displayCoin = (res, currency) => {
  const lastUpdated = res.last_updated.split("T").join(" ");
  const imageUrl = res.image.thumb;
  const { name } = res;
  const marketCap = res.market_data.market_cap[currency].toLocaleString();
  const price = res.market_data.current_price[currency].toLocaleString();
  const change24 = res.market_data.price_change_24h_in_currency[currency];
  let changeTextColor = change24 > 0 ? "text-success" : "text-danger";
  const tableTamplate = `<table class="table text-light" >
  <thead>
    <tr>
      <th scope="col"></th>
      <th scope="col">Property</th>
      <th scope="col">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><img src=${imageUrl} alt="icon"></th>
      <td>Name</td>
      <td>${name}</td>
    </tr>
    <tr>
      <th scope="row"></th>
      <td>Price (${currency.toUpperCase()})</td>
      <td>${price}</td>
    </tr>
    <tr>
      <th scope="row"></th>
      <td>Change (24hrs)</td>
      <td class=${changeTextColor}>${change24}</td>
    </tr>
    <tr>
      <th scope="row"></th>
      <td>Last updated</td>
      <td>${lastUpdated}</td>
    </tr>
    <tr>
    <th scope="row"></th>
    <td>Market cap (${currency.toUpperCase()})</td>
    <td>${marketCap}</td>
  </tr>
  </tbody>
</table>`;
  const section = document.getElementById("coin-data");

  section.innerHTML = tableTamplate;
};

const displayCoinOptions = async () => {
  try {
    const options = await fetchCoins();
    const dropdownCoin = document.getElementById("coin");

    options.forEach((ele) => {
      const newOption = document.createElement("option");
      newOption.value = ele.id;
      newOption.text = ele.name;
      if (dataLocalStorage) {
        const { name } = JSON.parse(dataLocalStorage)[0];
        if (ele.name === name) newOption.selected = true;
      }
      dropdownCoin.appendChild(newOption);
    });
  } catch (err) {
    displayError();
  }
};
const displayCurrencyOptions = async () => {
  try {
    const options = await fetchCurrenys();
    const dropdownCurrency = document.getElementById("currency");

    options.forEach((ele) => {
      const newOption = document.createElement("option");
      newOption.value = ele;
      newOption.text = ele.toUpperCase();
      if (dataLocalStorage) {
        const currency = JSON.parse(dataLocalStorage)[1];
        if (ele === currency) newOption.selected = true;
      }

      dropdownCurrency.appendChild(newOption);
    });
  } catch (err) {
    displayError();
  }
};
const intervalHandler = (id, currency) => {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => fetchCoin(id, currency), 30000);
};
const fetchCoin = (id, currency) => {
  fetch(`${baseUrl}/coins/${id}`)
    .then((res) => res.json())
    .then((res) => {

      displayCoin(res, currency);
      localStorage.setItem("data", JSON.stringify([res, currency]));
    })
    .catch((err) => displayError());
  intervalHandler(id, currency);
};

const dataLocalStorage = localStorage.getItem("data");
if (dataLocalStorage) {
  const [res, currency] = JSON.parse(dataLocalStorage);
  fetchCoin(res.id, currency);
}
displayCoinOptions();
displayCurrencyOptions();

const onSubmit = (event) => {
  event.preventDefault();
  const coinId = document.getElementById("coin").value;
  const currency = document.getElementById("currency").value;
  fetchCoin(coinId, currency);
};

const form = document.getElementById("form-crypto");
form.addEventListener("submit", onSubmit);
