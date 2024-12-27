# Customer Profile Journey: Sarah's Loaded Tea Adventure 🍵

## Scenario: Multi-Club Rewards Tracking

### 🏁 First Interaction: Wellness Club
Sarah visits "Wellness Vibes" Loaded Tea Club
```typescript
const profile = await CustomerProfileService.createProfile({
  firstName: 'Sarah',
  lastName: 'Johnson',
  phone: '555-123-4567',
  initialClubId: 'WELLNESS_VIBES_CLUB'
});

// Result:
// globalCustomerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
// Local Customer ID at Wellness Vibes: 'WVC5G42X'
```

### 🌟 First Few Purchases at Wellness Vibes
```typescript
// Track first 3 purchases
for (let i = 0; i < 3; i++) {
  await CustomerProfileService.trackPurchase(
    profile.globalCustomerId, 
    'WELLNESS_VIBES_CLUB'
  );
}

// Current status:
// Purchase Count: 3/10
// Rewards Eligible: False
```

### 🏋️ Second Club: Energy Boost
Sarah visits another club, "Energy Boost Nutrition"
```typescript
const energyClubMembership = await CustomerProfileService.joinClub(
  profile.globalCustomerId, 
  'ENERGY_BOOST_CLUB'
);

// Result:
// Local Customer ID at Energy Boost: 'EBC3K79X'
```

### 🥤 Purchases Across Clubs
```typescript
// Purchases at Wellness Vibes continue
for (let i = 0; i < 7; i++) {
  await CustomerProfileService.trackPurchase(
    profile.globalCustomerId, 
    'WELLNESS_VIBES_CLUB'
  );
}

// Purchases at Energy Boost
for (let i = 0; i < 5; i++) {
  await CustomerProfileService.trackPurchase(
    profile.globalCustomerId, 
    'ENERGY_BOOST_CLUB'
  );
}

// Status Check:
// Wellness Vibes: 10/10 ✅ FREE TEA EARNED!
// Energy Boost: 5/10 🔜
```

### 🎉 Reward Redemption
```typescript
// Redeem free tea at Wellness Vibes
const rewardRedeemed = await CustomerProfileService.redeemReward(
  profile.globalCustomerId, 
  'WELLNESS_VIBES_CLUB'
);

// Result: true (Reward successfully redeemed)
// Purchase count reset to 0
```

## Key Observations
- One global profile (`globalCustomerId`)
- Unique local ID per club
- Independent purchase tracking
- Seamless multi-club experience
- Simple reward mechanism

## Benefits for Customers
- No multiple accounts
- Track progress across clubs
- Easy reward redemption

## Benefits for Clubs
- Customer insights
- Cross-promotion potential
- Simplified loyalty tracking
