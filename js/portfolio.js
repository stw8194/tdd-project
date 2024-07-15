const Money = require("./money");

class Portfolid {
    constructor(moneys) {
        this.moneys = []
    }

    add(...money) {
        this.moneys = this.moneys.concat(money);
    }

    evaluate(currency) {
        let total = this.moneys.reduce( (sum, money) => {
            return sum + money.amount;
        }, 0);
        return new Money(total, currency)
    }
}

module.exports = Portfolid;