const API_BASE_URL = 'https://inventabot-proxy-backend.vercel.app/api/auth';

// [MODIFIED FOR PERSONAL USE - Developer Mode]
// Always returns logged in with permanent license until 2030-01-01
export async function checkAuthCode(code) {
  console.log('checkAuthCode called - returning permanent license (Developer Mode)');
  
  // Always return success with expiry date of 2030-01-01
  const permanentExpiry = '2030-01-01T00:00:00.000Z';
  return {
    success: true,
    expiry: permanentExpiry,
    daysRemaining: 9999,
    message: 'Developer Mode - Permanent License Active'
  };
}
