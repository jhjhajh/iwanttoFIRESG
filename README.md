# 🇸🇬 Singapore FIRE Calculator

FIRE in SG's context

Proceed with discretion, simple calculator that helps with fire estimation. Hope we all huat and retire healthy early and rich

Unlike standard FIRE calculators, this tool accounts for the unique multi-stage retirement system in Singapore:

1.  **Liquid Cash Bridge**: The critical period from your FIRE age until CPF payout eligibility.
2.  **CPF Life**: Estimating monthly payouts based on projected Retirement Account (RA) balances and cohort-based FRS/BRS/ERS targets.
3.  **Inflation & Growth**: Tunable parameters for inflation, salary growth, and investment returns.

## Key Features
*   **Separated Assets**: Distinct tracking for Liquid Cash (Savings/Investments) vs. Locked CPF (OA/SA/MA/RA).
*   **CPF Life Estimator**: Projects your RA balance at payout age (e.g. 65) and estimates monthly payouts using interpolation of 2025 standard plan data.
*   **Detailed Cash Flow**: Visualizes year-by-year accessible funds to ensure you never run out of liquidity before your CPF unlocks.
*   **Smart Analysis**: Provides rule-based insights if your plan is projected to fail (e.g. "Bridge Problem").

## Getting Started
This is a static web application. 

1.  Clone the repository.
2.  Open `index.html` in any modern web browser.
3.  Enter your financial details to start simulating.

## Contributing
Contributions are welcome! If you find a bug or want to add a new feature (e.g. more detailed tax models, SRS support):

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Disclaimer
This tool is for educational purposes only. It is not financial advice. Projections are based on assumptions that may not hold true in the future. Always do your own due diligence.
