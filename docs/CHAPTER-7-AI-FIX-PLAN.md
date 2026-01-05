# Chapter 7: AI Fix Plan Generator

## Overview
AI-powered remediation plan generator that transforms CMMC assessment gaps into actionable fix plans using Google's Gemini 2.0 Flash model.

## Architecture

### Components
- **API Route**: `app/api/generate-fix-plan/route.ts`
- **Types**: `types/fixplan.ts`
- **Integration**: `app/assessment/page.tsx`

### Data Flow
1. User completes assessment and generates gaps
2. User clicks "Generate AI Remediation Plan"
3. Frontend transforms gaps to API format
4. POST request to `/api/generate-fix-plan`
5. Server calls Gemini API with structured prompts
6. AI returns JSON with prioritized remediation plan
7. Frontend renders plan in four sections

## Features

### Remediation Plan Sections
1. **Readiness Summary** - 3 bullet points on overall status
2. **Top Priorities** - Up to 10 prioritized fixes with:
   - Control ID
   - Why it matters
   - Action steps (3-5 steps)
   - Effort estimate (S/M/L)
3. **Quick Wins** - Up to 5 items achievable in 7 days
4. **Audit Risk Notes** - What assessors will look for

### User Experience
- One-click generation (no multi-step flow)
- Loading state with spinner
- Error handling with user-friendly messages
- No automatic calls (on-demand only)
- Response cached in component state

## Technical Implementation

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

### API Model
- **Model**: `gemini-1.5-flash`
- **Provider**: Google AI Studio
- **Provider**: Google AI Studio
- **Tier**: Free (1,500 requests/day)

### Rate Limits
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

### Analytics Events
- `fix_plan_button_clicked` - User initiates generation
- `fix_plan_generated` - Successful generation
- `fix_plan_generation_failed` - API errors

## API Contract

### Request Format
```typescript
POST /api/generate-fix-plan
{
  industry: string;
  scopeNote: string;
  gaps: Array<{
    control_id: string;
    control_title: string;
    requirement: string;
    response: 'No' | 'Partial' | 'Unknown';
  }>;
}
```

### Response Format
```typescript
{
  readiness_summary: string[];
  top_priorities: Array<{
    control_id: string;
    why_it_matters: string;
    what_to_do: string[];
    estimated_effort: 'S' | 'M' | 'L';
  }>;
  quick_wins_7_days: string[];
  audit_risk_notes: string[];
}
```

## Security & Compliance

### Data Handling
- API key stored server-side only
- No CUI (Controlled Unclassified Information) requested
- No certification claims made
- No legal guarantees provided

### Privacy
- Assessment data sent to Google AI for processing
- No persistent storage of AI responses on backend
- Responses cached client-side during session only

## Testing

### Manual Test Steps
1. Complete assessment with 3+ gaps
2. Navigate to "Summary & Gaps" tab
3. Click "Generate AI Remediation Plan"
4. Verify loading state appears
5. Verify all four sections render
6. Check PostHog for analytics events

### Error Scenarios
- Invalid API key → User-friendly error message
- Rate limit exceeded → Error message with retry suggestion
- Network failure → Generic error message
- Malformed JSON response → Caught and logged

## Deployment Checklist

- [ ] `GEMINI_API_KEY` added to Vercel environment variables
- [ ] API route deployed and accessible
- [ ] Types file compiled without errors
- [ ] PostHog tracking verified in dashboard
- [ ] Free tier rate limits documented for team
- [ ] Error states tested and working

## Future Enhancements

### Potential Improvements
- Add "Download as PDF" for fix plans
- Allow users to customize industry/scope before generation
- Add retry mechanism with exponential backoff
- Implement plan comparison (track changes over time)
- Add email export functionality

### Model Alternatives
- Switch to `gemini-2.0-flash` (stable) if experimental model is unstable
- Upgrade to `gemini-1.5-pro` for more detailed plans (requires paid tier)

## Troubleshooting

### Common Issues

**"Unable to generate fix plan" error**
- Check API key is valid and not expired
- Verify free tier quota not exceeded (check console logs for 429 errors)
- Ensure `GEMINI_API_KEY` is in `.env.local` (local) or Vercel env vars (production)

**No button appears**
- Ensure gaps exist (at least one "No", "Partial", or "Unknown" response)
- Check you're on "Summary & Gaps" tab
- Verify `summary.gaps.length > 0`

**Slow response times**
- Normal for `gemini-2.0-flash-exp` (3-8 seconds typical)
- Switch to stable `gemini-2.0-flash` if needed
- Consider adding progress indicators

## Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [PostHog Event Tracking](https://posthog.com/docs/libraries/js)

---

**Status**: ✅ Feature Complete (Chapter 7)
**Last Updated**: January 2026
