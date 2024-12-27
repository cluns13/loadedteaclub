# Loaded Tea Rewards System Demo

## Scenario: Customer Journey

### Customer Purchases
1. First Purchase
```typescript
const result = await trackCustomerPurchase(
  'CLUB_WELLNESS_123', 
  'CUSTOMER_JOHN_DOE'
);
// result: { 
//   currentPurchaseCount: 1, 
//   rewardThreshold: 10, 
//   isEligibleForReward: false 
// }
```

### After 9 More Purchases
```typescript
// Repeated 9 times
const result = await trackCustomerPurchase(
  'CLUB_WELLNESS_123', 
  'CUSTOMER_JOHN_DOE'
);
// result: { 
//   currentPurchaseCount: 10, 
//   rewardThreshold: 10, 
//   isEligibleForReward: true 
// }
```

### Redeeming Free Loaded Tea
```typescript
const redemption = await redeemReward(
  'CLUB_WELLNESS_123', 
  'CUSTOMER_JOHN_DOE'
);
// redemption: { 
//   rewardRedeemed: true, 
//   rewardType: 'FREE_LOADED_TEA' 
// }
```

## Key Benefits
- Simple tracking
- No complex point systems
- Easy for staff
- Encourages repeat visits
