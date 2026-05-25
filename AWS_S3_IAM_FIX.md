# AWS S3 IAM Policy Fix Guide

## Problem
Your IAM user `s3-vishal` (ARN: `arn:aws:iam::809338888361:user/s3-vishal`) has an **explicit deny** on `s3:DeleteObject`, preventing image cleanup during updates.

**Error observed in Render logs:**
```
User: arn:aws:iam::809338888361:user/s3-vishal is not authorized to perform: s3:DeleteObject 
on resource: "arn:aws:s3:::vishal-music-bucket/..." 
with an explicit deny in an identity-based policy
```

## Solution

### Option 1: Remove Explicit Deny (Recommended)

1. **Go to AWS IAM Console:**
   - URL: https://console.aws.amazon.com/iam/
   - Navigate to **Users** → **s3-vishal**

2. **Check for inline or attached policies:**
   - Click **Permissions** tab
   - Look for a policy with `"Effect": "Deny"` and `"s3:DeleteObject"`
   - Note: Explicit denies override allows, so this must be removed or replaced

3. **Fix the policy:**
   - **If it's an inline policy:** Edit it and remove the Deny statement
   - **If it's an attached policy:** Detach it and create a new one with correct permissions (see below)

4. **Required S3 permissions for `s3-vishal`:**
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

5. **Verify no Deny statements exist:**
   - Ensure there are **no inline policies** with `"Effect": "Deny"`
   - Check **attached managed policies** — unattach any that deny S3 actions

---

### Option 2: Create a New IAM User (If Fixing Current User Fails)

1. Create a new IAM user `s3-vishal-fixed` with the above Allow-only policy
2. Generate new access keys
3. Update Render environment variables:
   ```
   AWS_ACCESS_KEY_ID=<new-access-key>
   AWS_SECRET_ACCESS_KEY=<new-secret-key>
   ```
4. Restart the Render service

---

## Verification

After fixing the policy, test with:

```bash
# From your local machine or Render shell
aws s3 ls s3://vishal-music-bucket/ --recursive

# Try deleting a test file (you can re-upload if needed)
aws s3 rm s3://vishal-music-bucket/test-file.txt
```

Expected output: **No AccessDenied errors**

---

## What Changed in Code

**Before:** Image deletion errors would cause operations to fail.  
**After:** Image deletion errors are logged as warnings; operations complete successfully. This prevents user workflows from breaking, but orphan files may accumulate in S3.

Once you fix the IAM policy, deletion will work automatically for all future image updates/deletes.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting AccessDenied after fix | Clear browser cache, restart Render service via `Ctrl+R` in dashboard |
| Can't find the Deny policy | Check for **Resource-based policies** on the bucket itself (less common) |
| Not sure which policy has Deny | Export all user policies from IAM console and search for `"Effect": "Deny"` |

---

## References

- [AWS IAM Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [S3 PutObject vs DeleteObject Permissions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security_iam_service-with-iam.html)
