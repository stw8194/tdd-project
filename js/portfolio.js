const Money = require("./money");

class Portfolio {
    constructor(moneys) {
        this.moneys = []
    }

    add(...money) {
        this.moneys = this.moneys.concat(money);
    }

    convert(money, currency) {
        let exchangeRates = new Map();
        exchangeRates.set("EUR->USD", 1.2);
        exchangeRates.set("USD->KRW", 1100);
        if (money.currency === currency) {
            return money.amount;
        }
        let key = money.currency + "->" + currency;
        return money.amount * exchangeRates.get(key);
    }

    evaluate(currency) {
        let total = this.moneys.reduce( (sum, money) => {
            return sum + this.convert(money, currency);
        }, 0);
        return new Money(total, currency)
    }
}

module.exports = Portfolio;