import { Stack, type StackProps } from 'aws-cdk-lib'
import * as budgets from 'aws-cdk-lib/aws-budgets'
import type { Construct } from 'constructs'
import type { EnvConfig } from '../../config/index.ts'

interface OpsStackProps extends StackProps {
  readonly config: EnvConfig
}

/** Cost guardrail from day one. Alarms and dashboards are added as services go live (phase 6). */
export class OpsStack extends Stack {
  constructor(scope: Construct, id: string, props: OpsStackProps) {
    super(scope, id, props)
    const { config } = props

    const subscribers = config.budget.alertEmails.map((address) => ({ subscriptionType: 'EMAIL', address }))
    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: `hai-${config.name}-monthly`,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: config.budget.monthlyUsd, unit: 'USD' },
      },
      notificationsWithSubscribers: [
        {
          notification: { notificationType: 'ACTUAL', comparisonOperator: 'GREATER_THAN', threshold: 80, thresholdType: 'PERCENTAGE' },
          subscribers,
        },
        {
          notification: { notificationType: 'FORECASTED', comparisonOperator: 'GREATER_THAN', threshold: 100, thresholdType: 'PERCENTAGE' },
          subscribers,
        },
      ],
    })
  }
}
