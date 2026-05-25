# Image Upload & Deletion Troubleshooting Guide

## Summary

Images **upload successfully** to S3, but **deletion** is blocked by an IAM permission issue. This prevents cleanup when you:
- Update a service/gallery/staff with a new image
- Delete a service/gallery/staff item
- Update a user profile picture

When deletion fails, orphaned files accumulate in S3 but don't block user workflows (thanks to fallback error handling).

---

## Problem Diagnosis

### Symptoms

1. **S3 Delete Warnings in Render logs:**
   ```
   ⚠️ S3 Delete Warning: {
     code: 'AccessDenied',
     message: 'User: arn:aws:iam::809338888361:user/s3-vishal is not authorized to perform: 
              s3:DeleteObject on resource: "arn:aws:s3:::vishal-music-bucket/..." 
              with an explicit deny in an identity-based policy'
   }
   ```

2. **Files accumulate in S3:**
   - Visit AWS S3 console → `vishal-music-bucket`
   - You see old image files that should have been deleted

3. **Frontend works normally:**
   - No visible errors to users
   - Image uploads complete successfully
   - New images display correctly

### Root Cause

Your IAM user `s3-vishal` has:
- ✓ `s3:PutObject` — can upload
- ✗ `s3:DeleteObject` — **explicitly denied** (prevented from deleting)

This is due to an **explicit deny** in the IAM policy, which overrides any Allow.

---

## Solution: Fix IAM Permissions

### Step 1: Check Current Endpoint for Diagnostics

Test if the diagnostics endpoint is working:

```bash
# Check S3 delete failures
curl -X GET https://your-render-app.onrender.com/api/system/diagnostics/s3-failures

# Expected response:
{
  "success": true,
  "count": 5,
  "failures": [
    {
      "timestamp": "2026-05-25T10:30:45.123Z",
      "key": "services/1779375479639-xxxxx.png",
      "reason": "User: arn:aws:iam::809338888361:user/s3-vishal...",
      "code": "AccessDenied"
    }
  ],
  "recommendation": "IAM policy does not allow s3:DeleteObject..."
}

# Check overall health
curl -X GET https://your-render-app.onrender.com/api/system/health
```

### Step 2: Update IAM Policy in AWS Console

1. **Go to AWS IAM:**
   - URL: https://console.aws.amazon.com/iam/
   - Click **Users** → Search for `s3-vishal`

2. **Inspect Permissions:**
   - Click the **s3-vishal** user
   - Go to **Permissions** tab
   - Expand each policy listed
   - Look for a policy with `"Effect": "Deny"` and `"s3:DeleteObject"`

3. **Remove or Fix the Deny:**
   - If it's an **inline policy:**
     - Click **Edit**
     - Remove the Deny statement entirely
     - Save
   - If it's a **managed policy:**
     - Detach it
     - Attach a corrected policy (see below)

4. **Correct S3 Policy to Attach:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "S3ParlouBucketAccess",
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:GetObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::vishal-music-bucket",
           "arn:aws:s3:::vishal-music-bucket/*"
         ]
       }
     ]
   }
   ```

### Step 3: Test the Fix

1. **Verify policy is updated:**
   ```bash
   aws s3 ls s3://vishal-music-bucket/ --recursive
   ```
   Should work without AccessDenied errors.

2. **Clear the diagnostic log:**
   ```bash
   curl -X POST https://your-render-app.onrender.com/api/system/diagnostics/clear-s3-failures
   ```

3. **Test a delete operation in your app:**
   - Upload an image to a service/gallery
   - Update that service with a new image (forces old image deletion)
   - Check logs: Should see `✓ S3 image deleted` instead of warnings

4. **Verify no new failures:**
   ```bash
   curl -X GET https://your-render-app.onrender.com/api/system/diagnostics/s3-failures
   
   # Should return count: 0
   ```

---

## Monitoring S3 Cleanup

### Available Diagnostics Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/system/health` | GET | Overall system health |
| `/api/system/diagnostics/s3-failures` | GET | Last 100 S3 delete failures |
| `/api/system/diagnostics/clear-s3-failures` | POST | Clear failure log |

### Example Monitoring Script

```bash
#!/bin/bash
# Check for S3 delete failures every 5 minutes

APP_URL="https://your-render-app.onrender.com"

while true; do
  RESPONSE=$(curl -s "$APP_URL/api/system/diagnostics/s3-failures")
  COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
  
  if [ "$COUNT" -gt 0 ]; then
    echo "⚠️ S3 failures detected: $COUNT"
    echo "$RESPONSE" | grep -o '"key":"[^"]*"'
  else
    echo "✓ No S3 failures ($(date))"
  fi
  
  sleep 300 # Check every 5 minutes
done
```

---

## What Changed in Code

1. **`backend/src/config/s3.js`:**
   - Added `deleteFailures` tracker (stores last 100 failures)
   - `deleteFromS3()` logs AccessDenied without throwing
   - Exported `getS3DeleteFailures()` and `clearS3DeleteFailures()`

2. **`backend/src/routes/systemRoutes.js`:**
   - New route: `GET /api/system/health` → System status
   - New route: `GET /api/system/diagnostics/s3-failures` → Recent failures
   - New route: `POST /api/system/diagnostics/clear-s3-failures` → Clear log

3. **`backend/server.js`:**
   - Registered systemRoutes at `/api/system`

---

## Quick Checklist

- [ ] Read AWS S3 IAM fix guide: `AWS_S3_IAM_FIX.md`
- [ ] Log in to AWS IAM console
- [ ] Find and remove the explicit Deny for s3:DeleteObject
- [ ] Test the diagnostics endpoint
- [ ] Upload → Update → Delete a test service to verify cleanup works
- [ ] Clear the diagnostic log once fixed
- [ ] Monitor `/api/system/health` for ongoing status

---

## Still Having Issues?

1. **Policy appears fixed but still getting AccessDenied?**
   - AWS policies can take 5-15 minutes to propagate
   - Restart the Render app (Settings → Manual Deploy)

2. **Can't find the Deny policy in IAM?**
   - Check if it's a **resource-based policy** on the bucket itself
   - Go to S3 Bucket → Permissions → Bucket Policy
   - Search for "Deny" and look for the s3-vishal user ARN

3. **Want to use a different AWS user?**
   - Create a new IAM user with correct permissions
   - Update Render env vars: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Restart the app

---

## References

- [AWS IAM Explicit Deny](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [S3 IAM Actions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security_iam_service-with-iam.html)
- [Render Environment Variables](https://render.com/docs/environment-variables)
