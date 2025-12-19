# Production Readiness Checklist

## Pre-Deployment Validation Guide

This document outlines the steps to validate your WhatsApp SaaS portal is ready for production deployment.

---

## ✅ PHASE A: Production Connection Validation

### A1: Connect Real WhatsApp Account

**Required Credentials:**
- WABA ID (WhatsApp Business Account ID)
- Phone Number ID
- Permanent Access Token
- Business WhatsApp Number

**Steps:**
1. Navigate to `/connect` in the portal
2. Click "Add WhatsApp Account"
3. Enter your production credentials
4. System validates via Meta API:
   - `GET /{PHONE_NUMBER_ID}` - Verify phone number
   - `GET /{WABA_ID}` - Verify WABA
5. Confirm:
   - ✅ Token valid
   - ✅ WABA linked
   - ✅ Phone number active
   - ✅ Quality rating visible

**Validation Endpoint:**
```bash
POST /api/whatsapp/validate
{
  "wabaId": "YOUR_WABA_ID",
  "phoneNumberId": "YOUR_PHONE_NUMBER_ID",
  "accessToken": "YOUR_ACCESS_TOKEN"
}
```

### A2: Webhook Validation (Production)

**Requirements:**
- Webhook URL must be publicly accessible
- HTTPS required
- Signature validation enabled

**Test Steps:**
1. Ensure webhook URL is configured in Meta Developer Portal
2. Send a test message from portal
3. Verify webhook POST received
4. Check `webhook_events` table for entries
5. Confirm message status updated in DB

**Check Webhook Events:**
```sql
SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ PHASE B: Real Template Lifecycle Test

### B1: Create Real Template

**Steps:**
1. Navigate to `/templates`
2. Click "Create Template"
3. Fill in:
   - **Category**: MARKETING or UTILITY
   - **Language**: en_US
   - **Body**: Include variables `{{1}}`, `{{2}}` if needed
   - **Header** (optional)
   - **Footer** (optional)
   - **Buttons** (optional)
4. Save as DRAFT

### B2: Submit Template to Meta

**Steps:**
1. From template list, click "Submit for Approval"
2. System calls: `POST /{WABA_ID}/message_templates`
3. Confirm:
   - ✅ Meta request accepted
   - ✅ Template status = PENDING
   - ✅ Template ID stored

### B3: Wait for Meta Review

**Monitoring:**
1. Use "Refresh Status" button to poll Meta API
2. Wait for status change:
   - **APPROVED** ✅ → Ready to use
   - **REJECTED** ❌ → Fix and resubmit

**If Rejected:**
- View rejection reason in template details
- Edit template to fix issues
- Resubmit for approval
- Repeat until APPROVED

**Check Template Status:**
```bash
GET /api/templates/{templateId}/refresh
```

---

## ✅ PHASE C: Real Campaign Execution Test

### C1: Create Campaign

**Steps:**
1. Navigate to `/campaigns`
2. Click "Create Campaign"
3. Select:
   - **WhatsApp Account**: Your connected account
   - **Template**: An APPROVED template
   - **Contacts**: 1-3 real phone numbers (with consent)
4. Map variables if template has placeholders
5. Save campaign

**Validation:**
- ✅ Variable mapping correct
- ✅ No sandbox restrictions
- ✅ Campaign status = DRAFT

### C2: Start Campaign

**Steps:**
1. From campaign details, click "Start Campaign"
2. System sets status to RUNNING
3. Messages queued in `campaign_messages` table
4. Dispatcher processes queue

**Monitor:**
```bash
GET /api/campaigns/{campaignId}
```

### C3: Real Message Delivery

**Verification:**
1. Check recipient WhatsApp phones
2. Confirm message received with correct content
3. Verify message ID in `campaign_messages`
4. Check status progression:
   - QUEUED → SENT → DELIVERED → READ

**Database Check:**
```sql
SELECT * FROM campaign_messages 
WHERE campaign_id = 'YOUR_CAMPAIGN_ID' 
ORDER BY created_at DESC;
```

---

## ✅ PHASE D: Webhook & Status Verification

**Required Webhook Events:**
- `sent` - Message sent to Meta
- `delivered` - Message delivered to recipient
- `read` - Message read by recipient (if applicable)

**Verification Steps:**
1. Check `webhook_events` table for events
2. Verify `campaign_messages` status updated
3. Confirm campaign stats updated:
   - `sentCount`
   - `deliveredCount`
   - `readCount`
4. Ensure no duplicate sends
5. Verify no retry storms

**Check Campaign Stats:**
```bash
GET /api/campaigns/{campaignId}
```

---

## ✅ PHASE E: Failure & Safety Tests

### Test 1: Pause Campaign Mid-Send

**Steps:**
1. Start a campaign with 10+ contacts
2. While sending, click "Pause Campaign"
3. Verify:
   - ✅ Dispatcher stops processing
   - ✅ Remaining messages stay QUEUED
   - ✅ Campaign status = PAUSED

**API:**
```bash
POST /api/campaigns/{campaignId}/pause
```

### Test 2: Resume Campaign

**Steps:**
1. From paused campaign, click "Resume"
2. Verify:
   - ✅ Dispatcher resumes processing
   - ✅ Remaining messages sent
   - ✅ Campaign status = RUNNING

**API:**
```bash
POST /api/campaigns/{campaignId}/resume
```

### Test 3: Rate Limit Handling

**Steps:**
1. Send campaign with many messages
2. Monitor rate limiter behavior
3. Verify:
   - ✅ Adaptive scaling kicks in
   - ✅ No Meta rate limit errors
   - ✅ Messages sent at safe rate

**Check Rate Limits:**
```sql
SELECT * FROM tenant_rate_limits WHERE tenant_id = 'YOUR_TENANT_ID';
```

### Test 4: Kill-Switch

**Steps:**
1. Set global kill-switch:
   ```bash
   POST /api/admin/kill-switch
   {
     "globalSendingEnabled": false
   }
   ```
2. Try to start a campaign
3. Verify:
   - ✅ Sending blocked
   - ✅ Error message shown
   - ✅ No messages sent

**Re-enable:**
```bash
POST /api/admin/kill-switch
{
  "globalSendingEnabled": true
}
```

---

## 📊 Success Criteria

System is **DEPLOYMENT-READY** only if:

- ✅ Real WABA connected
- ✅ Real template approved by Meta
- ✅ Real campaign started
- ✅ Real messages delivered
- ✅ Webhooks received in production
- ✅ Pause/resume works
- ✅ Rate limiting works
- ✅ Kill-switch works
- ✅ No policy violations
- ✅ No sandbox shortcuts

---

## 🚀 Automated Test Script

Run the automated production readiness test:

```bash
npx tsx scripts/production-readiness-test.ts
```

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

## 🔒 Security Checklist

Before deployment:

- ✅ All credentials encrypted in database
- ✅ Webhook signature validation enabled
- ✅ HTTPS enforced
- ✅ Environment variables secured
- ✅ API authentication working
- ✅ Rate limiting active
- ✅ Audit logging enabled
- ✅ No hardcoded secrets

---

## 📝 Manual Testing Checklist

### Connection
- [ ] Connect real WhatsApp account
- [ ] Verify account details displayed
- [ ] Test disconnect functionality

### Templates
- [ ] Create template with variables
- [ ] Submit to Meta for approval
- [ ] Refresh status until approved
- [ ] Edit rejected template
- [ ] Resubmit fixed template

### Campaigns
- [ ] Create campaign with approved template
- [ ] Map variables correctly
- [ ] Upload contacts (CSV or manual)
- [ ] Start campaign
- [ ] Monitor message sending
- [ ] Verify delivery on real phones

### Webhooks
- [ ] Receive webhook events
- [ ] Status updates in DB
- [ ] Campaign stats updated
- [ ] No duplicate processing

### Safety
- [ ] Pause running campaign
- [ ] Resume paused campaign
- [ ] Test rate limiting
- [ ] Test global kill-switch
- [ ] Test tenant kill-switch

---

## ⚠️ Common Issues

### Issue: WABA Validation Fails
**Solution:**
- Verify access token is permanent (not temporary)
- Check token permissions include `whatsapp_business_messaging`
- Ensure WABA ID and Phone Number ID are correct

### Issue: Template Rejected
**Solution:**
- Review Meta's template guidelines
- Avoid promotional language in UTILITY templates
- Ensure variables are sequential ({{1}}, {{2}}, etc.)
- Check character limits (header: 60, body: 1024)

### Issue: Webhook Not Received
**Solution:**
- Verify webhook URL is publicly accessible
- Check HTTPS certificate is valid
- Ensure webhook verify token matches
- Test signature validation logic

### Issue: Messages Not Sending
**Solution:**
- Check template is APPROVED
- Verify WhatsApp account connected
- Check kill-switch status
- Review rate limits
- Check campaign status

---

## 🎯 Next Steps After PASS

Once all tests pass:

1. **Generate Production Build**
   ```bash
   npm run build
   ```

2. **Run Production Build Locally**
   ```bash
   npm run start
   ```

3. **Deploy to Production**
   - Set up production database
   - Configure environment variables
   - Deploy to hosting platform
   - Configure domain and SSL
   - Set up webhook URL in Meta

4. **Post-Deployment Verification**
   - Test all flows in production
   - Monitor error logs
   - Verify webhook events
   - Check database connections

---

## 📞 Support

If you encounter issues during validation:

1. Check error logs in console
2. Review database for error details
3. Verify Meta API responses
4. Check webhook event logs
5. Review audit logs for actions

---

**Last Updated:** December 2024  
**Version:** 1.0 (Phase 4 Complete)
