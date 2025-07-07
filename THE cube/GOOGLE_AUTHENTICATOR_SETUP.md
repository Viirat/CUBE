# Google Authenticator 2FA Setup Guide for CUBE

## Overview

This guide explains how to set up and use Google Authenticator (TOTP - Time-based One-Time Password) two-factor authentication in your CUBE application.

## What is Google Authenticator 2FA?

Google Authenticator is a software-based authenticator that implements two-step verification services using the Time-based One-Time Password Algorithm (TOTP). It generates 6-digit codes that change every 30 seconds, providing an additional layer of security beyond just a password.

## Features Implemented

### ✅ **Core 2FA Functionality**
- QR code generation for easy setup
- Manual secret key entry option
- TOTP code generation and verification
- Time tolerance (±90 seconds) for clock drift
- Secure secret storage in localStorage

### ✅ **User Interface**
- 2FA setup modal with step-by-step instructions
- 2FA verification modal for login
- User profile with 2FA status indicator
- Enable/disable 2FA options
- Copy secret key to clipboard

### ✅ **Security Features**
- Base32 encoded secrets
- HMAC-SHA1 algorithm for TOTP
- Time-based validation
- Secure code verification

## How to Use

### For Users:

1. **Enable 2FA:**
   - Log in to your account
   - Click "Enable 2FA" in your user profile
   - Scan the QR code with Google Authenticator app
   - Enter the 6-digit code to verify setup

2. **Login with 2FA:**
   - Sign in with Google OAuth
   - If 2FA is enabled, enter the 6-digit code
   - Access your account

3. **Disable 2FA:**
   - Go to your user profile
   - Click "Disable 2FA"
   - Confirm the action

### For Developers:

1. **Test the Integration:**
   - Open `test-2fa.html` in your browser
   - Generate test secrets and verify functionality
   - Test time tolerance and code generation

2. **Customize the Implementation:**
   - Modify secret generation in `generateTOTPSecret()`
   - Adjust time tolerance in `verifyTOTP()`
   - Customize UI elements in CSS

## Technical Implementation

### Libraries Used:
- **QRCode.js**: For generating QR codes
- **CryptoJS**: For cryptographic operations

### Key Functions:

```javascript
// Generate TOTP secret
generateTOTPSecret(userEmail)

// Generate TOTP code
generateTOTP(secret, time)

// Verify TOTP code
verifyTOTP(secret, code)

// Setup 2FA for user
setupTwoFA(userEmail)

// Verify 2FA during login
verifyLoginTwoFA()
```

### Security Considerations:

1. **Secret Storage**: Currently stored in localStorage (consider server-side storage for production)
2. **Time Synchronization**: 90-second tolerance for clock drift
3. **Code Validation**: 6-digit numeric codes only
4. **QR Code Security**: Uses standard otpauth:// URL format

## Testing

### Test Page Features:
- Generate test secrets
- Create QR codes
- Verify TOTP codes
- Test time tolerance
- Configuration status checks

### Manual Testing Steps:
1. Open `test-2fa.html`
2. Generate a test secret
3. Scan QR code with Google Authenticator
4. Verify codes match
5. Test time tolerance

## Production Considerations

### Security Enhancements:
1. **Server-side Storage**: Move secrets to secure database
2. **Encryption**: Encrypt secrets at rest
3. **Rate Limiting**: Prevent brute force attacks
4. **Backup Codes**: Provide recovery options
5. **Audit Logging**: Track 2FA events

### User Experience:
1. **Recovery Options**: Email/SMS backup codes
2. **Device Management**: Multiple device support
3. **Grace Period**: Allow users to disable 2FA temporarily
4. **Education**: Provide clear setup instructions

## Troubleshooting

### Common Issues:

1. **QR Code Not Scanning:**
   - Ensure good lighting
   - Check QR code size and quality
   - Try manual entry instead

2. **Codes Not Matching:**
   - Check device time synchronization
   - Verify secret key entry
   - Wait for next 30-second cycle

3. **Verification Failing:**
   - Ensure 6-digit code entry
   - Check for extra spaces
   - Verify time tolerance settings

### Debug Steps:
1. Use `test-2fa.html` to verify functionality
2. Check browser console for errors
3. Verify library loading
4. Test with known good secret

## Integration with Google OAuth

The 2FA system integrates seamlessly with Google OAuth:

1. **Login Flow:**
   - User signs in with Google
   - If 2FA is enabled, show verification modal
   - Complete login after 2FA verification

2. **Setup Flow:**
   - User must be logged in via Google OAuth
   - 2FA setup uses Google account email
   - QR code includes Google account information

## Browser Compatibility

### Supported Browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Required Features:
- Web Crypto API (for secure random generation)
- ArrayBuffer support
- BigInt support (for time calculations)

## Performance Considerations

### Optimizations:
1. **QR Code Generation**: Only generate when needed
2. **Code Updates**: Use intervals for real-time updates
3. **Memory Management**: Clear intervals on page unload
4. **Caching**: Cache generated codes briefly

### Monitoring:
1. **Setup Success Rate**: Track 2FA adoption
2. **Verification Failures**: Monitor for issues
3. **User Feedback**: Collect setup experience data

## Future Enhancements

### Planned Features:
1. **Multiple 2FA Methods**: SMS, email, hardware tokens
2. **Advanced Security**: Biometric authentication
3. **Admin Panel**: 2FA management for administrators
4. **Analytics**: 2FA usage and security metrics

### Integration Opportunities:
1. **Backend API**: Server-side validation
2. **Mobile App**: Native 2FA support
3. **Third-party Services**: Auth0, Firebase Auth
4. **Enterprise Features**: SSO integration

## Support

For technical support:
- Check the test page for functionality
- Review browser console for errors
- Verify library dependencies
- Test with different devices and browsers

For security questions:
- Review OAuth 2.0 and TOTP standards
- Consult security best practices
- Consider professional security audit

## Resources

- [Google Authenticator](https://github.com/google/google-authenticator)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [QR Code Standards](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
- [CryptoJS Documentation](https://cryptojs.gitbook.io/docs/)
- [QRCode.js Documentation](https://github.com/davidshimjs/qrcodejs) 