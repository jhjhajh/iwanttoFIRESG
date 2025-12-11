let portfolioChartInstance = null, liquidChartInstance = null, cpfChartInstance = null;
let investmentIndex = 0, purchaseIndex = 0, monthlyInvIndex = 0, cpfisIndex = 0, annualExpIndex = 0;

// ... (getCPFRates and getCPFWageCeiling remain same)
function getCPFRates(age) {
    if (age <= 35) return { OA: 0.23, SA: 0.06, MA: 0.08, Employee: 0.20, Total: 0.37 };
    if (age <= 45) return { OA: 0.21, SA: 0.07, MA: 0.09, Employee: 0.20, Total: 0.37 };
    if (age <= 50) return { OA: 0.19, SA: 0.08, MA: 0.10, Employee: 0.20, Total: 0.37 };
    if (age <= 55) return { OA: 0.15, SA: 0.115, MA: 0.105, Employee: 0.20, Total: 0.37 };
    if (age <= 60) return { OA: 0.12, SA: 0.035, MA: 0.105, Employee: 0.13, Total: 0.26 }; // Dropped
    if (age <= 65) return { OA: 0.035, SA: 0.025, MA: 0.105, Employee: 0.075, Total: 0.165 };
    if (age <= 70) return { OA: 0.01, SA: 0.01, MA: 0.105, Employee: 0.05, Total: 0.125 };
    return { OA: 0.01, SA: 0.01, MA: 0.105, Employee: 0.05, Total: 0.125 };
}

// Return { ceiling: number }
// OW Ceiling 2024: 6800. 2025: 7400. 2026: 8000.
// We'll approximate using 8000 for long term projection to be simple/optimistic, or use logic.
// Let's use 8000 as the steady state.
function getCPFWageCeiling(year) {
    return 8000;
}

document.getElementById('dob').addEventListener('change', function () {
    const dob = new Date(this.value);
    if (isNaN(dob.getTime())) return;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    document.getElementById('calculatedAge').textContent = `Current Age: ${age}`;
    updateCalculation();
});

// Helper to add monthly investments
function addMonthlyInvestment() {
    monthlyInvIndex++;
    const html = `
                <div class="item-row" id="minv-${monthlyInvIndex}">
                     <input type="text" placeholder="e.g. ETF DCA" class="mInvName">
                     <input type="number" placeholder="S$/mth" class="mInvAmount" min="0">
                     <input type="number" placeholder="Proj. Return %" class="mInvReturn" min="0" max="30" step="0.1">
                     <button type="button" onclick="removeMonthlyInvestment(${monthlyInvIndex})" class="remove-btn">×</button>
                </div>
            `;
    document.getElementById('monthlyInvestmentsList').insertAdjacentHTML('beforeend', html);
}
function removeMonthlyInvestment(id) {
    const el = document.getElementById(`minv-${id}`);
    if (el) el.remove();
}

function addInvestment() {
    investmentIndex++;
    const html = `
                <div class="item-row" id="inv-${investmentIndex}">
                    <input type="text" placeholder="e.g., CSPX" class="invName">
                    <input type="number" placeholder="Current (S$)" class="invAmount" min="0">
                    <input type="number" placeholder="Annual return (%)" class="invReturn" min="0" max="30" step="0.1">
                    <button type="button" onclick="removeInvestment(${investmentIndex})" class="remove-btn">×</button>
                </div>
            `;
    document.getElementById('investmentItems').insertAdjacentHTML('beforeend', html);
}

function removeInvestment(id) {
    const el = document.getElementById(`inv-${id}`);
    if (el) el.remove();
}

function addPurchase() {
    purchaseIndex++;
    const html = `
                <div class="item-row" id="purch-${purchaseIndex}">
                    <input type="text" placeholder="e.g., Car" class="purchDesc">
                    <input type="number" placeholder="Age" class="purchAge" min="0" max="120">
                    <input type="number" placeholder="Amount (S$)" class="purchAmount" min="0">
                    <button type="button" onclick="removePurchase(${purchaseIndex})" class="remove-btn">×</button>
                </div>
            `;
    document.getElementById('purchasesList').insertAdjacentHTML('beforeend', html);
}

function removePurchase(id) {
    const el = document.getElementById(`purch-${id}`);
    if (el) el.remove();
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tab).classList.add('active');
}

function formatCurrency(value) {
    return 'S$ ' + Math.round(value).toLocaleString('en-SG');
}

document.getElementById('hasInvestments').addEventListener('change', function () {
    document.getElementById('investmentsList').style.display = this.checked ? 'block' : 'none';
});
function addCPFISPortfolio() {
    cpfisIndex++;
    const html = `
                <div class="item-row" id="cpfis-${cpfisIndex}" style="grid-template-columns: 1fr 0.8fr 0.8fr 0.6fr 40px;">
                     <input type="text" placeholder="Name" class="cpfisName">
                     <select class="cpfisSource">
                        <option value="OA">OA</option>
                        <option value="SA">SA</option>
                     </select>
                     <input type="number" placeholder="S$/mth" class="cpfisAmount" min="0">
                     <input type="number" placeholder="Ret %" class="cpfisReturn" min="0" max="30" step="0.1">
                     <button type="button" onclick="removeCPFISPortfolio(${cpfisIndex})" class="remove-btn">×</button>
                </div>
            `;
    document.getElementById('cpfisList').insertAdjacentHTML('beforeend', html);
}
function removeCPFISPortfolio(id) {
    const el = document.getElementById(`cpfis-${id}`);
    if (el) el.remove();
}

function addAnnualExpense() {
    annualExpIndex++;
    const html = `
                <div class="item-row" id="annExp-${annualExpIndex}" style="grid-template-columns: 1fr 0.5fr 0.5fr 0.8fr 40px;">
                     <input type="text" placeholder="Desc" class="annExpName">
                     <input type="number" placeholder="Start Age" class="annExpStart" min="0">
                     <input type="number" placeholder="End Age" class="annExpEnd" min="0">
                     <input type="number" placeholder="Amount/yr" class="annExpAmount" min="0">
                     <button type="button" onclick="removeAnnualExpense(${annualExpIndex})" class="remove-btn">×</button>
                </div>
            `;
    document.getElementById('annualExpensesList').insertAdjacentHTML('beforeend', html);
}
function removeAnnualExpense(id) {
    const el = document.getElementById(`annExp-${id}`);
    if (el) el.remove();
}

// ... (existing helper functions) ...

document.getElementById('addCPFTopups').addEventListener('change', function () {
    document.getElementById('cpfTopupSection').style.display = this.checked ? 'block' : 'none';
    updateCalculation();
});
document.getElementById('hasAnnualExpenses').addEventListener('change', function () {
    document.getElementById('annualExpensesSection').style.display = this.checked ? 'block' : 'none';
});
document.getElementById('hasPurchases').addEventListener('change', function () {
    document.getElementById('purchasesSection').style.display = this.checked ? 'block' : 'none';
});
document.getElementById('hasMonthlyInvestments').addEventListener('change', function () {
    document.getElementById('monthlyInvestmentsSection').style.display = this.checked ? 'block' : 'none';
});
document.getElementById('hasMortgage').addEventListener('change', function () {
    document.getElementById('mortgageSection').style.display = this.checked ? 'block' : 'none';
    updateCalculation();
});
document.getElementById('mortgageSource').addEventListener('change', function () {
    document.getElementById('mortgageCPFPortionGroup').style.display = (this.value === 'mixed') ? 'block' : 'none';
    updateCalculation();
});
document.getElementById('mortgageCPFPortion').addEventListener('input', updateCalculation);


document.getElementById('expenseChangeAtFire').addEventListener('change', function () {
    document.getElementById('postFireExpenseGroup').style.display = this.checked ? 'block' : 'none';
    updateCalculation();
});

// ----------------------------------------------------
// LOGIC HELPERS
// ----------------------------------------------------

// 1. Retirement Sums Projection (3.5% growth assumptions)
function getProjectedRetirementSums(birthYear) {
    const yearTurning55 = birthYear + 55;
    const baselineYear = 2025;
    const baselineBRS = 106500;

    // If already turned 55 before 2025, use historical (simplified, or just cap at 2025 level is safer/simpler for now if user is old)
    // If turning 55 after 2025:
    let yearsOfGrowth = Math.max(0, yearTurning55 - baselineYear);

    // Rate is 3.5%
    const growthRate = 0.035;

    const projectedBRS = baselineBRS * Math.pow(1 + growthRate, yearsOfGrowth);

    return {
        BRS: projectedBRS,
        FRS: projectedBRS * 2,
        ERS: projectedBRS * 4,
        yearTurning55: yearTurning55
    };
}

// 2. CPF Life Estimator
function estimateCPFLifePayout(raAmount, payoutAge, cohortFRS_55, planType) {
    // 1. Project the Benchmarks to Payout Age
    // The FRS/BRS targets are set at age 55. But by Payout Age (e.g. 65), 
    // the RA would have grown by interest (4%). We must compare RA@65 vs FRS@55_Compounded_to_65.

    // Default to 213000 if not provided
    const baseFRS_55 = cohortFRS_55 || 213000;

    // 2025 Payout Anchors (Standard) - Approximate
    let basePayoutFactor = 1.0;

    // Plan Adjustment
    // Standard: 1.0
    // Escalating: Starts ~20% lower, but grows. We return the *Initial* payout here.
    if (planType === 'escalating') {
        basePayoutFactor *= 0.80;
    }

    // Updated Anchors (Fixed 2025 values, no inflation scaling)
    const anchorBRS_Payout = 880 * basePayoutFactor;
    const anchorFRS_Payout = 1650 * basePayoutFactor;
    const anchorERS_Payout = 3050 * basePayoutFactor;

    // Compound the Sums to Payout Age (RA Interest ~4%)
    // If Payout Age is 65, sum grows for 10 years.
    const yearsGrowth = Math.max(0, payoutAge - 55);
    const compoundFactor = Math.pow(1.04, yearsGrowth);

    const targetBRS = (baseFRS_55 * 0.5) * compoundFactor;
    const targetFRS = baseFRS_55 * compoundFactor;
    const targetERS = (baseFRS_55 * 2.0) * compoundFactor;

    // Clamp RA at ERS to prevent unrealistic extrapolation
    raAmount = Math.min(raAmount, targetERS);

    // Interpolate
    let payout = 0;
    if (raAmount < targetBRS) {
        // Below BRS
        payout = (raAmount / targetBRS) * anchorBRS_Payout;
    } else if (raAmount < targetFRS) {
        // Between BRS and FRS
        const progress = (raAmount - targetBRS) / (targetFRS - targetBRS);
        payout = anchorBRS_Payout + (progress * (anchorFRS_Payout - anchorBRS_Payout));
    } else {
        // Above FRS
        const progress = (raAmount - targetFRS) / (targetERS - targetFRS);
        payout = anchorFRS_Payout + (progress * (anchorERS_Payout - anchorFRS_Payout));
    }

    return Math.round(payout);
}

// 3. Main Calculation Update
function updateCalculation() {
    const dobVal = document.getElementById('dob').value;
    // Calculate Age from DOB
    let currentAge = 0;
    let birthYear = 2000; // Default or placeholder
    if (dobVal) {
        const dob = new Date(dobVal);
        birthYear = dob.getFullYear();
        const today = new Date();
        let age = today.getFullYear() - birthYear;
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        currentAge = age;
    }

    const retirementAge = parseInt(document.getElementById('retirementAge').value) || 0;
    const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value) || 90;
    const inflation = (parseFloat(document.getElementById('inflation').value) || 0) / 100;

    if (!currentAge || !retirementAge) return;

    // INPUTS
    const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
    const employmentIncome = parseFloat(document.getElementById('employmentIncome').value) || 0;
    const otherIncome = parseFloat(document.getElementById('otherIncome').value) || 0;

    // EXPENSES SWITCHING
    const currentMonthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
    const expenseChangeAtFire = document.getElementById('expenseChangeAtFire').checked;
    const postFireMonthlyExpensesRaw = parseFloat(document.getElementById('postFireMonthlyExpenses').value) || 0;
    const postFireMonthlyExpenses = expenseChangeAtFire ? postFireMonthlyExpensesRaw : currentMonthlyExpenses;

    // Mortgage handling
    const hasMortgage = document.getElementById('hasMortgage').checked;
    const mortgagePayment = hasMortgage ? (parseFloat(document.getElementById('mortgagePayment').value) || 0) : 0;
    const mortgageEndAge = hasMortgage ? (parseInt(document.getElementById('mortgageEndAge').value) || 100) : 0;
    const mortgageSource = document.getElementById('mortgageSource').value;
    const mortgageCPFPortion = hasMortgage && mortgageSource === 'mixed' ? (parseFloat(document.getElementById('mortgageCPFPortion').value) || 0) : 0;

    const salaryGrowth = (parseFloat(document.getElementById('salaryGrowth').value) || 0) / 100;
    const annualBonus = parseFloat(document.getElementById('annualBonus').value) || 0;

    // ADVANCED CPF INPUTS
    const addTopups = document.getElementById('addCPFTopups').checked;
    const saCashTopup = addTopups ? (parseFloat(document.getElementById('saCashTopup').value) || 0) : 0;
    const maCashTopup = addTopups ? (parseFloat(document.getElementById('maCashTopup').value) || 0) : 0;
    const oaToSaTransfer = addTopups ? (parseFloat(document.getElementById('oaToSaTransfer').value) || 0) : 0;
    const otherOAMonthly = addTopups ? (parseFloat(document.getElementById('otherOAMonthly').value) || 0) : 0;

    // CPFIS Portfolios
    let cpfisPortfolios = [];
    if (addTopups) {
        document.querySelectorAll('#cpfisList .item-row').forEach(row => {
            const name = row.querySelector('.cpfisName').value;
            const source = row.querySelector('.cpfisSource').value;
            const amount = parseFloat(row.querySelector('.cpfisAmount').value) || 0;
            const returnRate = (parseFloat(row.querySelector('.cpfisReturn').value) || 0) / 100;
            if (name && amount > 0) cpfisPortfolios.push({ name, source, amount, returnRate, balance: 0 });
        });
    }

    // Annual Expenses
    let annualRecurringExps = [];
    if (document.getElementById('hasAnnualExpenses').checked) {
        document.querySelectorAll('#annualExpensesList .item-row').forEach(row => {
            const name = row.querySelector('.annExpName').value;
            const start = parseInt(row.querySelector('.annExpStart').value) || 0;
            const end = parseInt(row.querySelector('.annExpEnd').value) || 100;
            const amount = parseFloat(row.querySelector('.annExpAmount').value) || 0;
            if (amount > 0) annualRecurringExps.push({ name, start, end, amount });
        });
    }

    // Investments
    let investments = [];
    if (document.getElementById('hasInvestments').checked) {
        document.querySelectorAll('#investmentItems .item-row').forEach(row => {
            const name = row.querySelector('.invName').value;
            const amount = parseFloat(row.querySelector('.invAmount').value) || 0;
            const returnRate = (parseFloat(row.querySelector('.invReturn').value) || 0) / 100;
            if (name && amount > 0) investments.push({ name, amount, returnRate });
        });
    }

    // Purchases
    let purchases = [];
    if (document.getElementById('hasPurchases').checked) {
        document.querySelectorAll('#purchasesList .item-row').forEach(row => {
            const desc = row.querySelector('.purchDesc').value;
            const age = parseInt(row.querySelector('.purchAge').value) || 0;
            const amount = parseFloat(row.querySelector('.purchAmount').value) || 0;
            if (desc && age > 0 && amount > 0) purchases.push({ desc, age, amount });
        });
    }

    // Monthly Investments
    let monthlyInvestments = [];
    if (document.getElementById('hasMonthlyInvestments').checked) {
        document.querySelectorAll('#monthlyInvestmentsList .item-row').forEach(row => {
            const name = row.querySelector('.mInvName').value;
            const amount = parseFloat(row.querySelector('.mInvAmount').value) || 0;
            const returnRate = (parseFloat(row.querySelector('.mInvReturn').value) || 0) / 100;
            if (name && amount > 0) monthlyInvestments.push({ name, amount, returnRate, balance: 0 });
        });
    }

    const cpfLifePlan = document.getElementById('cpfLifePlan').value;
    const payoutAge = parseInt(document.getElementById('payoutAge').value) || 65;
    document.getElementById('cpfLifeStartAgeDisp').innerText = payoutAge;

    // ----------------------------------------
    // PROJECT COHORT RETIREMENT SUMS
    // ----------------------------------------
    const rs = getProjectedRetirementSums(birthYear);

    // Initialize
    let projectionData = [];
    let savings = currentSavings;
    let investmentBalances = investments.map(inv => ({ ...inv }));
    // Includes LifePremium for Bequest tracking
    let cpf = { OA: 0, SA: 0, MA: 0, RA: 0 };

    let cpfPayoutAmountMonthly = 0;

    let fireSuccess = true;
    let failureAge = null;
    let lowestLiquid = Infinity;

    const yearsToRetirement = retirementAge - currentAge;

    for (let year = 0; year <= (lifeExpectancy - currentAge); year++) {
        const age = currentAge + year;
        const isWorking = year < yearsToRetirement;

        // Start of Loop Logic

        // Track annual flows
        let totalMonthlyInvCost = 0;

        // 1. DETERMINE BASE EXPENSE FOR THIS YEAR
        // Apply switch logic
        let baseMonthlyExp = (age < retirementAge) ? currentMonthlyExpenses : postFireMonthlyExpenses;

        // Inflate
        const inflationFactor = Math.pow(1 + inflation, year);
        let annualLivingExp = baseMonthlyExp * 12 * inflationFactor;

        // 2. WORKING INCOME & CPF
        if (isWorking) {
            const empIncome = employmentIncome * Math.pow(1 + salaryGrowth, year);

            const rates = getCPFRates(age);
            const wageCeiling = getCPFWageCeiling(new Date().getFullYear() + year);
            const applicableWage = Math.min(empIncome, wageCeiling);

            const cpfDeduction = applicableWage * rates.Employee;
            const netMonthly = (empIncome + otherIncome) - cpfDeduction; // Cash in hand

            const annualOWSubjectToCPF = applicableWage * 12;
            const awCeiling = 102000 - annualOWSubjectToCPF;
            const bonusSubjectToCPF = Math.max(0, Math.min(annualBonus, awCeiling)); // Simplistic bonus
            const bonusCPFEmployee = bonusSubjectToCPF * rates.Employee;
            const bonusCPFEmployer = bonusSubjectToCPF * (rates.Total - rates.Employee);

            // Add to Cash Savings
            savings += (netMonthly * 12) + (annualBonus - bonusCPFEmployee);

            // Add to CPF
            cpf.OA += (applicableWage * rates.OA * 12);
            cpf.SA += (applicableWage * rates.SA * 12) + (addTopups ? saCashTopup : 0);
            cpf.MA += (applicableWage * rates.MA * 12) + (addTopups ? maCashTopup : 0);

            // Bonus CPF
            const totalBonusCPF = bonusCPFEmployee + bonusCPFEmployer;
            cpf.OA += totalBonusCPF * (rates.OA / rates.Total);
            cpf.SA += totalBonusCPF * (rates.SA / rates.Total);
            cpf.MA += totalBonusCPF * (rates.MA / rates.Total);

            // Deduct cash topups
            savings -= (addTopups ? (saCashTopup + maCashTopup) : 0);

            // Transfers
            if (addTopups && oaToSaTransfer > 0) {
                if (cpf.OA >= oaToSaTransfer) {
                    cpf.OA -= oaToSaTransfer;
                    cpf.SA += oaToSaTransfer;
                } else {
                    cpf.SA += cpf.OA;
                    cpf.OA = 0;
                }
            }

            // Monthly Investments
            for (let mInv of monthlyInvestments) {
                totalMonthlyInvCost = mInv.amount * 12;
                mInv.balance += totalMonthlyInvCost;
                savings -= totalMonthlyInvCost;
            }

            // CPFIS
            if (addTopups) {
                for (let p of cpfisPortfolios) {
                    const cost = p.amount * 12;
                    if (p.source === 'OA') {
                        if (cpf.OA >= cost) { cpf.OA -= cost; p.balance += cost; }
                    } else {
                        if (cpf.SA >= cost) { cpf.SA -= cost; p.balance += cost; }
                    }
                }
            }
        }

        // 3. CALCULATE TOTAL REQUIRED OUTFLOW (Living + Mortgage + Annual)
        let mortgageCashOut = 0;
        let mortgageCPFOut = 0;
        let annualRecurringTotal = 0;

        if (hasMortgage && age < mortgageEndAge) {
            const annualMortgage = mortgagePayment * 12;
            if (mortgageSource === 'cash') {
                mortgageCashOut = annualMortgage;
            } else if (mortgageSource === 'cpf') {
                mortgageCPFOut = annualMortgage;
            } else if (mortgageSource === 'mixed') {
                const validCPFPart = Math.min(mortgageCPFPortion, mortgagePayment);
                const cpfPart = validCPFPart * 12;
                mortgageCPFOut = cpfPart;
                mortgageCashOut = Math.max(0, annualMortgage - cpfPart);
            }
        }

        for (let exp of annualRecurringExps) {
            if (age >= exp.start && age <= exp.end) {
                annualRecurringTotal += exp.amount * Math.pow(1 + inflation, year);
            }
        }

        // Total Cash Need
        let totalCashNeed = annualLivingExp + mortgageCashOut + annualRecurringTotal;

        // 4. DEDUCT FROM CPF (Mortgage/Usage)
        if (mortgageCPFOut > 0) {
            if (cpf.OA >= mortgageCPFOut) {
                cpf.OA -= mortgageCPFOut;
            } else {
                const deficit = mortgageCPFOut - cpf.OA;
                cpf.OA = 0;
                totalCashNeed += deficit; // Spillover to cash
            }
        }
        if (isWorking && addTopups && otherOAMonthly > 0) {
            const annualOther = otherOAMonthly * 12;
            if (cpf.OA >= annualOther) {
                cpf.OA -= annualOther;
            } else {
                const deficit = annualOther - cpf.OA;
                cpf.OA = 0;
                savings -= deficit; // Direct hit to savings (assuming you pay anyway)
            }
        }

        // 5. GROWTH
        for (let inv of investmentBalances) inv.amount *= (1 + inv.returnRate);
        for (let mInv of monthlyInvestments) mInv.balance *= (1 + mInv.returnRate);
        for (let p of cpfisPortfolios) p.balance *= (1 + p.returnRate);

        cpf.OA *= 1.025;
        cpf.SA *= 1.04;
        cpf.MA *= 1.04;
        cpf.RA *= 1.04;

        // 6. CPF LIFE CREATION
        // RA CREATED AT 55
        if (age === 55) {
            cpf.RA = cpf.OA + cpf.SA;
            cpf.OA = 0;
            cpf.SA = 0;
        }

        // PAYOUT START & ESTIMATION
        if (age === payoutAge) {
            // Calculate Payout based on RA Balance
            cpfPayoutAmountMonthly = estimateCPFLifePayout(cpf.RA, payoutAge, rs.FRS, cpfLifePlan);
        }

        // PAYOUT ADJUSTMENTS & DEPLETION
        // Payouts come from RA (conceptually the "Premium").
        // User wants RA to drop slowly.
        if (age >= payoutAge) {
            // Growth on remaining RA (Interest is pooled but simplified here as RA growth)
            // The standard interest floor is 4%.
            if (cpf.RA > 0) {
                cpf.RA *= 1.04;
            }

            // Escalating Payout Logic
            if (cpfLifePlan === 'escalating' && age > payoutAge) {
                cpfPayoutAmountMonthly *= 1.02; // Increase monthly payout by 2%
            }

            // Deduct from RA (Depletion)
            const annualPayoutCost = cpfPayoutAmountMonthly * 12;
            cpf.RA -= annualPayoutCost;
            if (cpf.RA < 0) cpf.RA = 0; // Depleted, but payouts continue (Life)
        }

        // 7. PAY BILLS (OFFSET BY CPF PAYOUT)
        let annualPayout = 0;
        if (age >= payoutAge) {
            annualPayout = cpfPayoutAmountMonthly * 12;
            if (annualPayout >= totalCashNeed) {
                const surplus = annualPayout - totalCashNeed;
                savings += surplus; // Save surplus
                totalCashNeed = 0;
            } else {
                totalCashNeed -= annualPayout;
            }
        }

        // 8. DEDUCT REMAINING CASH NEED
        if (totalCashNeed > 0) {
            if (savings >= totalCashNeed) {
                savings -= totalCashNeed;
            } else {
                let remaining = totalCashNeed - savings;
                savings = 0;
                // Liquidate Inv
                for (let inv of investmentBalances) {
                    const draw = Math.min(inv.amount, remaining);
                    inv.amount -= draw;
                    remaining -= draw;
                    if (remaining <= 0.01) break;
                }
                if (remaining > 0.01) {
                    for (let mInv of monthlyInvestments) {
                        const draw = Math.min(mInv.balance, remaining);
                        mInv.balance -= draw;
                        remaining -= draw;
                        if (remaining <= 0.01) break;
                    }
                }
                if (remaining > 0.01) savings -= remaining; // Debt
            }
        }

        // 9. ONE OFF PURCHASES
        if (document.getElementById('hasPurchases').checked) {
            for (let p of purchases) {
                if (p.age === age) {
                    // Inflation on purchase? Usually user inputs "Today's cost".
                    // Let's assume input is Present Value -> Inflate.
                    const inflatedCost = p.amount * Math.pow(1 + inflation, year);
                    if (savings >= inflatedCost) {
                        savings -= inflatedCost;
                    } else {
                        let remain = inflatedCost - savings;
                        savings = 0;
                        // Liquidate...
                        for (let inv of investmentBalances) {
                            const draw = Math.min(inv.amount, remain);
                            inv.amount -= draw;
                            remain -= draw;
                            if (remain < 0.01) break;
                        }
                        if (remain > 0.01) savings -= remain;
                    }
                }
            }
        }

        // 10. METRICS
        const totalLiqInvest = investmentBalances.reduce((a, b) => a + b.amount, 0) + monthlyInvestments.reduce((a, b) => a + b.balance, 0);
        const liquidTotal = savings + totalLiqInvest;

        if (age >= retirementAge) {
            if (liquidTotal < 0 && fireSuccess) {
                fireSuccess = false;
                failureAge = age;
            }
            if (liquidTotal < lowestLiquid) lowestLiquid = liquidTotal;
        }

        const totalCPFIS = cpfisPortfolios.reduce((a, b) => a + b.balance, 0);

        let chartBrs = rs.BRS;
        let chartFrs = rs.FRS;
        let chartErs = rs.ERS;

        projectionData.push({
            age,
            liquid: liquidTotal,
            cpf: {
                OA: cpf.OA, SA: cpf.SA, MA: cpf.MA, RA: cpf.RA,
                total: cpf.OA + cpf.SA + cpf.MA + cpf.RA,
                totalInvested: totalCPFIS
            },
            total: liquidTotal + cpf.OA + cpf.SA + cpf.MA + cpf.RA + totalCPFIS,
            payoutMonthly: cpfPayoutAmountMonthly,
            cohortSums: rs,
            frs: chartFrs,
            brs: chartBrs
        });
    }

    // RESULTS UI
    const retData = projectionData.find(d => d.age === retirementAge) || projectionData[0];

    document.getElementById('cpfRetirement').innerText = formatCurrency(retData.cpf.total + retData.cpf.totalInvested);

    const accessibleCPF = Math.max(0, retData.cpf.OA + retData.cpf.SA + retData.cpf.totalInvested - 200000);
    const totalAccessible = Math.max(0, retData.liquid + accessibleCPF);
    document.getElementById('accessibleTotal').innerText = formatCurrency(totalAccessible);

    // Expense at Retirement
    const expAtRet = (postFireMonthlyExpenses * 12 * Math.pow(1 + inflation, yearsToRetirement));
    const fireTarget = expAtRet * 25;
    document.getElementById('fireTarget').innerText = formatCurrency(fireTarget);
    document.getElementById('annualExpenses').innerText = formatCurrency(expAtRet);

    // CPF Life Box
    const dataAtStart = projectionData.find(d => d.age === 65); // Renamed from dataAt65 to dataAtStart for clarity
    const cohortSums = rs;
    if (dataAtStart) {
        // If the Payout Age > 65, the dataAtStart might not have payout yet.
        // We should find the first year with payout.
        const firstPayoutYear = projectionData.find(d => d.payoutMonthly > 0);
        const projectedPayout = firstPayoutYear ? firstPayoutYear.payoutMonthly : 0;
        const formattedPayout = formatCurrency(projectedPayout);

        document.getElementById('estMonthlyPayout').textContent = `S$ ${formattedPayout}`;

        // Show RA balance just before it converts? dataAtStart.cpf.RA might be 0 if payout started.
        // Let's show the RA peak.
        const peakRA = Math.max(...projectionData.map(d => d.cpf.RA));
        document.getElementById('projRA65').textContent = `S$ ${(peakRA / 1000).toFixed(0)}k`;
        document.getElementById('targetFRS').textContent = `S$ ${(cohortSums.FRS / 1000).toFixed(0)}k`;

        // Color code
        if (peakRA >= cohortSums.FRS) {
            document.getElementById('projRA65').style.color = "var(--color-success)";
        } else if (peakRA >= cohortSums.BRS) {
            document.getElementById('projRA65').style.color = "var(--color-warning)";
        } else {
            document.getElementById('projRA65').style.color = "var(--color-error)";
        }
    } else {
        document.getElementById('estMonthlyPayout').innerText = "-";
        document.getElementById('projRA65').innerText = "-";
        document.getElementById('targetFRS').innerText = `S$ ${(cohortSums.FRS / 1000).toFixed(0)}k`;
    }

    // Status
    const statusEl = document.getElementById('fireStatus');
    const descEl = document.getElementById('fireStatusDesc');
    const successAlert = document.getElementById('successAlert');
    const achieveAlert = document.getElementById('achieveAlert');
    const canFire = totalAccessible >= fireTarget;

    if (canFire && fireSuccess) {
        statusEl.innerText = "SUCCESS";
        statusEl.style.color = "var(--color-success)";
        descEl.innerText = "Assets last until " + (currentAge + (lifeExpectancy - currentAge));

        successAlert.classList.add('show');
        successAlert.innerHTML = `✓ FIRE achievable! Your plan is fully solvent.`;
        achieveAlert.classList.remove('show');
    } else {
        statusEl.innerText = "FAILED";
        statusEl.style.color = "var(--color-error)";
        descEl.innerText = failureAge ? "Runs out of cash at Age " + failureAge : "Shortfall";

        achieveAlert.classList.add('show');
        let failureMsg = `⚠ Shortfall of ${formatCurrency(fireTarget - totalAccessible)} at age ${retirementAge}.`;
        if (!fireSuccess) {
            failureMsg = `⚠ Insolvency at Age ${failureAge}. Liquid Assets < $0.`;
        }

        // Smart Suggestions
        const suggestions = getSmartSuggestions(failureAge, retirementAge, currentSavings, currentMonthlyExpenses, fireTarget, projectionData.map(d => d.liquid));
        let suggestionHTML = "";
        if (suggestions.length > 0) {
            suggestionHTML = `<div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.2); padding-top:8px;"><strong>💡 Analysis & Insights:</strong><ul style="margin-bottom:0; padding-left:20px;">`;
            suggestions.forEach(s => suggestionHTML += `<li>${s}</li>`);
            suggestionHTML += `</ul></div>`;
        }

        achieveAlert.innerHTML = failureMsg + suggestionHTML;
        successAlert.classList.remove('show');
    }

    updateCharts(projectionData);
}

function getSmartSuggestions(failureAge, retirementAge, currentSavings, monthlyExpenses, fireTarget, liquidHistory) {
    var suggestions = [];
    // Simplified logic to avoid syntax gremlins
    if (failureAge && (failureAge - retirementAge) < 10) {
        suggestions.push("Premature limit: You run out of cash very quickly.");
    }
    if (failureAge && failureAge > 85) {
        suggestions.push("So close! You are solvent until " + failureAge + ".");
    }
    if (monthlyExpenses > 6000) {
        suggestions.push("High Burn Rate: Your projected expenses are high.");
    }
    if (failureAge && (failureAge - retirementAge) >= 10 && (failureAge - retirementAge) <= 20) {
        suggestions.push("Mid-Retirement Gap: You run out before CPF Life kicks in fully.");
    }
    var payoutAge = parseInt(document.getElementById('payoutAge').value) || 65;
    if (failureAge && failureAge < payoutAge && (payoutAge - failureAge) <= 5) {
        suggestions.push("Bridge Problem: You run out just before CPF Payouts start.");
    }
    return suggestions;
}

function updateCharts(projectionData) {
    const years = projectionData.map(d => d.age);
    const totals = projectionData.map(d => Math.max(0, d.total));
    const liquids = projectionData.map(d => Math.max(0, d.liquid));
    const oas = projectionData.map(d => d.cpf.OA);
    const sas = projectionData.map(d => d.cpf.SA);
    const mas = projectionData.map(d => d.cpf.MA);
    const ras = projectionData.map(d => d.cpf.RA);

    // Extract cohort sum constant for the chart
    // We want to draw a horizontal line or a step function?
    // The value is fixed for the User. Let's draw horizontal dashed lines representing the Goal.
    // Actually, `d.cohortSums` is the same for all years.
    const rs = projectionData[0].cohortSums;

    if (portfolioChartInstance) portfolioChartInstance.destroy();
    portfolioChartInstance = new Chart(document.getElementById('portfolioChart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [{ label: 'Total Portfolio (Incl. CPF Bequest)', data: totals, borderColor: '#208092', backgroundColor: 'rgba(32, 128, 146, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => 'S$' + (v / 1000000).toFixed(1) + 'M' } } }
        }
    });

    if (liquidChartInstance) liquidChartInstance.destroy();
    liquidChartInstance = new Chart(document.getElementById('liquidChart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [{ label: 'Liquid (Savings + Investments)', data: liquids, borderColor: '#208092', backgroundColor: 'rgba(32, 128, 146, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => 'S$' + (v / 1000000).toFixed(1) + 'M' } } }
        }
    });

    if (cpfChartInstance) cpfChartInstance.destroy();

    // Create constant arrays for BRS/FRS/ERS lines
    const brsLine = years.map(() => rs.BRS);
    const frsLine = years.map(() => rs.FRS);

    cpfChartInstance = new Chart(document.getElementById('cpfChart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                { label: 'OA (2.5%)', data: oas, borderColor: '#208092', borderWidth: 2, tension: 0.4, fill: false },
                { label: 'SA (4%)', data: sas, borderColor: '#a84d2f', borderWidth: 2, tension: 0.4, fill: false },
                { label: 'MA (Locked)', data: mas, borderColor: '#d99c6c', borderWidth: 2, borderDash: [5, 5], tension: 0.4, fill: false },
                { label: 'RA (Yield)', data: ras, borderColor: '#8e44ad', borderWidth: 2, fill: true, backgroundColor: 'rgba(142, 68, 173, 0.1)' },
                { label: `FRS ($${(rs.FRS / 1000).toFixed(0)}k)`, data: frsLine, borderColor: '#666', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0 },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => 'S$' + (v / 1000000).toFixed(1) + 'M' } } }
        }
    });
}

function resetForm() {
    document.getElementById('fireForm').reset();
    document.getElementById('investmentItems').innerHTML = '';
    document.getElementById('purchasesList').innerHTML = '';
    document.getElementById('monthlyInvestmentsList').innerHTML = '';
    document.getElementById('cpfisList').innerHTML = '';
    document.getElementById('annualExpensesList').innerHTML = '';
    ['cpfTopupSection', 'investmentsList', 'purchasesSection', 'monthlyInvestmentsSection', 'annualExpensesSection'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

const STORAGE_KEY = 'sg_fire_correct_v1';

function saveFormData() {
    const data = {};
    document.querySelectorAll('#fireForm input, #fireForm select').forEach(el => {
        data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFormData() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!data) return;
        document.querySelectorAll('#fireForm input, #fireForm select').forEach(el => {
            if (data[el.id] !== undefined) {
                el.type === 'checkbox' ? el.checked = data[el.id] : el.value = data[el.id];
            }
        });
        updateCalculation();
    } catch (e) { }
}

function clearSavedData() {
    if (confirm('Clear all saved data and reset?')) {
        localStorage.removeItem(STORAGE_KEY);
        resetForm();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#fireForm input, #fireForm select').forEach(el => {
        el.addEventListener('input', () => setTimeout(saveFormData, 500));
        el.addEventListener('change', saveFormData);
    });
    loadFormData();
});

document.querySelectorAll('#fireForm input, #fireForm select').forEach(el => {
    el.addEventListener('input', updateCalculation);
    el.addEventListener('change', updateCalculation);
});
