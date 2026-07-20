# Lightweight Test Risk Model

In simple terms, use this model to spend the most testing effort where a failure would be harmful, likely, difficult to notice, or difficult to reverse.

## Factors

Score each factor as Low, Medium, or High:

- Business/customer impact
- Likelihood of failure
- Change complexity
- Integration count and failure boundaries
- Detectability before customer impact
- Reversibility and recovery cost
- Security, privacy, payment, or authorization sensitivity
- Historical defect evidence

## Interpretation

- **High:** Complete critical-rule coverage, negative paths, recovery, observability, and at least one realistic integration or E2E path.
- **Medium:** Main partitions, important alternatives, targeted integration, and selective combinations.
- **Low:** Representative positive/negative coverage at the lowest useful test level.

Document the rationale. A numeric score without reasoning is not a risk assessment.
