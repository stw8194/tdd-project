const Money = require("./money");

class Portfolio {
    constructor(moneys) {
        this.moneys = [];
    }

    add(...money) {
        this.moneys = this.moneys.concat(money);
    }

    evaluate(bank, currency) {
        let failures = [];
        let total = this.moneys.reduce( (sum, money) => {
            try {
                let convertedMoney = bank.convert(money, currency);
                return sum + convertedMoney.amount;
            }
            catch (error) {
                failures.push(error.message);
                return sum;
            }
        }, 0);
        if (!failures.length) {
            return new Money(total, currency);
        }
        throw new Error("Missing exchange rate(s):[" + failures.join() + "]");
    }
}

module.exports = Portfolio;