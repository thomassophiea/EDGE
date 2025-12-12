# WLAN Creation Debugging Guide

## Problem: "WLAN not assigned anywhere after creation"

### Quick Fix
1. **Hard refresh your browser**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache** if hard refresh doesn't work
3. **Check Railway deployment** - Latest commit should be `27a15c7`

### Diagnostic Checklist

#### 1. Verify UI is Updated
Open Create WLAN dialog. You should see:
- [ ] Site selection with checkboxes
- [ ] After selecting a site, a "Discovering profiles..." loader appears
- [ ] "Deployment Configuration" section with 3 radio button options:
  - "All Profiles at Site" (default)
  - "Specific Profiles Only"
  - "All Except Selected"
- [ ] "Deployment Preview" card showing profile counts
- [ ] Submit button should say "Create & Deploy WLAN"

**If you DON'T see these**, your browser has cached the old version.

#### 2. Check Browser Console During Creation
1. Open DevTools (F12)
2. Go to Console tab
3. Create a WLAN
4. Look for these log messages:
```
[WLANAssignment] Starting site-centric deployment workflow
[WLANAssignment] Step 1: Validating site assignments...
[WLANAssignment] Step 2: Discovering profiles for sites...
[WLANAssignment] Step 3: Calculating effective profile sets...
[WLANAssignment] Step 4: Creating service...
[WLANAssignment] Step 5: Assigning service to profiles...
[WLANAssignment] Step 6: Saving assignment tracking data...
```

**If you see errors**, screenshot them and share.

#### 3. Verify Profiles Are Discovered
After selecting a site in Create WLAN dialog, check console for:
```
Discovered profiles for 1 sites
```

**If you see "0 profiles"**, the site has no device groups or profiles.

#### 4. Check Assignment Storage
After creating a WLAN, open browser console and run:
```javascript
// Check site assignments
console.log(JSON.parse(localStorage.getItem('wlan_site_assignments') || '[]'))

// Check profile assignments
console.log(JSON.parse(localStorage.getItem('wlan_profile_assignments') || '[]'))
```

**Expected output**: Arrays with assignment objects

#### 5. Verify Deployment Status
In Sites view, click on a site with WLANs. You should see:
- [ ] WLANs listed with "Expected" and "Actual" profile counts
- [ ] Warning icons for mismatches
- [ ] "Reconcile" button per WLAN
- [ ] Mismatch alert banner if issues detected

### Common Issues

#### Issue: "No deployment mode selector visible"
**Cause**: Browser cached old CreateWLANDialog
**Fix**: Hard refresh (Ctrl+Shift+R)

#### Issue: "0 profiles discovered"
**Cause**: Site has no device groups or profiles
**Fix**:
1. Go to Sites view
2. Click the site
3. Verify it shows profiles in the "Profile WLAN Assignments" section
4. If no profiles, the site needs device groups/profiles created first

#### Issue: "WLAN created but 0 profiles assigned"
**Cause**: Effective set calculation resulted in empty list
**Fix**: Check deployment mode - if "Specific Profiles Only" was selected with 0 profiles chosen, nothing will be assigned

#### Issue: "Success toast but assignments don't persist"
**Cause**: LocalStorage quota exceeded or disabled
**Fix**: Check browser console for localStorage errors

### What Should Happen (Happy Path)

1. **Click "Create WLAN"**
2. **Fill in SSID, security, etc.**
3. **Select at least one site** → Loader appears: "Discovering profiles..."
4. **After discovery completes** → "Deployment Configuration" section appears
5. **Default mode**: "All Profiles at Site" (pre-selected)
6. **Deployment Preview** shows: "X profiles will receive WLAN"
7. **Click "Create & Deploy WLAN"**
8. **Success toast**: "WLAN Created Successfully - Assigned to X profile(s) across Y site(s)"
9. **Verify in Sites view**: Click the site → See WLAN listed with Expected/Actual counts

### Verify Latest Deployment

Check Railway deployment log for:
```
Commit: 27a15c7
Build: ✓ 2489 modules transformed
Bundle: index-B24VrXPU.js (716.91 KB)
```

### If Still Not Working

Run this in browser console to dump full diagnostic info:
```javascript
console.log('=== WLAN Creation Diagnostic ===');
console.log('1. Site Assignments:', localStorage.getItem('wlan_site_assignments'));
console.log('2. Profile Assignments:', localStorage.getItem('wlan_profile_assignments'));
console.log('3. Bundle Hash:', document.querySelector('script[src*="index-"]')?.src);
console.log('4. App Version:', document.title);
```

Screenshot the output and share.
