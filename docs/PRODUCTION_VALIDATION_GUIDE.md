# Production Validation Guide

## Quick Start: Test Your System

Follow these steps to validate your WhatsApp SaaS portal is ready for production.

---

## Step 1: Connect Real WhatsApp Account

1. **Login to your portal** at `http://localhost:3000`
2. Navigate to **Connect WhatsApp** page
3. Click **"Add WhatsApp Account"**
4. Enter your **real production credentials**:
   - WABA ID
   - Phone Number ID  
   - Access Token (permanent)
   - Business Phone Number
   - Account Name

5. Click **"Connect Account"**
6. System validates credentials with Meta API
7. Verify success message and account appears in list

**Expected Result:**
- ✅ Account status: CONNECTED
- ✅ Quality rating displayed
- ✅ Phone number verified

---

## Step 2: Create & Submit Template

1. Navigate to **Templates** page
2. Click **"Create Template"**
3. Fill in template details:
   ```
   Name: welcome_message
   Category: MARKETING
   Language: English (US)
   Header: Welcome to Our Service
   Body: Hi {{1}}, thank you for joining us! Your account is now active.
   Footer: Reply STOP to unsubscribe
   ```
4. Click **"Save as Draft"**
5. From template list, click **"Submit for Approval"**
6. Wait for Meta review (usually 1-24 hours)
7. Use **"Refresh Status"** to check approval

**Expected Result:**
- ✅ Template submitted to Meta
- ✅ Status changes to PENDING
- ✅ Eventually becomes APPROVED

---

## Step 3: Create Campaign

1. Navigate to **Campaigns** page
2. Click **"Create Campaign"**
3. Fill in campaign details:
   ```
   Name: Test Campaign
   WhatsApp Account: [Your connected account]
   Template: welcome_message (must be APPROVED)
   ```
4. Add test contacts (1-3 real numbers with consent):
   ```
   Phone Number: +1234567890
   Variables: John Doe
   ```
5. Click **"Create Campaign"**

**Expected Result:**
- ✅ Campaign created with status DRAFT
- ✅ Contacts loaded
- ✅ Variables mapped correctly

---

## Step 4: Start Campaign & Verify Delivery

1. From campaign details, click **"Start Campaign"**
2. Campaign status changes to RUNNING
3. Messages are queued and sent
4. **Check recipient phones** - they should receive WhatsApp message
5. Monitor campaign stats:
   - Sent count increases
   - Delivered count updates
   - Read count updates (if recipients read)

**Expected Result:**
- ✅ Messages delivered to real WhatsApp numbers
- ✅ Recipients see correct template content
- ✅ Campaign stats update in real-time

---

## Step 5: Verify Webhooks

1. Check that webhook events are received
2. Navigate to browser console or check logs
3. Verify status updates:
   - Message sent
   - Message delivered
   - Message read

**Database Check:**
```sql
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;
SELECT * FROM campaign_messages WHERE status = 'DELIVERED';
```

**Expected Result:**
- ✅ Webhook events logged
- ✅ Message statuses updated
- ✅ No duplicate processing

---

## Step 6: Test Safety Features

### Test Pause/Resume

1. Create campaign with 10+ contacts
2. Click **"Start Campaign"**
3. While sending, click **"Pause Campaign"**
4. Verify sending stops
5. Click **"Resume Campaign"**
6. Verify sending continues

**Expected Result:**
- ✅ Pause stops message processing
- ✅ Resume continues from where it stopped
- ✅ No duplicate messages

### Test Kill-Switch (Admin Only)

1. Access admin endpoint:
   ```bash
   POST http://localhost:3000/api/admin/kill-switch
   {
     "globalSendingEnabled": false
   }
   ```
2. Try to start a campaign
3. Verify error: "Sending is currently disabled"
4. Re-enable:
   ```bash
   POST http://localhost:3000/api/admin/kill-switch
   {
     "globalSendingEnabled": true
   }
   ```

**Expected Result:**
- ✅ Kill-switch blocks all sending
- ✅ Clear error message shown
- ✅ Re-enabling restores functionality

---

## Step 7: Check Billing Tracking

1. Navigate to **Billing** page
2. Verify conversation tracking:
   - Total conversations
   - Billable conversations
   - Total spend (Meta costs)
   - Breakdown by category

**Expected Result:**
- ✅ Conversations tracked from webhooks
- ✅ Costs calculated based on country + type
- ✅ Campaign costs aggregated
- ✅ Ledger entries created

---

## Automated Test

Run the automated validation script:

```bash
npx tsx scripts/production-readiness-test.ts
```

Enter your email when prompted. The script will:
1. Validate WABA connection
2. Check template approval
3. Verify campaign engine
4. Check webhook events
5. Test safety features

**Expected Output:**
```json
{
  "production_readiness": "PASS",
  "real_waba_connected": true,
  "template_approved": true,
  "real_messages_delivered": true,
  "webhooks_working": true,
  "campaign_engine_verified": true,
  "safe_for_deployment": true,
  "ready_for_build_and_deploy": true
}
```

---

## Troubleshooting

### WABA Connection Fails
- Verify access token is **permanent** (not 24-hour token)
- Check token has `whatsapp_business_messaging` permission
- Ensure WABA ID and Phone Number ID are correct
- Test token with Meta Graph API Explorer

### Template Rejected
- Review Meta's [template guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- Avoid promotional language in UTILITY templates
- Use sequential variables: {{1}}, {{2}}, {{3}}
- Keep header under 60 characters
- Keep body under 1024 characters

### Messages Not Sending
- Verify template is **APPROVED** (not PENDING or REJECTED)
- Check WhatsApp account is **CONNECTED**
- Verify global kill-switch is **enabled**
- Check tenant sending is **enabled**
- Review campaign status (must be RUNNING)

### Webhooks Not Received
- Ensure webhook URL is publicly accessible (use ngrok for local testing)
- Verify HTTPS with valid SSL certificate
- Check webhook verify token matches `.env` setting
- Test signature validation with Meta's test tool
- Review webhook event logs in database

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Real WABA connected and validated
- [ ] Real template approved by Meta
- [ ] Real campaign sent successfully
- [ ] Webhooks working correctly
- [ ] Pause/resume tested
- [ ] Kill-switch tested
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Webhook URL updated in Meta Developer Portal

---

## Next Steps

Once validation passes:

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting**
   - Vercel, Netlify, or custom server
   - Configure environment variables
   - Set up production database

3. **Configure Meta Webhook**
   - Update webhook URL to production domain
   - Verify webhook subscription
   - Test with real events

4. **Monitor Production**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor webhook events
   - Track message delivery rates
   - Review audit logs

---

**System Status:** ✅ Ready for Production Validation  
**Last Updated:** December 2024
