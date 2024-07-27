const assert = require('assert');
const Money = require('./money');
const Portfolio = require('./portfolio');
const Bank = require('./bank');

class MoneyTest {
    setUp() {
        this.bank = new Bank();
        this.bank.addExchangeRate("EUR", "USD", 1.2);
        this.bank.addExchangeRate("USD", "KRW", 1100);
    }
    
    getAllTestMethods() {
        let moneyPrototype = MoneyTest.prototype;
        let allProps = Object.getOwnPropertyNames(moneyPrototype);
        let testMethods = allProps.filter(p => {
            return typeof moneyPrototype[p] === 'function' && p.startsWith("test");
        });
        return testMethods;
    }

    // 한 테스트가 다른 테스트에 미치는 원치 않는 부작용 확인
    randomizeTestOrder(testMethods) {
        for (let i = testMethods.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [testMethods[i], testMethods[j]] = [testMethods[j], testMethods[i]];
        }
        return testMethods;
    }

    testMultiplication() {
        let tenEuros = new Money(10, "EUR");
        let twentyEuros = new Money(20, "EUR");
        assert.deepStrictEqual(tenEuros.times(2), twentyEuros);
    }

    testDivision() {
        let originalMoney = new Money(4002, "KRW");
        let actualMoneyAfterDivision = originalMoney.divide(4);
        let expectedMoneyAfterDivision = new Money(1000.5, "KRW");
        assert.deepStrictEqual(actualMoneyAfterDivision, expectedMoneyAfterDivision);
    }

    testAddition() {
        let fiveDollars = new Money(5, "USD");
        let tenDollars = new Money(10, "USD");
        let fifteenDollars = new Money(15, "USD");
        let portfolio = new Portfolio();
        portfolio.add(fiveDollars, tenDollars);
        assert.deepStrictEqual(portfolio.evaluate(this.bank,"USD"), fifteenDollars);
    }

    testAdditionOfDollarsAndEuros() {
        let fiveDollars = new Money(5, "USD");
        let tenEuros = new Money(10, "EUR");
        let portfolio = new Portfolio();
        portfolio.add(fiveDollars, tenEuros);
        let expectedValue = new Money(17, "USD");
        assert.deepStrictEqual(portfolio.evaluate(this.bank, "USD"), expectedValue);
    }

    testAdditionOfDollarsAndWons() {
        let oneDollar = new Money(1, "USD");
        let elevenHundredWon = new Money(1100, "KRW");
        let portfolio = new Portfolio();
        portfolio.add(oneDollar, elevenHundredWon);
        let expectedValue = new Money(2200, "KRW");
        assert.deepStrictEqual(portfolio.evaluate(this.bank, "KRW"), expectedValue);
    }

    testAdditionWithMultipleMissingExchangeRates() {
        let oneDollar = new Money(1, "USD");
        let oneEuro = new Money(1, "EUR");
        let oneWon = new Money(1, "KRW");
        let portfolio = new Portfolio();
        portfolio.add(oneDollar, oneEuro, oneWon);
        let expectedError = new Error(
            "Missing exchange rate(s):[USD->Kalganid,EUR->Kalganid,KRW->Kalganid]");
        ////////////////////////////////////////
        // 이렇게 "할 수" 있지만 하지 않는다!
        ////////////////////////////////////////
        // let bank = this.bank;
        // assert.throws(function() {portfolio.evaluate(bank, "Kalganid")}, expectedError)
        assert.throws(() => portfolio.evaluate(this.bank, "Kalganid"), expectedError);
        // 익명 함수를 사용하면 this가 익명함수 스코프에 바인딩 됨
        // 화살표 함수를 사용하면 this가 상위함수 스코프에 바인딩
    }

    testConversionWithDifferentRatesBetweenTwoCurrencies() {
        let tenEuros = new Money(10, "EUR");
        assert.deepStrictEqual(
            this.bank.convert(tenEuros, "USD"), new Money(12, "USD"));
        this.bank.addExchangeRate("EUR", "USD", 1.3);
        assert.deepStrictEqual(
            this.bank.convert(tenEuros, "USD"), new Money(13, "USD"));
    }

    testConversionWithMissingExchangeRate() {
        let tenEuros = new Money(10, "EUR");
        let expectedError = new Error("EUR->Kalganid");
        assert.throws(() => {this.bank.convert(tenEuros, "Kalganid");},
            expectedError);
    }

    testAdditionWithTestDouble() {
        const moneyCount = 10;
        let moneys = [];
        for (let i = 0; i < moneyCount; i++) {
            moneys.push(
                new Money(Math.random(Number.MAX_SAFE_INTEGER), "Does Not Matter")
            );
        }
        let bank = {   // 테스트 더블
            convert: function() {
                return new Money(Math.PI, "Kalganid");
            }
        };
        let arbitraryResult = new Money(moneyCount * Math.PI, "Kalganid");

        let portfolio = new Portfolio();
        portfolio.add(...moneys);
        assert.deepStrictEqual(
            portfolio.evaluate(bank, "Kalganid"), arbitraryResult
        );
    }

    runAllTest() {
        let testMethods = this.getAllTestMethods();
        testMethods.forEach(m => {
            console.log("Running: %s()", m);
            let method = Reflect.get(this, m);
            try {
                this.setUp();
                Reflect.apply(method, this, []);
            } catch (e) {
                if (e instanceof assert.AssertionError) {
                    console.log(e);
                } else {
                    throw e;
                }
            }
            
        });
    }
}

new MoneyTest().runAllTest();