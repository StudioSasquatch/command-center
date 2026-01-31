# Command Center Research: Team Directory & Analytics APIs
*Compiled by Nova | Jan 30, 2026*

---

## 1. Team Directory

### Drizzle (Crypto Casino)

| Name | Role | Notes |
|------|------|-------|
| **Dan Gunsberg** | CEO | Majority owner. Primary decision maker. |
| **Jeremy Kirby** | CMO / Co-founder | Stakeholder in Parlour Digital. Handles marketing, content, strategy. |
| **Nicola** | Co-founder | Also founder of Timeless Tech. Key partner for AI Casino Solutions venture. |
| **Borut** | Co-founder | Also founder of Timeless Tech. Based in Europe. |
| **Austin** | Stakeholder / AI & Data Expert | Works full-time at Nike in Data Analytics. Part-time contributor. |
| **Nika** | Head of Casino Operations | Day-to-day casino ops management. |
| **Beka** | Head of CRM | Customer relationship management & retention. |
| **George** | Head of Product | Product development & roadmap. |
| **Sandro** | Head of Tech | Engineering & technical infrastructure. |
| **Randy** | Graphic Designer | Visual assets, coordinate with for graphics work. |

**Corporate Structure:**
- Parlour Digital (holding co) → licenses "Drizzle" brand to → Papito Entertainment (operating co)
- Structure exists for regulatory insulation

---

### Timeless Tech (Game Aggregator)

| Name | Role | Notes |
|------|------|-------|
| **Nicola** | Co-founder/Owner | Same Nicola from Drizzle |
| **Borut** | Co-founder/Owner | Same Borut from Drizzle |

- Supplies ~40 online casinos with game aggregation
- Strong industry reputation and connections
- Jeremy is part-time AI scaling consultant (equity TBD)

---

### AI Casino Solutions (Future Venture)

| Name | Role | Notes |
|------|------|-------|
| **Jeremy Kirby** | Co-founder | Building AI solutions for casino industry |
| **Nicola** | Partner | Brings Timeless Tech connections |
| **Borut** | Partner | Brings Timeless Tech connections |
| **Gabriel** | Investor/Acquirer | Moves money for Interlock. Will invest/acquire solutions as they're built. |

---

### Startups & Suits Podcast

| Name | Role | Notes |
|------|------|-------|
| **Jeremy Kirby** | Host | Startup/founder perspective |
| **Michael Jin** | Co-host | Corporate perspective (dynamic contrast) |

Content pipeline: Full episodes → microclips → Instagram + YouTube
Gap identified: LinkedIn (not doing anything there yet)

---

### Styled AI (iOS App)

| Name | Role | Notes |
|------|------|-------|
| **Jeremy Kirby** | Founder | Has Apple Dev account, app built via vibe coding |

---

### AI Agent Swarm

| Agent | Role | Status |
|-------|------|--------|
| **Noctis** | Orchestrator & Strategy | Main agent, Jeremy-facing |
| **Aurora** | Graphics & Design | Specialist |
| **Sage** | Content & Writing | Specialist |
| **Ada** | Development & Engineering | Specialist |
| **Nova** | Research & Intelligence | Specialist (that's me) |

---

## 2. Analytics API Recommendations

### X/Twitter API

**Endpoint:** X API v2 (api.twitter.com)

**Pricing Tiers:**
| Tier | Price | Access |
|------|-------|--------|
| Free | $0/mo | 1,500 tweets/mo read, limited data |
| Basic | $100/mo | 10K tweets/mo, user mentions, limited analytics |
| Pro | $5,000/mo | Full analytics, 1M tweets/mo, engagement data |
| Enterprise | Custom | Everything, higher limits, premium support |

**Recommended:** Basic tier ($100/mo) for:
- Follower count tracking
- Tweet engagement (likes, retweets, replies)
- Recent mentions
- Profile metrics

**Key Endpoints:**
- `GET /2/users/:id` - follower_count, following_count, tweet_count
- `GET /2/users/:id/tweets` - recent tweets with engagement metrics
- `GET /2/tweets/:id` - detailed tweet metrics (impressions, engagements)
- `GET /2/users/:id/mentions` - mentions of user

**Limitation:** Tweet impressions require author's authorization or paid tier.

**Alternative (Cheaper):** Use SocialBlade API or similar for historical follower tracking without X API costs.

---

### Google Analytics 4 API

**Endpoint:** Google Analytics Data API (analyticsdata.googleapis.com)

**Pricing:** Free (within Google Cloud quotas)

**Setup Requirements:**
1. Enable Analytics Data API in Google Cloud Console
2. Create OAuth2 credentials or Service Account
3. Link GA4 property ID

**Key Metrics Available:**
- `activeUsers` - unique users
- `sessions` - total sessions
- `screenPageViews` - page views
- `bounceRate` - bounce rate
- `averageSessionDuration` - time on site
- `newUsers` - new visitor count
- Traffic sources (organic, social, direct, referral)

**Recommended Reports:**
```
POST /v1beta/{property}/runReport
{
  "dateRanges": [{"startDate": "30daysAgo", "endDate": "today"}],
  "metrics": [
    {"name": "activeUsers"},
    {"name": "sessions"},
    {"name": "screenPageViews"}
  ],
  "dimensions": [{"name": "date"}]
}
```

**Note:** Already have Google OAuth set up for jkirby@rawhidesports.com — can extend for Analytics API.

---

### Crypto/Casino Metrics APIs

**For Drizzle-specific metrics (internal):**
Would need backend access or internal API. Typical casino KPIs:
- GGR (Gross Gaming Revenue)
- NGR (Net Gaming Revenue)
- Player deposits/withdrawals
- Active players (DAU/MAU)
- Bet volume
- House edge performance
- Bonus/promotion ROI

**External Crypto APIs:**

| API | Use Case | Pricing |
|-----|----------|---------|
| **CoinGecko** | Token prices, market cap | Free (50 calls/min) |
| **CoinMarketCap** | Token prices, rankings | Free tier available |
| **Dune Analytics** | On-chain data, wallet tracking | Free tier + paid |
| **Etherscan/similar** | Wallet balances, transactions | Free API key |

**For Gaming Industry Benchmarks:**
- **SimilarWeb API** - competitor traffic analysis ($)
- **Sensor Tower** - app store rankings for mobile ($)

---

### Social Media (Additional)

**Instagram (Meta Graph API):**
- Free via Facebook Business tools
- Requires Instagram Business Account
- Metrics: followers, reach, impressions, engagement
- Limited to accounts you manage

**YouTube Data API:**
- Free (10,000 quota units/day)
- Subscriber count, video views, watch time
- Channel analytics

**LinkedIn:**
- Organization API (requires Marketing Developer Platform approval)
- Expensive and hard to get access
- Alternative: Manual tracking or third-party tools

---

## 3. Implementation Recommendations for Command Center

### Phase 1: Quick Wins (This Week)
1. **Manual data input** - Start with a data.ts file that's manually updated
2. **Static team directory** - Already have all the data

### Phase 2: X Integration
1. Sign up for X API Basic ($100/mo)
2. Track @drizzle_casino and @jkirby_eth
3. Daily cron job to fetch follower counts + engagement

### Phase 3: Google Analytics
1. Enable GA4 Data API on existing GCP project
2. Create dashboard widget for The Compound and getstyled.app traffic
3. Weekly/daily traffic summaries

### Phase 4: Advanced
1. Internal Drizzle API integration (requires Sandro/backend coordination)
2. Crypto price feeds for any token holdings
3. Podcast download stats (Spotify for Podcasters API / Apple Podcasts Connect)

---

## 4. Additional Intel Found

### Key Dates
- **Feb 9, 2026** - Super Bowl (huge marketing opportunity)
- **Feb 15, 2026** - Drizzle V2 Launch

### Budget Context
- Q1 Drizzle marketing: $50K
- 50% ($25K) for awareness (crypto Twitter, Discord, influencers)
- X API cost (~$100/mo) is negligible vs budget

### Content Strategy Insight
From X algorithm analysis:
- Replies = highest value (+100x signal)
- Images = 2x boost
- Links in body = suppressed (put in reply)
- First hour engagement is critical

### Corporate Intel
- Dan's leadership has been problematic (wrong tech platform decision cost 9 months)
- Jeremy building leverage through Timeless Tech partnership
- Gabriel/Interlock relationship = potential future acquisition path for AI solutions

---

*Research complete. Ready for Command Center implementation.*
