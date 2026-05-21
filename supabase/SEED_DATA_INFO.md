# Seed Data Information

## Overview

The seed data provides comprehensive flight coverage for testing purposes.

## Cities & Airport Codes

| Code | City | Airport Name |
|------|------|--------------|
| DEL | Delhi | Indira Gandhi International Airport |
| BOM | Mumbai | Chhatrapati Shivaji Maharaj International Airport |
| BLR | Bangalore | Kempegowda International Airport |
| HYD | Hyderabad | Rajiv Gandhi International Airport |
| CCU | Kolkata | Netaji Subhas Chandra Bose International Airport |
| MAA | Chennai | Chennai International Airport |

## Route Coverage

**Total Routes:** 30 (all possible combinations between 6 cities)

### From Delhi (DEL)
- DEL → BOM (Mumbai) - 2 hours - ₹4,500
- DEL → BLR (Bangalore) - 3 hours - ₹6,500
- DEL → HYD (Hyderabad) - 2 hours - ₹5,500
- DEL → CCU (Kolkata) - 2 hours - ₹5,000
- DEL → MAA (Chennai) - 3 hours - ₹6,000

### From Mumbai (BOM)
- BOM → DEL (Delhi) - 2 hours - ₹4,500
- BOM → BLR (Bangalore) - 2 hours - ₹3,500
- BOM → HYD (Hyderabad) - 1 hour - ₹3,000
- BOM → CCU (Kolkata) - 3 hours - ₹5,500
- BOM → MAA (Chennai) - 2 hours - ₹4,000

### From Bangalore (BLR)
- BLR → DEL (Delhi) - 3 hours - ₹6,500
- BLR → BOM (Mumbai) - 2 hours - ₹3,500
- BLR → HYD (Hyderabad) - 1 hour - ₹2,500
- BLR → CCU (Kolkata) - 3 hours - ₹5,000
- BLR → MAA (Chennai) - 1 hour - ₹2,800

### From Hyderabad (HYD)
- HYD → DEL (Delhi) - 2 hours - ₹5,500
- HYD → BOM (Mumbai) - 1 hour - ₹3,000
- HYD → BLR (Bangalore) - 1 hour - ₹2,500
- HYD → CCU (Kolkata) - 2 hours - ₹4,500
- HYD → MAA (Chennai) - 1 hour - ₹2,800

### From Kolkata (CCU)
- CCU → DEL (Delhi) - 2 hours - ₹5,000
- CCU → BOM (Mumbai) - 3 hours - ₹5,500
- CCU → BLR (Bangalore) - 3 hours - ₹5,000
- CCU → HYD (Hyderabad) - 2 hours - ₹4,500
- CCU → MAA (Chennai) - 2 hours - ₹4,000

### From Chennai (MAA)
- MAA → DEL (Delhi) - 3 hours - ₹6,000
- MAA → BOM (Mumbai) - 2 hours - ₹4,000
- MAA → BLR (Bangalore) - 1 hour - ₹2,800
- MAA → HYD (Hyderabad) - 1 hour - ₹2,800
- MAA → CCU (Kolkata) - 2 hours - ₹4,000

## Flight Schedule

**Per Route:**
- 3 flights per day (Morning, Afternoon, Evening)
- 30 days of availability
- Total: 90 flights per route

**Daily Schedule:**
- Morning: 6:00 AM departure
- Afternoon: 2:00 PM departure
- Evening: 8:00 PM departure

**Total Flights:** 30 routes × 90 flights = 2,700 flights

## Aircraft Types

Flights rotate between:
- Boeing 737-800
- Airbus A320
- Boeing 787-9
- Airbus A350

## Seat Configuration (Per Flight)

### First Class (Rows 1-3)
- Columns: A, B, C, D
- Total: 12 seats
- Extra fees: ₹300-500 (window seats higher)

### Business Class (Rows 4-8)
- Columns: A, B, C, D, E, F
- Total: 30 seats
- Extra fees: ₹50-200 (window/aisle seats higher)

### Economy Class (Rows 9-30)
- Columns: A, B, C, D, E, F
- Total: 132 seats
- Extra fees: ₹0-150 (exit rows and window seats)

**Total Seats per Flight:** 174 seats
**Total Seats in Database:** 2,700 flights × 174 = 469,800 seats

## Price Variation

Base prices vary by ±20% across different days to simulate demand fluctuations.

## Testing Scenarios

### Scenario 1: Popular Route
- Search: DEL → BOM on any date
- Expected: 3 flights available (morning, afternoon, evening)

### Scenario 2: Short Haul
- Search: BLR → HYD on any date
- Expected: 3 flights, 1-hour duration, lower prices

### Scenario 3: Long Haul
- Search: DEL → BLR on any date
- Expected: 3 flights, 3-hour duration, higher prices

### Scenario 4: Any Combination
- Search: Any city to any other city
- Expected: Always 3 flights per day available

### Scenario 5: Date Range
- Search: Any route for next 30 days
- Expected: Consistent availability across all dates

## Migration Execution Time

**Estimated Time:** 2-3 minutes

The seed script generates:
1. 2,700 flight records
2. 469,800 seat records (with individual pricing)

This is done efficiently using PostgreSQL functions but still requires time due to the volume.

## Notes for Testers

1. **Any route works:** All 30 possible combinations are covered
2. **Any date works:** Next 30 days have full coverage
3. **Multiple options:** 3 flights per day give choice
4. **Realistic data:** Prices, durations, and aircraft types are realistic
5. **Full seat maps:** Every flight has complete first/business/economy seating

## Troubleshooting

If seed data doesn't appear:
1. Check SQL Editor for errors
2. Ensure migrations ran in order (000 → 004)
3. Verify RLS policies are enabled
4. Check that functions executed successfully
5. Look for timeout errors (increase timeout if needed)
