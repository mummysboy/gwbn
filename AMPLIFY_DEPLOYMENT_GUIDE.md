# 🚀 AWS Amplify Deployment Guide

## ✅ Security Fixes Applied

Your Next.js app has been secured for AWS Amplify deployment. All critical security vulnerabilities have been fixed:

### 🔒 **Security Issues Fixed**
- ✅ **Client-side exposure of AWS credentials** - Fixed in `src/lib/aws-config.ts`
- ✅ **Server-only variables exposed to client** - Fixed in `src/lib/s3-service.ts` and `src/lib/aws-services.ts`
- ✅ **Improper environment variable usage** - Fixed in `src/app/publish/page.tsx`
- ✅ **Missing Amplify configuration** - Added `amplify.yml`

### 📁 **New Files Created**
- `amplify.yml` - Amplify build configuration
- `src/lib/server-aws-config.ts` - Server-only AWS configuration
- `src/lib/client-config.ts` - Client-safe configuration
- `src/app/api/env-check/route.ts` - Environment variable audit endpoint
- `src/components/debug/EnvClientProbe.tsx` - Client-side environment testing component

## 🔧 Required Environment Variables in Amplify Console

### **Step 1: Set Environment Variables in Amplify Console**

1. Go to your Amplify app dashboard
2. Navigate to **App settings** → **Environment variables**
3. Add these variables:

```bash
# AWS Configuration (Server-only - DO NOT prefix with NEXT_PUBLIC_)
REGION=us-west-1
ACCESS_KEY_ID=your_access_key_here
SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Tables (Server-only)
ARTICLES_TABLE=gwbn-articles
USERS_TABLE=gwbn-users
ANALYTICS_TABLE=gwbn-analytics

# API Keys (Server-only)
OPENAI_API_KEY=your_openai_api_key_here

# Database (Server-only)
DATABASE_URL=postgresql://username:password@host:port/database

# Public Configuration (Client-safe - MUST prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_NAME=Golden West Business News
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_S3_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_S3_REGION=us-west-1
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com

# Optional Cognito (Client-safe)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
```

### **Step 2: Create DynamoDB Tables**

Run this command to create the required tables:

```bash
npm run setup-db
```

Or create them manually in AWS Console:
- `gwbn-articles`
- `gwbn-users`
- `gwbn-analytics`

## 🧪 Testing Your Deployment

### **1. Environment Variable Audit**
Visit: `https://your-domain.com/api/env-check`

This endpoint will show you:
- ✅ Which environment variables are properly set
- ✅ Security analysis (no secrets exposed to client)
- ✅ Platform detection (Amplify hosting)
- ✅ Recommendations for missing variables

### **2. Client-Side Environment Testing**
Add the debug component to any page:

```tsx
import EnvClientProbe from '@/components/debug/EnvClientProbe';

export default function TestPage() {
  return <EnvClientProbe />;
}
```

### **3. Test API Endpoints**
- Articles: `https://your-domain.com/api/articles`
- Users: `https://your-domain.com/api/users`
- Environment check: `https://your-domain.com/api/env-check`

## 🔄 Deployment Process

### **1. Commit Your Changes**
```bash
git add .
git commit -m "Fix environment variable security for Amplify deployment"
git push origin main
```

### **2. Amplify Auto-Deploy**
Amplify will automatically:
- Detect the `amplify.yml` file
- Install dependencies with `npm install`
- Build the app with `npm run build`
- Deploy to your domain

### **3. Monitor Build Logs**
Check Amplify Console → **Build history** for any errors.

## 🚨 Important Security Notes

### **✅ What's Now Secure**
- AWS credentials are never exposed to client-side JavaScript
- Server-only variables are properly separated from client-safe variables
- Environment variables follow Next.js best practices
- Proper runtime detection prevents client/server confusion

### **🔒 Security Best Practices Applied**
- Server-only configuration in `src/lib/server-aws-config.ts`
- Client-safe configuration in `src/lib/client-config.ts`
- Runtime checks prevent client-side access to server secrets
- Proper TypeScript interfaces for type safety

## 🐛 Troubleshooting

### **Issue: "AWS DynamoDB client not configured"**
**Solution**: Set `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` in Amplify Console

### **Issue: "S3 bucket name not configured"**
**Solution**: Set `NEXT_PUBLIC_S3_BUCKET_NAME` in Amplify Console

### **Issue: Environment variables not working**
**Solution**: 
1. Check Amplify Console → Environment variables are set
2. Verify variable names match exactly (case-sensitive)
3. Ensure server-only variables don't have `NEXT_PUBLIC_` prefix
4. Ensure client variables have `NEXT_PUBLIC_` prefix

### **Issue: Build fails**
**Solution**:
1. Check build logs in Amplify Console
2. Verify all required environment variables are set
3. Ensure `amplify.yml` is in the root directory

## 📋 Post-Deployment Checklist

- [ ] Environment variables set in Amplify Console
- [ ] DynamoDB tables created
- [ ] Build successful in Amplify Console
- [ ] Environment audit endpoint working (`/api/env-check`)
- [ ] Articles API working (`/api/articles`)
- [ ] Users API working (`/api/users`)
- [ ] Client-side environment detection working
- [ ] No console errors in browser

## 🎯 Next Steps

1. **Deploy**: Push changes to trigger Amplify build
2. **Test**: Use the debug endpoints to verify everything works
3. **Monitor**: Check Amplify Console for any issues
4. **Remove Debug**: Consider removing debug components in production

## 📞 Support

If you encounter issues:
1. Check the environment audit endpoint: `/api/env-check`
2. Review Amplify build logs
3. Verify environment variables are set correctly
4. Test individual API endpoints

Your app is now secure and ready for AWS Amplify deployment! 🚀
